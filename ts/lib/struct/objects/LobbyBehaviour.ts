import { AmongusClient } from "../../Client.js"

import { GameObject } from "./GameObject.js"

import { LobbyBehaviour as LobbyBehaviourComponent } from "../components/LobbyBehaviour.js"
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
import { Component } from "../components/Component.js"

export class LobbyBehaviour extends GameObject {
    spawnid: SpawnID.LobbyBehaviour;
    components: [LobbyBehaviourComponent];

    constructor (client: AmongusClient, parent: Game, components: ComponentData[]) {
        super(client, parent);

        this.components = [
            new LobbyBehaviourComponent(client, components[0].netid, components[0].datalen, components[0].data)
        ];
        
        if (parent instanceof GameObject) {
            parent.addChild(this);
        }
    }

    get LobbyBehaviour() {
        return this.components[0];
    }
}