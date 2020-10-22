import { ClientOptions } from "./interfaces/ClientOptions.js"
import { BufferReader } from "./util/BufferReader.js"

import { parsePacket } from "./Parser.js"
import { composePacket } from "./Compose.js"

import dgram from "dgram"
import { EventEmitter } from "events"
import { Packet, Payload, PayloadPacket } from "./interfaces/Packets.js"
import { DisconnectID, LanguageID, PacketID, PayloadID } from "./constants/Enums.js"
import { DisconnectMessages } from "./constants/DisconnectMessages.js"
import { runInThisContext } from "vm"
import { Code2Int } from "./util/codes.js"
import { Game } from "./struct/Game.js"
import { ppid } from "process"
import { bitfield } from "./interfaces/Types.js"

export declare interface AmongusClient {
    on(event: "packet", listener: (packet: Packet) => void);
    off(event: "packet", listener: (packet: Packet) => void);
    on(event: "disconnect", listener: () => void);
    off(event: "disconnect", listener: () => void);
    on(event: "connected", listener: () => void);
    off(event: "connected", listener: () => void);
}

export class AmongusClient extends EventEmitter {
    options: ClientOptions;
    socket: dgram.Socket;
    ip: string;
    port: number;
    nonce: number;
    username: string;

    objects: Map<number, any>;

    game: Game;

    constructor (options: ClientOptions = {}) {
        super();

        this.options = options;
        this.socket = null;
        this.ip = null;
        this.port = null;
        this.nonce = 1;
        this.username = null;

        this.objects = new Map;

        this.game = null;
    }

    debug(...fmt) {
        if (this.options.debug) {
            console.log(...fmt);
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

            this.debug("Recieved packet", packet);

            this.emit("packet", packet);
        });
    }

    async connect(ip: string, port: number, username: string) {
        if (this.socket) {
            await this.disconnect();
        }

        this._connect(ip, port);

        if (await this.hello(username)) {
            this.emit("connected");
        }
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
                && filter(packet);
        }) as PayloadPacket;
    }

    async send(packet: Packet): Promise<boolean> {
        const nonce = this.nonce;

        switch (packet.op) {
            case PacketID.Reliable:
            case PacketID.Hello:
            case PacketID.Ping:
                packet.nonce = nonce;
                this.nonce++;
                break;
        }
        
        const composed = composePacket(packet, "server");
        
        await this._send(composed);
        
        this.debug("Sent packet", composed);

        if (packet.reliable) {
            const interval = setInterval(function () {
                this._send(composed);
            }, this.options.ackInterval || 1500);

            const ack = await this.awaitPacket(packet => {
                return packet.op === PacketID.Acknowledge
                    && packet.nonce === nonce;
            });

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

    async join(code: string|number) {
        if (typeof code === "string") {
            return this.join(Code2Int(code));
        }

        await this.send({
            op: PacketID.Reliable,
            payloadid: PayloadID.JoinGame,
            bound: "server",
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

            } else if (packet.payloadid === PayloadID.JoinGame) {

            }
        } else {
            return false;
        }
    }
    
    async search(map: bitfield = 0, imposters: number = 0, language: LanguageID = LanguageID.Any) {
        await this.send({
            op: PacketID.Reliable,
            payloadid: PayloadID.GameList,
            bound: "server",
            options: {
                
            }
        })
    }
}