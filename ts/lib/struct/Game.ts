import { EventEmitter } from "events";

import {
    AmongusClient,
    AnyObject
} from "../Client.js";

import { PlayerClient } from "./PlayerClient.js";

export interface Game {
    on(event: "spawn", listener: (object: AnyObject) => void);
}

export class Game extends EventEmitter {
    clients: Map<number, PlayerClient>;

    constructor(private client: AmongusClient,
        public code: number,
        public hostid: number,
        clients: number[])
    {
        super();

        this.clients = new Map;
        
        clients.forEach(clientid => {
            this.clients.set(clientid, new PlayerClient(client, this, clientid));
        });
    }

    get host() {
        return this.clients.get(this.hostid);
    }

    get me() {
        return this.clients.get(this.client.clientid);
    }
}