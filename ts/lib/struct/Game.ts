import { EventEmitter } from "events";

import {
    AmongusClient,
    AnyObject
} from "../Client.js";
import { MessageID, PacketID, PayloadID, RPCID, TaskID } from "../constants/Enums.js";

import { Component } from "./components/Component.js";
import { PlayerControl } from "./components/PlayerControl.js";

import { GameData } from "./GameData.js";
import { PlayerClient } from "./PlayerClient.js";

export interface Game {
    on(event: "spawn", listener: (object: AnyObject) => void);
    on(event: "playerJoin", listener: (client: PlayerClient) => void);
    on(event: "playerLeave", listener: (client: PlayerClient) => void);
    on(event: "startCount", listener: (count: number) => void);
    on(event: "start", listener: () => void);
    on(event: "finish", listener: () => void);
    on(event: "setImposters", listener: (imposters: PlayerClient[]) => void);
    on(event: "vote", listener: (voter: PlayerClient, suspect: PlayerClient) => void);
    on(event: "votingComplete", listener: (skipped: boolean, tie: boolean, exiled: PlayerClient) => void);
    on(event: "murder", listener: (murderer: PlayerClient, target: PlayerClient) => void);
    on(event: "meeting", listener: (emergency: boolean, target: PlayerControl) => void);
}

export class Game extends EventEmitter {
    clients: Map<number, PlayerClient>;
    components: Map<number, Component>;
    gameobjects: Map<number, AnyObject>;

    GameData: GameData;

    startCount: number;
    startCounterSeq: number;

    started: boolean;

    imposters: PlayerClient[];

    constructor(private client: AmongusClient, public code: number, public hostid: number, clients: number[]) {
        super();

        this.clients = new Map;

        this.components = new Map;
        this.gameobjects = new Map;

        this.startCounterSeq = null;

        this.started = false;

        this.imposters = [];
        
        clients.forEach(clientid => {
            this.clients.set(clientid, new PlayerClient(client, this, clientid));
        });

        this.GameData = new GameData(client, this);
    }

    async setImposters(imposters: number[]) {
        if (this.client.clientid === this.hostid) {
            await this.client.send({
                op: PacketID.Reliable,
                payloadid: PayloadID.GameData,
                code: this.code,
                parts: [
                    {
                        type: MessageID.RPC,
                        handlerid: this.host.PlayerControl.netid,
                        rpcid: RPCID.SetInfected,
                        count: imposters.length,
                        infected: imposters
                    }
                ]
            });
        }

        this.imposters = imposters.map(imposter => this.getPlayer(imposter));
        this.emit("setImposters", this.imposters);
    }

    registerComponents(object: AnyObject) {
        const components = Object.keys(object.components);

        for (let i = 0; i < components.length; i++) {
            const component = object.components[components[i]];

            this.components.set(component.netid, component);
        }
    }

    getComponentsByClassName(classname: string) {
        const components: Component[] = [];
        for (let [netid, component] of this.components) {
            if (component.classname === classname) {
                components.push(component);
            }
        }
        
        return components.length ? components : null;
    }

    findPlayer(username: string) {
        for (let [clientid, client] of this.clients) {
            if (!client.spawned || client.removed) continue;

            const playerData = this.GameData.GameData.players.get(client.PlayerControl.playerId);
            
            if (playerData && playerData.name === username) {
                return client;
            }
        }

        return null;
    }

    getPlayer(playerid: number) {
        for (let [clientid, client] of this.clients) {
            if (!client.spawned || client.removed) continue;

            if (client.PlayerControl.playerId === playerid) {
                return client;
            }
        }

        return null;
    }

    getPlayerByNetID(netid: number) {
        for (let [clientid, client] of this.clients) {
            if (!client.spawned || client.removed) continue;

            if (client.PlayerControl.netid === netid) {
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