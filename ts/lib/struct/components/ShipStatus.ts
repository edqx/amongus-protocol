import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    SystemType
} from "../../constants/Enums.js"

import {
    float16,
    uint8
} from "../../interfaces/Types.js"

import { Game } from "../Game.js"

interface SystemStatus {
    OnSpawn(datalen: number, data: Buffer): any;
    OnDeserialize(datalen: number, data: Buffer): any;
}

export class ShipStatus extends Component {
    name: "ShipStatus";
    classname: "ShipStatus";

    systems: { [key in SystemType]?: void }

    constructor(client: AmongusClient, netid: number, datalen: number, data: Buffer) {
        super(client, netid);

        this.OnSpawn(datalen, data);
    }

    OnSpawn(datalen: number, data: Buffer): void {
        
    }

    OnDeserialize(datalen: number, data: Buffer): void {

    }
}