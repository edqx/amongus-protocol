import { AmongusClient } from "../../Client.js"

export class Component {
    name: string;
    classname: string;
    
    constructor(private client: AmongusClient, public netid: number) {

    }

    OnSpawn(datalen: number, data: Buffer) {};
    OnDeserialize(datalen: number, data: Buffer) {};
}