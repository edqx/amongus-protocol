import { AmongusClient } from "../../Client.js"

import { GameObject } from "./GameObject.js"

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
import { Component } from "../components/Component.js"

interface PlayerComponents {
    PlayerControl: PlayerControl,
    PlayerPhysics: PlayerPhysics,
    CustomNetworkTransform: CustomNetworkTransform
}

export class Player extends GameObject {
    spawnid: SpawnID.Player;
    components: [PlayerControl, PlayerPhysics, CustomNetworkTransform];

    constructor (client: AmongusClient, parent: PlayerClient, components: ComponentData[]) {
        super(client, parent);

        this.components = [
            new PlayerControl(client, components[0].netid, components[0].datalen, components[0].data),
            new PlayerPhysics(client, components[1].netid, components[1].datalen, components[1].data),
            new CustomNetworkTransform(client, components[2].netid, components[2].datalen, components[2].data)
        ];
        
        if (parent instanceof GameObject) {
            parent.addChild(this);
        }
    }

    get PlayerControl() {
        return this.components[0];
    }

    get PlayerPhysics() {
        return this.components[1];
    }

    get CustomNetworkTransform() {
        return this.components[2];
    }
}