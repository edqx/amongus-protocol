import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    float16,
    uint8,
    Vector2
} from "../../interfaces/Types.js"

import { LerpValue } from "../../util/Lerp.js";

export interface CustomNetworkTransform extends Component {
    on(event: "move", listener: (transform: CustomNetworkTransform) => void);
}

export class CustomNetworkTransform extends Component {
    name: "Player";
    classname: "CustomNetworkTransform";

    sequence: number;
    position: Vector2;
    velocity: Vector2;

    constructor(client: AmongusClient, netid: number, datalen: number, data: Buffer) {
        super(client, netid);

        this.sequence = null;

        this.OnSpawn(datalen, data);
    }

    OnSpawn(datalen: number, data: Buffer): void {
        return this.OnDeserialize(datalen, data);
    }

    OnDeserialize(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);

        const sequence = reader.byte();

        if (this.sequence !== null && sequence < this.sequence) {
            return;
        }

        this.sequence = sequence;

        reader.jump(0x01);

        this.position = {
            x: LerpValue(reader.uint16LE() / 65535, -40, 40),
            y: LerpValue(reader.uint16LE() / 65535, -40, 40)
        }

        this.velocity = {
            x: LerpValue(reader.uint16LE() / 65535, -40, 40),
            y: LerpValue(reader.uint16LE() / 65535, -40, 40)
        }

        this.emit("move", this);
    }
}