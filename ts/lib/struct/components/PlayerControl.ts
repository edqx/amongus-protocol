import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    uint8
} from "../../interfaces/Types.js"

interface PlayerControlOnSpawn {
    isNew: boolean;
}

export class PlayerControl extends Component {
    name: "Player";
    classname: "PlayerControl";

    playerId: number;

    constructor(client: AmongusClient, netid: number, datalen: number, data: Buffer) {
        super(client, netid);

        this.OnSpawn(datalen, data);
    }
    
    OnSpawn(datalen: number, data: Buffer): PlayerControlOnSpawn {
        const reader = new BufferReader(data);

        const isNew = reader.bool();
        this.playerId = reader.uint8();

        return {
            isNew
        }
    }

    OnDeserialize(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);

        this.playerId = reader.uint8();
    }
}