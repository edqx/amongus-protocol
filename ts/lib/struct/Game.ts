import { EventEmitter } from "events";

import {
    AmongusClient,
    AnyObject
} from "../Client.js";
import { AlterGameTag, MessageID, PacketID, PayloadID, RPCID, SpawnID, TaskID } from "../constants/Enums.js";
import { GameOptionsData } from "../interfaces/Packets.js";

import { Component } from "./components/Component.js";
import { PlayerControl } from "./components/PlayerControl.js";

import { GameData } from "./objects/GameData.js";
import { GameObject } from "./objects/GameObject.js";
import { PlayerClient } from "./PlayerClient.js";

export interface Game {
    on(event: "spawn", listener: (object: GameObject) => void);
    on(event: "playerJoin", listener: (client: PlayerClient) => void);
    on(event: "playerLeave", listener: (client: PlayerClient) => void);
    on(event: "startCount", listener: (count: number) => void);
    on(event: "start", listener: () => void);
    on(event: "finish", listener: () => void);
    on(event: "setImposters", listener: (imposters: PlayerClient[]) => void);
    on(event: "vote", listener: (voter: PlayerClient, suspect: PlayerClient) => void);
    on(event: "votingComplete", listener: (skipped: boolean, tie: boolean, exiled: PlayerClient) => void);
    on(event: "murder", listener: (murderer: PlayerClient, target: PlayerClient) => void);
    on(event: "startMeeting", listener: (emergency: boolean, target: PlayerClient) => void);
    on(event: "sync", listener: (settings: GameOptionsData) => void);
    on(event: "visibility", listener: (visibility: "private"|"public") => void);
}

export class Game extends GameObject {
    ip: string;
    port: number;
    
    code: number;
    hostid: number;

    clients: Map<number, PlayerClient>;
    netcomponents: Map<number, Component>;

    instantiated: number;

    startCount: number;
    startCounterSeq: number;
    started: boolean;
    imposters: PlayerClient[];

    options: GameOptionsData;
    visibility: "private"|"public";

    constructor(protected client: AmongusClient, ip: string, port: number, code: number, hostid: number, clients: number[]) {
        super(client, client);

        this.ip = ip;
        this.port = port;

        this.code = code;
        this.hostid = hostid;

        this.clients = new Map;
        this.netcomponents = new Map;

        this.instantiated = Date.now();

        this.startCount = -1;
        this.startCounterSeq = null;
        this.started = false;
        this.imposters = [];

        this.options = null;
        this.visibility = "private";
        
        clients.forEach(clientid => {
            this.clients.set(clientid, new PlayerClient(client, clientid));
        });
    }

    get age() {
        return Math.floor((Date.now() - this.instantiated) / 1000);
    }

    addChild(object: GameObject) {
        super.addChild(object);
        
        this.registerComponents(object);
        this.emit("spawn", object);
    }

    get GameData(): GameData {
        return this.children.find(child => child instanceof GameData) as GameData;
    }
    
    _syncSettings(options: GameOptionsData) {
        this.options = options;
        this.emit("sync", this.options);
    }

    async syncSettings(options: GameOptionsData) {
        if (this.client.clientid === this.hostid) {
            await this.client.send({
                op: PacketID.Reliable,
                payloads: [
                    {
                        payloadid: PayloadID.GameData,
                        code: this.code,
                        parts: [
                            {
                                type: MessageID.RPC,
                                handlerid: this.host.Player.PlayerControl.netid,
                                rpcid: RPCID.SyncSettings,
                                options: options
                            }
                        ]
                    }
                ]
            });
        }

        this._syncSettings(options);
    }

    _setImposters(imposters: number[]) {
        this.imposters = imposters.map(imposter => this.getPlayer(imposter));
        this.emit("setImposters", this.imposters);
    }

    async setImposters(imposters: number[]) {
        if (this.client.clientid === this.hostid) {
            await this.client.send({
                op: PacketID.Reliable,
                payloads: [
                    {
                        payloadid: PayloadID.GameData,
                        code: this.code,
                        parts: [
                            {
                                type: MessageID.RPC,
                                handlerid: this.host.Player.PlayerControl.netid,
                                rpcid: RPCID.SetInfected,
                                count: imposters.length,
                                infected: imposters
                            }
                        ]
                    }
                ]
            });
        }

        this._setImposters(imposters);
    }

    _setVisibility(visibility: "private"|"public") {
        this.visibility = visibility;
        this.emit("visibility", visibility);
    }

    async setVisibility(visibility: "private"|"public") {
        if (this.client.clientid === this.hostid) {
            await this.client.send({
                op: PacketID.Reliable,
                payloads: [
                    {
                        payloadid: PayloadID.AlterGame,
                        code: this.code,
                        tag: AlterGameTag.ChangePrivacy,
                        is_public: visibility === "public"
                    }
                ]
            });
        }

        this._setVisibility(visibility);
    }

    _start() {
        this.started = true;

        this.emit("start");
    }

    _finish() {
        this.started = false;
        
        this.emit("finish");
    }

    registerComponents(object: GameObject) {
        const components = Object.keys(object.components);

        for (let i = 0; i < components.length; i++) {
            const component = object.components[components[i]];

            this.netcomponents.set(component.netid, component);
        }
    }

    getComponentsByClassName(classname: string) {
        const components: Component[] = [];

        for (let [netid, component] of this.netcomponents) {
            if (component.classname === classname) {
                components.push(component);
            }
        }
        
        return components.length ? components : null;
    }

    findPlayer(username: string) {
        for (let [clientid, client] of this.clients) {
            if (!client.Player || client.removed) continue;

            const playerData = this.GameData.GameData.players.get(client.Player.PlayerControl.playerId);
            
            if (playerData && playerData.name === username) {
                return client;
            }
        }

        return null;
    }

    getPlayer(playerid: number) {
        for (let [clientid, client] of this.clients) {
            if (!client.Player || client.removed) continue;

            if (client.Player.PlayerControl.playerId === playerid) {
                return client;
            }
        }

        return null;
    }

    getPlayerByNetID(netid: number) {
        for (let [clientid, client] of this.clients) {
            if (!client.Player || client.removed) continue;

            if (client.Player.PlayerControl.netid === netid) {
                return client;
            }
        }

        return null;
    }

    get host() {
        return this.clients.get(this.hostid);
    }

    get me() {
        return this.clients.get(this.client.clientid);
    }
}