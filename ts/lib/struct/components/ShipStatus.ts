import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"

import {
    SystemType
} from "../../constants/Enums.js"

import { SwitchSystem } from "../systems/SwitchSystem.js";
import { MedScanSystem } from "../systems/MedScanSystem.js";
import { ReactorSystem } from "../systems/ReactorSystem.js";
import { LifeSuppSystem } from "../systems/LifeSuppSystem.js";
import { SecuritySystem } from "../systems/SecuritySystem.js";
import { HQHudOverrideSystem } from "../systems/HQHudOverrideSystem.js";
import { HudOverrideSystem } from "../systems/HudOverrideSystem.js";
import { DoorsSystem } from "../systems/DoorsSystem.js";
import { SabotageSystem } from "../systems/SabotageSystem.js";
import { BufferReader } from "../../util/BufferReader.js";
import { DeconSystem } from "../systems/DeconSystem.js";

export class ShipStatus extends Component {
    name: "ShipStatus";
    classname: "ShipStatus";

    systems: Partial<{
        [SystemType.Reactor]: ReactorSystem;
        [SystemType.Electrical]: SwitchSystem;
        [SystemType.O2]: LifeSuppSystem;
        [SystemType.MedBay]: MedScanSystem;
        [SystemType.Security]: SecuritySystem;
        [SystemType.Communications]: HQHudOverrideSystem|HudOverrideSystem;
        [SystemType.Doors]: DoorsSystem;
        [SystemType.Sabotage]: SabotageSystem;
        [SystemType.Decontamination]: DeconSystem;
        [SystemType.Laboratory]: ReactorSystem;
    }>;

    constructor(client: AmongusClient, netid: number, datalen?: number, data?: Buffer) {
        super(client, netid);

        this.name = "ShipStatus";
        this.classname = "ShipStatus";
        
        if (typeof datalen !== "undefined" && typeof data !== "undefined") {
            this.OnSpawn(datalen, data);
        }
    }

    OnSpawn(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);

        for (let i = 0; i < 30; i++) {
            if (this.systems[i]) {
                const system = this.systems[i];

                system.OnSpawn(reader);
            }
        }
    }

    OnDeserialize(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);
        
        const updateMask = reader.packed();

        for (let i = 0; i < 30; i++) {
            if ((updateMask & (1 << i)) !== 0) {
                if (this.systems[i]) {
                    const system = this.systems[i];

                    system.OnDeserialize(reader);
                }
            }
        }
    }
}