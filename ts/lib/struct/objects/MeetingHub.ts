import { AmongusClient } from "../../Client.js"

import { GameObject } from "./GameObject.js"

import { MeetingHud } from "../components/MeetingHud.js"

import {
    SpawnID
} from "../../constants/Enums.js"

import { ComponentData } from "../../interfaces/Packets.js"
import { Game } from "../Game.js"

export class MeetingHub extends GameObject {
    spawnid: SpawnID.MeetingHub;
    components: [MeetingHud];

    constructor (client: AmongusClient, parent: Game, components: Partial<ComponentData>[]) {
        super(client, parent);

        this.id = null;

        this.components = [
            new MeetingHud(client, components[0].netid, components[0].datalen, components[0].data)
        ];
        
        if (parent instanceof GameObject) {
            parent.addChild(this);
        }
    }

    get MeetingHud() {
        return this.components[0];
    }
}