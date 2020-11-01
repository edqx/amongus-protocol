import {
    SystemType
} from "../../constants/Enums.js"

import { BufferReader } from "../../util/BufferReader.js";
import { BufferWriter } from "../../util/BufferWriter.js";

import { SystemStatus } from "./SystemStatus.js"

export class SecuritySystem extends SystemStatus {
    type: SystemType.Security;

    is_active: boolean;

    constructor() {
        super();
        
        this.type = SystemType.Security;

        this.is_active = false;
    }

    OnSpawn(reader: BufferReader) {
        return this.OnDeserialize(reader);
    }

    OnDeserialize(reader: BufferReader) {
        this.is_active = reader.bool();
    }

    Serialize(): Buffer {
        const writer = new BufferWriter;

        writer.bool(this.is_active);

        return writer.buffer;
    }
}