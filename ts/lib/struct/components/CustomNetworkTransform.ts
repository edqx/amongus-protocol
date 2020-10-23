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

interface CustomNetworkTransformOnSpawn {
    sequence: number;
    position: Vector2;
    velocity: Vector2;
}

interface CustomNetworkTransformOnDeserialize {
    sequence: number;
    position: Vector2;
    velocity: Vector2;
}

export class CustomNetworkTransform extends Component {
    constructor(public netid: number, datalen: number, data: Buffer) {
        super(netid, datalen, data);

        this.OnSpawn(datalen, data);
    }

    OnSpawn(datalen: number, data: Buffer): CustomNetworkTransformOnSpawn {
        return this.OnDeserialize(datalen, data);
    }

    OnDeserialize(datalen: number, data: Buffer): CustomNetworkTransformOnDeserialize {
        const reader = new BufferReader(data);

        const sequence = reader.uint16LE();
        
        const position = {
            x: reader.uint16LE(),
            y: reader.uint16LE()
        }

        const velocity = {
            x: reader.uint16LE(),
            y: reader.uint16LE()
        }

        return {
            sequence,
            position,
            velocity
        }
    }
}