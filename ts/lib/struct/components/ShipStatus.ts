import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"

import {
    SystemType
} from "../../constants/Enums.js"

interface SystemStatus {
    OnSpawn(datalen: number, data: Buffer): any;
    OnDeserialize(datalen: number, data: Buffer): any;
}

export class ShipStatus extends Component {
    name: "ShipStatus";
    classname: "ShipStatus";

    systems: { [key in SystemType]?: void }

    constructor(client: AmongusClient, netid: number, datalen?: number, data?: Buffer) {
        super(client, netid);

        
        if (typeof datalen !== "undefined" && typeof data !== "undefined") {
            this.OnSpawn(datalen, data);
        }
    }

    OnSpawn(datalen: number, data: Buffer): void {
        
    }

    OnDeserialize(datalen: number, data: Buffer): void {

    }
}