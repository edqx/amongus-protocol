import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    uint8
} from "../../interfaces/Types.js"

import { Game } from "../Game.js";

export class PlayerPhysics extends Component {
    name: "Player";
    classname: "PlayerPhysics";

    constructor(client: AmongusClient, game: Game, netid: number, datalen: number, data: Buffer) {
        super(client, game, netid);

        this.OnSpawn(datalen, data);
    }
    
    OnSpawn(datalen: number, data: Buffer): void {

    }

    OnDeserialize(datalen: number, data: Buffer): void {

    }
}