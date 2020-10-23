import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    float16,
    uint8
} from "../../interfaces/Types.js"

interface Vector2 {
    x: float16;
    y: float16;
}

export class CustomNetworkTransform extends Component {
    name: "Player";
    classname: "CustomNetworkTransform";

    sequence: number;
    position: Vector2;
    velocity: Vector2;

    constructor(client: AmongusClient, netid: number, datalen: number, data: Buffer) {
        super(client, netid);

        this.OnSpawn(datalen, data);
    }

    OnSpawn(datalen: number, data: Buffer): void {
        return this.OnDeserialize(datalen, data);
    }

    OnDeserialize(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);

        this.sequence = reader.uint16LE();

        this.position = {
            x: reader.uint16LE(),
            y: reader.uint16LE()
        }

        this.velocity = {
            x: reader.uint16LE(),
            y: reader.uint16LE()
        }
    }
}