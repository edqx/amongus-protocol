import { ClientOptions } from "./interfaces/ClientOptions.js"
import { BufferReader } from "./util/BufferReader.js"

import { parsePacket } from "./Parser.js"
import { composePacket } from "./Compose.js"

import dgram from "dgram"
import util from "util"
import { EventEmitter } from "events"
import { Packet, Payload, PayloadPacket } from "./interfaces/Packets.js"
import { DisconnectID, LanguageID, MapID, MessageID, PacketID, PayloadID, SpawnID } from "./constants/Enums.js"
import { DisconnectMessages } from "./constants/DisconnectMessages.js"
import { runInThisContext } from "vm"
import { Code2Int } from "./util/codes.js"
import { Game } from "./struct/Game.js"
import { ppid } from "process"
import { bitfield } from "./interfaces/Types.js"
import { JoinOptions } from "./interfaces/JoinOptions.js"

import { Player } from "./struct/Player.js"
import { GameData } from "./struct/GameData.js"

import { Component } from "./struct/components/Component.js"
import { PlayerClient } from "./struct/PlayerClient.js"

export declare interface AmongusClient {
    on(event: "packet", listener: (packet: Packet) => void);
    off(event: "packet", listener: (packet: Packet) => void);
    on(event: "disconnect", listener: () => void);
    off(event: "disconnect", listener: () => void);
    on(event: "connected", listener: () => void);
    off(event: "connected", listener: () => void);
}

export type AnyObject = Player | GameData;

export class AmongusClient extends EventEmitter {
    options: ClientOptions;
    socket: dgram.Socket;
    ip: string;
    port: number;
    nonce: number;
    username: string;

    netobjects: Map<number, Component>;
    gameobjects: Map<number, AnyObject>;

    game: Game;
    clientid: number;

    constructor (options: ClientOptions = {}) {
        super();

        this.options = options;
        this.nonce = 1;

        this.netobjects = new Map;
        this.gameobjects = new Map;

        this.game = null;
    }

    debug(...fmt) {
        if (this.options.debug) {
            console.log(...fmt);
        }
    }

    registerComponents(object: AnyObject) {                          
        const components = Object.keys(object.components);

        for (let i = 0; i < components.length; i++) {
            const component = object.components[components[i]];

            this.netobjects.set(component.netid, component);
        }
        
    }

    _disconnect() {
        this.emit("disconnect");
        
        this.socket.removeAllListeners();

        this.socket = null;
        this.ip = null;
        this.port = null;

        this.nonce = 1;
    }

    async disconnect(reason?: number, message?: string) {
        if (reason) {
            if (reason === DisconnectID.Custom) {
                if (message) {
                    await this.send({
                        op: PacketID.Disconnect,
                        reason: reason,
                        message: message
                    });
                } else {
                    await this.send({
                        op: PacketID.Disconnect,
                        reason: reason
                    });
                }
            } else {
                await this.send({
                    op: PacketID.Disconnect,
                    reason: reason
                });
            }
        } else {
            await this.send({
                op: PacketID.Disconnect
            });
        }

        await this.awaitPacket(packet => packet.op === PacketID.Disconnect);

        this._disconnect();
    }
    
    _connect(ip: string, port: number) {
        this.socket = dgram.createSocket("udp4");
        this.ip = ip;
        this.port = port;
        
        this.nonce = 1;

        this.socket.on("message", async buffer => {
            const packet = parsePacket(buffer);

            if (packet.reliable) {
                await this.ack(packet.nonce);
            }

            if (packet.bound === "client") {
                this.debug("Recieved packet", buffer, util.inspect(packet, false, 10, true));

                switch (packet.op) {
                    case PacketID.Unreliable:
                    case PacketID.Reliable:
                        switch (packet.payloadid) {
                            case PayloadID.JoinGame:
                                switch (packet.error) {  // Couldn't get typings to work with if statements so I have to deal with switch/case..
                                    case false:
                                        if (packet.code === this.game.code) {
                                            const player = new PlayerClient(this, this.game, packet.clientid);
                                            this.game.clients.set(player.clientid, player);
                                        }
                                        break;
                                }
                                break;
                            case PayloadID.RemovePlayer:
                                if (packet.code === this.game.code) {
                                    this.game.clients.delete(packet.clientid);
                                }
                                break;
                            case PayloadID.JoinedGame:
                                this.game = new Game(this, packet.code, packet.hostid, [packet.clientid, ...packet.clients]);
                                this.clientid = packet.clientid;
                                break;
                            case PayloadID.GameData:
                            case PayloadID.GameDataTo:
                                if (this.game.code === packet.code) {
                                    for (let i = 0; i < packet.parts.length; i++) {
                                        const part = packet.parts[i];

                                        switch (part.type) {
                                            case MessageID.Data:
                                                const component = this.netobjects.get(part.netid);

                                                if (component) {
                                                    component.OnDeserialize(part.datalen, part.data);
                                                }
                                                break;
                                            case MessageID.Spawn:
                                                switch (part.spawnid) {
                                                    case SpawnID.GameData:
                                                        const gamedata = new GameData(this, part.ownerid, part.components);

                                                        this.game.emit("spawn", gamedata);
                                                        this.emit("spawn", gamedata);

                                                        this.registerComponents(gamedata);

                                                        this.gameobjects.set(part.ownerid, gamedata);
                                                        break;
                                                    case SpawnID.Player:
                                                        const playerclient = this.game.clients.get(part.ownerid);
                                                        const player = new Player(this, part.ownerid, part.components);

                                                        this.game.emit("spawn", player);
                                                        this.emit("spawn", player);
                                                        
                                                        this.registerComponents(player);
                                                        
                                                        playerclient.spawn(player);
                                                        
                                                        this.gameobjects.set(part.ownerid, player);
                                                        break;
                                                }
                                                break;
                                            case MessageID.Despawn:
                                                this.netobjects.delete(part.netid);
                                                break;
                                        }
                                    }
                                }
                                break;
                        }
                        break;
                }
            }

            this.emit("packet", packet);
        });
    }

    async connect(ip: string, port: number, username: string): Promise<boolean|number> {
        if (this.socket) {
            await this.disconnect();
        }

        this._connect(ip, port);

        if (await this.hello(username)) {
            this.emit("connected");

            return true;
        }

        return false;
    }

    _send(buffer: Buffer): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket.send(buffer, this.port, this.ip, err => {
                if (err) return reject(err);

                resolve();
            });
        });
    }

    awaitPacket(filter: (packet: Packet) => boolean): Promise<Packet|null> {
        const _this = this;

        return new Promise((resolve, reject) => {
            function onPacket(packet) {
                if (filter(packet)) {
                    _this.off("disconnect", onDisconnect);
                    _this.off("packet", onPacket);

                    resolve(packet);
                }
            }

            function onDisconnect() {
                _this.off("disconnect", onDisconnect);
                _this.off("packet", onPacket);

                resolve(null);
            }

            this.on("packet", onPacket);
            this.on("disconnect", onDisconnect);
        });
    }

    async awaitPayload(filter: (payload: PayloadPacket) => boolean): Promise<PayloadPacket|null> {
        return await this.awaitPacket(packet => {
            return (packet.op === PacketID.Unreliable || packet.op === PacketID.Reliable)
                && packet.bound === "client"
                && filter(packet);
        }) as PayloadPacket;
    }

    async send(packet: Packet): Promise<boolean> {
        const nonce = this.nonce;

        switch (packet.op) {
            case PacketID.Reliable:
            case PacketID.Hello:
            case PacketID.Ping:
                packet.reliable = true;
                packet.nonce = nonce;
                this.nonce++;
                break;
        }
        
        const composed = composePacket(packet, "server");
        
        await this._send(composed);
        
        this.debug("Sent packet", composed);

        if (packet.reliable) {
            const interval = setInterval(() => {
                this._send(composed);
            }, this.options.ackInterval || 1500);

            this.debug("Awaiting acknowledege", nonce);

            const ack = await this.awaitPacket(packet => {
                return packet.op === PacketID.Acknowledge
                    && packet.nonce === nonce;
            });
            
            this.debug("Recieved acknowledege", nonce);

            clearInterval(interval);

            return ack !== null;
        } else {
            return true;
        }
    }

    async ack(nonce: number): Promise<void> { 
        await this.send({
            op: PacketID.Acknowledge,
            nonce
        });
    }

    async hello(username: string): Promise<boolean> {
        if (await this.send({
            op: PacketID.Hello,
            username: username
        })) {
            this.username = username;
            
            return true;
        }

        return false;
    }

    async join(code: string|number, options: JoinOptions = {}): Promise<Game> {
        if (typeof code === "string") {
            return this.join(Code2Int(code));
        }

        if (this.game) {
            throw new Error("Join Error: You are already in a game. Please leave or end your current game before playing another.");
        }

        await this.send({
            op: PacketID.Reliable,
            payloadid: PayloadID.JoinGame,
            code: code,
            mapOwnership: 0x07
        });

        const packet = await Promise.race([
            this.awaitPayload(p => p.payloadid === PayloadID.Redirect),
            this.awaitPayload(p => p.payloadid === PayloadID.JoinedGame),
            this.awaitPayload(p => p.payloadid === PayloadID.JoinGame)
        ]);

        if (packet && (packet.op === PacketID.Reliable) || (packet.op === PacketID.Unreliable)) {
            if (packet.payloadid === PayloadID.Redirect) {
                await this.disconnect();

                await this.connect(packet.ip, packet.port, this.username);

                return await this.join(code);
            } else if (packet.payloadid === PayloadID.JoinedGame) {
                if (options.doSpawn ?? true) {
                    await this.send({
                        op: PacketID.Reliable,
                        payloadid: PayloadID.GameData,
                        code: packet.code,
                        parts: [
                            {
                                type: MessageID.SceneChange,
                                clientid: packet.clientid,
                                location: "OnlineGame"
                            }
                        ]
                    });
                }

                return this.game;
            } else if (packet.payloadid === PayloadID.JoinGame) {
                if (packet.bound === "client" && packet.error) {
                    throw new Error("Join error: " + packet.reason + " (" + packet.message + ")");
                }
            }
        } else {
            return null;
        }
    }
    
    async search(maps: bitfield|MapID[] = 0, imposters: number = 0, language: LanguageID = LanguageID.Any) {
        if (Array.isArray(maps)) {
            return maps.reduce((val, map) => val + (1 << map), 0);
        }
        
        await this.send({
            op: PacketID.Reliable,
            payloadid: PayloadID.GetGameListV2,
            bound: "server",
            options: {
                mapID: maps,
                imposterCount: imposters,
                language
            }
        });
    }
}