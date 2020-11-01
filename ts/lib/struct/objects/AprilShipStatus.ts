import { AmongusClient } from "../../Client.js"

import { GameObject } from "./GameObject.js"

import { ShipStatus } from "../components/ShipStatus.js"

import {
    SpawnID,
    SystemType
} from "../../constants/Enums.js"

import { ComponentData } from "../../interfaces/Packets.js"
import { Game } from "../Game.js"

export class AprilShipStatus extends GameObject {
    spawnid: SpawnID.AprilShipStatus;
    components: [ShipStatus];

    constructor (client: AmongusClient, parent: Game, components: Partial<ComponentData>[]) {
        super(client, parent);

        this.id = null;

        this.components = [
            new ShipStatus(client, components[0].netid, components[0].datalen, components[0].data)
        ];
        
        this.ShipStatus.systems[SystemType.Doors].SetDoors(13);
        
        if (parent instanceof GameObject) {
            parent.addChild(this);
        }
    }

    get ShipStatus() {
        return this.components[0];
    }
}