import {
    SystemType
} from "../../constants/Enums.js"

import { BufferReader } from "../../util/BufferReader.js";
import { BufferWriter } from "../../util/BufferWriter.js";

import { SystemStatus } from "./SystemStatus.js"

export class LifeSuppSystem extends SystemStatus {
    type: SystemType.O2;

    countdown: number;
    consoles: number[];

    constructor() {
        super();
        
        this.type = SystemType.O2;

        this.countdown = 10000;
        this.consoles = [];
    }

    OnSpawn(reader: BufferReader) {
        return this.OnDeserialize(reader);
    }

    OnDeserialize(reader: BufferReader) {
        this.countdown = reader.floatLE();
        this.consoles = [];
        
        if (reader.offset < reader.size) {
            const num_consoles = reader.packed();

            for (let i = 0; i < num_consoles; i++) {
                this.consoles.push(reader.packed());
            }
        }
    }

    Serialize(): Buffer {
        const writer = new BufferWriter;

        writer.floatLE(this.countdown);
        writer.packed(this.consoles.length);
        for (let i = 0; i < this.consoles.length; i++) {
            writer.packed(this.consoles[i]);
        }

        return writer.buffer;
    }
}