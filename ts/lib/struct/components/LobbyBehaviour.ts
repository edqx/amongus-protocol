import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    uint8
} from "../../interfaces/Types.js"

import { Game } from "../Game.js";

export class LobbyBehaviour extends Component {
    name: "LobbyBehaviour";
    classname: "LobbyBehaviour";

    constructor(client: AmongusClient, netid: number, datalen: number, data: Buffer) {
        super(client, netid);

        this.OnSpawn(datalen, data);
    }
    
    OnSpawn(datalen: number, data: Buffer): void {

    }

    OnDeserialize(datalen: number, data: Buffer): void {

    }
}