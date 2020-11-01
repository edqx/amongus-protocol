import { AmongusClient } from "../../Client.js"

import { GameObject } from "./GameObject.js"

import { ShipStatus } from "../components/ShipStatus.js"

import {
    SpawnID,
    SystemType
} from "../../constants/Enums.js"

import { ComponentData } from "../../interfaces/Packets.js"
import { Game } from "../Game.js"

export class HeadQuarters extends GameObject {
    spawnid: SpawnID.HeadQuarters;
    components: [ShipStatus];

    constructor (client: AmongusClient, parent: Game, components: Partial<ComponentData>[]) {
        super(client, parent);

        this.id = null;

        this.components = [
            new ShipStatus(client, components[0].netid)
        ];

        // TODO: Find out how many doors are in Mira HQ
        this.ShipStatus.systems[SystemType.Doors].SetDoors(0);
        this.ShipStatus.OnSpawn(components[0].datalen, components[0].data);
        
        if (parent instanceof GameObject) {
            parent.addChild(this);
        }
    }

    get ShipStatus() {
        return this.components[0];
    }
}