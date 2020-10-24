import { EventEmitter } from "events";

import { AmongusClient } from "../../Client.js"

export class Component extends EventEmitter {
    name: string;
    classname: string;
    
    constructor(private client: AmongusClient, public netid: number) {
        super();
    }

    OnSpawn(datalen: number, data: Buffer) {};
    OnDeserialize(datalen: number, data: Buffer) {};
}