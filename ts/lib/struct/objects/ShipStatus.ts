import { AmongusClient } from "../../Client.js"

import { GameObject } from "./GameObject.js"

import { ShipStatus as ShipStatusComponent } from "../components/ShipStatus.js"

import {
    SpawnID,
    SystemType
} from "../../constants/Enums.js"

import { ComponentData } from "../../interfaces/Packets.js"
import { Game } from "../Game.js"

export class ShipStatus extends GameObject {
    spawnid: SpawnID.ShipStatus;
    components: [ShipStatusComponent];

    constructor (client: AmongusClient, parent: Game, components: Partial<ComponentData>[]) {
        super(client, parent);

        this.id = null;

        this.components = [
            new ShipStatusComponent(client, components[0].netid)
        ];

        this.ShipStatus.systems[SystemType.Doors].SetDoors(13);
        this.ShipStatus.OnSpawn(components[0].datalen, components[0].data);
        
        if (parent instanceof GameObject) {
            parent.addChild(this);
        }
    }

    get ShipStatus() {
        return this.components[0];
    }
}