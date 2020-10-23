import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    float16,
    uint8
} from "../../interfaces/Types.js"

import {
    PlayerGameData
} from "../../interfaces/Packets.js";

import { parsePlayerData } from "../../Parser.js";

export class GameData extends Component {
    name: "GameData";
    classname: "GameData";

    num_players: number;
    players: Map<number, PlayerGameData>;

    constructor(client: AmongusClient, netid: number, datalen: number, data: Buffer) {
        super(client, netid);

        this.num_players = null;
        this.players = new Map;

        this.OnSpawn(datalen, data);
    }

    OnSpawn(datalen: number, data: Buffer): void {
        return this.OnDeserialize(datalen, data);
    }

    OnDeserialize(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);

        this.num_players = reader.packed();

        for (let i = 0; i < this.num_players; i++) {
            const player = parsePlayerData(reader);

            this.players.set(player.playerId, player);
        }
    }
}