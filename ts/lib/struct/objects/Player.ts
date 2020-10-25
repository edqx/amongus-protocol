import { AmongusClient } from "../../Client.js"

import { Object } from "./Object.js"

import { CustomNetworkTransform } from "../components/CustomNetworkTransform.js"
import { GameData } from "../components/GameData.js"
import { MeetingHud } from "../components/MeetingHud.js"
import { PlayerControl } from "../components/PlayerControl.js"
import { PlayerPhysics } from "../components/PlayerPhysics.js"
import { ShipStatus } from "../components/ShipStatus.js"
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

import { PlayerClient } from "../PlayerClient.js"

interface PlayerComponents {
    PlayerControl: PlayerControl,
    PlayerPhysics: PlayerPhysics,
    CustomNetworkTransform: CustomNetworkTransform
}

export class Player extends Object {
    spawnid: SpawnID.Player;
    components: PlayerComponents;

    constructor (client: AmongusClient, game: Game, ownerid: number, components: ComponentData[]) {
        super(client, game, ownerid);

        this.components = {
            PlayerControl: new PlayerControl(client, game, components[0].netid, components[0].datalen, components[0].data),
            PlayerPhysics: new PlayerPhysics(client, game, components[1].netid, components[1].datalen, components[1].data),
            CustomNetworkTransform: new CustomNetworkTransform(client, game, components[2].netid, components[2].datalen, components[2].data)
        }
    }
}