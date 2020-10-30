import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"
import { BufferWriter } from "../../util/BufferWriter.js";

export class VoteBanSystem extends Component {
    name: "GameData";
    classname: "VoteBanSystem";

    num_votes: number;

    constructor(client: AmongusClient, netid: number, datalen?: number, data?: Buffer) {
        super(client, netid);

        this.num_votes = 0;
        
        if (typeof datalen !== "undefined" && typeof data !== "undefined") {
            this.OnSpawn(datalen, data);
        }
    }

    OnSpawn(datalen: number, data: Buffer): void {
        return this.OnDeserialize(datalen, data);
    }

    OnDeserialize(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);
    }

    Serialize() {
        const writer = new BufferWriter;

        writer.uint8(this.num_votes);

        return writer.buffer;
    }
}