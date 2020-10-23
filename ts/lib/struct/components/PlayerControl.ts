import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    uint8
} from "../../interfaces/Types.js"

interface PlayerControlOnSpawn {
    isNew: boolean;
    playerId: uint8;
}

interface PlayerControlOnDeserialize {
    playerId: uint8;
}

export class PlayerControl extends Component {
    constructor(public netid: number, datalen: number, data: Buffer) {
        super(netid, datalen, data);

        this.OnSpawn(datalen, data);
    }

    OnSpawn(datalen: number, data: Buffer): PlayerControlOnSpawn {
        const reader = new BufferReader(data);

        const isNew = reader.bool();
        const playerId = reader.uint8();

        return {
            isNew,
            playerId
        }
    }

    OnDeserialize(datalen: number, data: Buffer): PlayerControlOnDeserialize {
        const reader = new BufferReader(data);

        const playerId = reader.uint8();

        return {
            playerId
        }
    }
}