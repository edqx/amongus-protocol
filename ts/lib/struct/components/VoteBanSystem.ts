import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    float16,
    uint8
} from "../../interfaces/Types.js"
import { Game } from "../Game.js";

export class VoteBanSystem extends Component {
    name: "GameData";
    classname: "VoteBanSystem";

    num_votes: number;

    constructor(client: AmongusClient, game: Game, netid: number, datalen: number, data: Buffer) {
        super(client, game, netid);

        this.OnSpawn(datalen, data);
    }

    OnSpawn(datalen: number, data: Buffer): void {
        return this.OnDeserialize(datalen, data);
    }

    OnDeserialize(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);
    }
}