import {
    SystemType
} from "../../constants/Enums.js"

import { BufferReader } from "../../util/BufferReader.js";
import { BufferWriter } from "../../util/BufferWriter.js";

import { SystemStatus } from "./SystemStatus.js"

export class MedScanSystem extends SystemStatus {
    type: SystemType.MedBay;

    users: number[];

    constructor() {
        super();
        
        this.type = SystemType.MedBay;

        this.users = [];
    }

    OnSpawn(reader: BufferReader) {
        return this.OnDeserialize(reader);
    }

    OnDeserialize(reader: BufferReader) {
        const num_users = reader.packed();
        this.users = reader.bytes(num_users);
    }

    Serialize(): Buffer {
        const writer = new BufferWriter;

        writer.packed(this.users.length);
        writer.bytes(this.users);

        return writer.buffer;
    }
}