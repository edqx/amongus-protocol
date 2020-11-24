import {
    SystemType
} from "../../constants/Enums.js"

import { BufferReader } from "../../util/BufferReader.js";
import { BufferWriter } from "../../util/BufferWriter.js";

import { SystemStatus } from "./SystemStatus.js"

export class ReactorSystem extends SystemStatus {
    type: SystemType.Reactor;

    countdown: number;
    pairs: [number, number][];

    constructor() {
        super();
        
        this.type = SystemType.Reactor;

        this.countdown = 10000;
        this.pairs = [];
    }

    get UserCount() {
        let num = 0;
        let num2 = 0;

        for (let pair of this.pairs) {
            let num3 = 1 << pair[1];

            if ((num3 & num2) == 0) {
                num++;
                num2 |= num3;
            }
        }

        return num;
    }

    OnSpawn(reader: BufferReader) {
        return this.OnDeserialize(reader);
    }

    OnDeserialize(reader: BufferReader) {
        this.countdown = reader.floatLE();
        const num_pairs = reader.packed();
        this.pairs = reader.list(read => [read.byte(), read.byte()], num_pairs);
    }

    Serialize(): Buffer {
        const writer = new BufferWriter;

        writer.floatLE(this.countdown);
        writer.packed(this.pairs.length);
        for (let i = 0; i < this.pairs.length; i++) {
            writer.byte(this.pairs[i][0]);
            writer.byte(this.pairs[i][1]);
        }

        return writer.buffer;
    }
}