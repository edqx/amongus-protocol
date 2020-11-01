import {
    SystemType
} from "../../constants/Enums.js"

import { BufferReader } from "../../util/BufferReader.js";
import { BufferWriter } from "../../util/BufferWriter.js";

import { SystemStatus } from "./SystemStatus.js"

export class SabotageSystem extends SystemStatus {
    type: SystemType.Sabotage;

    timer: number;

    constructor() {
        super();
        
        this.type = SystemType.Sabotage;

        this.timer = 0;
    }

    OnSpawn(reader: BufferReader) {
        return this.OnDeserialize(reader);
    }

    OnDeserialize(reader: BufferReader) {
        this.timer = reader.floatLE();
    }

    Serialize(): Buffer {
        const writer = new BufferWriter;

        writer.floatLE(this.timer);

        return writer.buffer;
    }
}