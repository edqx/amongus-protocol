import {
    SystemType
} from "../../constants/Enums.js"

import { BufferReader } from "../../util/BufferReader.js";
import { BufferWriter } from "../../util/BufferWriter.js";

import { SystemStatus } from "./SystemStatus.js"

export class DoorsSystem extends SystemStatus {
    type: SystemType.Doors;

    doors: boolean[];

    constructor() {
        super();
        
        this.type = SystemType.Doors;
        this.doors = [];
    }

    SetDoors(num: number) {
        this.doors = new Array(num).fill(false);
    }

    OnSpawn(reader: BufferReader) {
        for (let i = 0; i < this.doors.length; i++) {
            this.doors[i] = reader.bool();
        }
    }

    OnDeserialize(reader: BufferReader) {
        let updateMask = reader.packed();

        for (let i = 0; i < this.doors.length; i++) {
            if ((updateMask & (1 << i)) !== 0)
            {
                this.doors[i] = reader.bool();
            }
        }
    }

    Serialize(): Buffer {
        const writer = new BufferWriter;

        for (let i = 0; i < this.doors.length; i++) {
            writer.bool(this.doors[i]);
        }

        return writer.buffer;
    }
}