import { EventEmitter } from "events";
import { AmongusClient } from "../Client.js"
import { SpawnID } from "../constants/Enums.js";
import { Game } from "./Game.js";

export class Object extends EventEmitter {
    spawnid: SpawnID;
    
    constructor (private client: AmongusClient, public ownerid: number) {
        super();
    }
}