import { EventEmitter } from "events";

import { AmongusClient } from "../../Client.js"
import { Game } from "../Game.js";

export class Component extends EventEmitter {
    name: string;
    classname: string;
    
    constructor(public client: AmongusClient, public game: Game, public netid: number) {
        super();
    }

    OnSpawn(datalen: number, data: Buffer) {};
    OnDeserialize(datalen: number, data: Buffer) {};
}