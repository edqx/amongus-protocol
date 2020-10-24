import { AmongusClient } from "../../Client.js"

import { Object } from "./Object.js"

import { GameData as GameDataComponent } from "../components/GameData.js"
import { VoteBanSystem } from "../components/VoteBanSystem.js"

import {
    ColourID,
    HatID,
    MessageID,
    PacketID,
    PayloadID,
    RPCID,
    SpawnID
} from "../../constants/Enums.js"

import { ComponentData } from "../../interfaces/Packets.js"
import { Game } from "../Game.js"

interface GameDataComponents {
    GameData: GameDataComponent,
    VoteBanSystem: VoteBanSystem
}

export class GameData extends Object {
    spawnid: SpawnID.Player;
    components: GameDataComponents;

    constructor (client: AmongusClient, ownerid: number, components: ComponentData[]) {
        super(client, ownerid);

        this.components = {
            GameData: new GameDataComponent(client, components[0].netid, components[0].datalen, components[0].data),
            VoteBanSystem: new VoteBanSystem(client, components[1].netid, components[1].datalen, components[1].data),
        }
    }
}