import { AmongusClient } from "../Client.js"

import { GameData as GameDataObject } from "./objects/GameData.js"
import { Game } from "./Game.js"

import {
    ColourID,
    HatID,
    MessageID,
    PacketID,
    PayloadID,
    PetID,
    RPCID,
    SkinID,
    SpawnID
} from "../constants/Enums.js"

import { EventEmitter } from "events"

export interface GameData {
    on(event: "spawn", listener: (gamedata: GameDataObject) => void);
}

export class GameData extends EventEmitter {
    spawned: boolean;
    object: GameDataObject;

    constructor (private client: AmongusClient, public game: Game) {
        super();

        this.spawned = false;
    }

    spawn(object: GameDataObject) {
        this.object = object;
        this.spawned = true;
        
        this.emit("spawn", object);
    }

    get GameData() {
        return this?.object?.components?.GameData;
    }

    get VoteBanSystem() {
        return this?.object?.components.VoteBanSystem;
    }
}