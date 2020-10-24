import { EventEmitter } from "events";

import {
    AmongusClient,
    AnyObject
} from "../Client.js";
import { Component } from "./components/Component.js";
import { GameData } from "./GameData.js";

import { PlayerClient } from "./PlayerClient.js";

export interface Game {
    on(event: "spawn", listener: (object: AnyObject) => void);
}

export class Game extends EventEmitter {
    clients: Map<number, PlayerClient>;
    components: Map<number, Component>;
    gameobjects: Map<number, AnyObject>;

    GameData: GameData;

    constructor(private client: AmongusClient,
        public code: number,
        public hostid: number,
        clients: number[])
    {
        super();

        this.clients = new Map;

        this.components = new Map;
        this.gameobjects = new Map;
        
        clients.forEach(clientid => {
            this.clients.set(clientid, new PlayerClient(client, this, clientid));
        });

        this.GameData = new GameData(client, this);
    }

    registerComponents(object: AnyObject) {                          
        const components = Object.keys(object.components);

        for (let i = 0; i < components.length; i++) {
            const component = object.components[components[i]];

            this.components.set(component.netid, component);
        }
    }

    getComponentByClassname(classname: string) {
        for (let [netid, component] of this.components) {
            if (component.classname === classname) {
                return component;
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