import {
    SystemType
} from "../../constants/Enums.js"

import { BufferReader } from "../../util/BufferReader.js";
import { BufferWriter } from "../../util/BufferWriter.js";

import { SystemStatus } from "./SystemStatus.js"

export class HQHudOverrideSystem extends SystemStatus {
    type: SystemType.Communications;

    consoles: [number, number][];
    fixed_consoles: number[];
    
    constructor() {
        super();

        this.type = SystemType.Communications;

        this.consoles = [];
        this.fixed_consoles = [];
    }

    OnSpawn(reader: BufferReader) {
        return this.OnDeserialize(reader);
    }

    OnDeserialize(reader: BufferReader) {
        const num_consoles = reader.packed();
        this.consoles = [];

        for (let i = 0; i < num_consoles; i++) {
            let playerId = reader.uint8();
            let console = reader.uint8();
        
            this.consoles.push([playerId, console]);
        }
        
        const num_fixed = reader.packed();
        this.fixed_consoles = [];
        
        for (let i = 0; i < num_fixed; i++) {
            let fixed = reader.uint8();
        
            this.fixed_consoles.push(fixed);
        }
    }

    Serialize(): Buffer {
        const writer = new BufferWriter;

        writer.packed(this.consoles.length);
        for (let i = 0; i < this.consoles.length; i++) {
            writer.uint8(this.consoles[i][0])
            writer.uint8(this.consoles[i][1]);
        }

        writer.packed(this.fixed_consoles.length);
        for (let i = 0; i < this.fixed_consoles.length; i++) {
            writer.uint8(this.fixed_consoles[i]);
        }

        return writer.buffer;
    }
}