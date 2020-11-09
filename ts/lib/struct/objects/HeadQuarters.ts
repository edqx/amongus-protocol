import { AmongusClient } from "../../Client.js"

import { GameObject } from "./GameObject.js"

import { ShipStatus } from "../components/ShipStatus.js"

import {
    SpawnID,
    SystemType
} from "../../constants/Enums.js"

import { ComponentData } from "../../interfaces/Packets.js"
import { Game } from "../Game.js"

import { SwitchSystem } from "../systems/SwitchSystem.js";
import { MedScanSystem } from "../systems/MedScanSystem.js";
import { ReactorSystem } from "../systems/ReactorSystem.js";
import { LifeSuppSystem } from "../systems/LifeSuppSystem.js";
import { HQHudOverrideSystem } from "../systems/HQHudOverrideSystem.js";
import { SabotageSystem } from "../systems/SabotageSystem.js";

export class HeadQuarters extends GameObject {
    spawnid: SpawnID.HeadQuarters;
    components: [ShipStatus];

    constructor (client: AmongusClient, parent: Game, components: Partial<ComponentData>[]) {
        super(client, parent);

        this.spawnid = SpawnID.HeadQuarters;

        this.id = null;

        this.components = [
            new ShipStatus(client, components[0].netid)
        ];

        this.ShipStatus.systems = {
            [SystemType.Reactor]: new ReactorSystem,
            [SystemType.Electrical]: new SwitchSystem,
            [SystemType.O2]: new LifeSuppSystem,
            [SystemType.MedBay]: new MedScanSystem,
            [SystemType.Communications]: new HQHudOverrideSystem,
            [SystemType.Sabotage]: new SabotageSystem
        }

        this.ShipStatus.OnSpawn(components[0].datalen, components[0].data);
        
        if (parent instanceof GameObject) {
            parent.addChild(this);
        }
    }

    get ShipStatus() {
        return this.components[0];
    }
}