import { EventEmitter } from "events";
import { AmongusClient } from "../../Client.js"
import { SpawnID } from "../../constants/Enums.js";
import { Game } from "../Game.js";

export class Object extends EventEmitter {
    spawnid: SpawnID;
    
    constructor (protected client: AmongusClient, protected game: Game, public ownerid: number) {
        super();
    }
}