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
        
        if (reader.offset < reader.size) {
            const num_consoles = reader.packed();

            this.consoles = reader.list(reader => reader.packed(), num_consoles);
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