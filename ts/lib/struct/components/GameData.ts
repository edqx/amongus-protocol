import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    float16,
    uint8,
    bitfield,
    packed
} from "../../interfaces/Types.js"

import { parsePlayerData } from "../../Parser.js";

import {
    ColourID,
    HatID,
    PetID,
    SkinID
} from "../../constants/Enums.js";

import {
    PlayerDataFlags,
    PlayerTaskState,
    ParsedPlayerGameData
} from "../../interfaces/Packets.js";

import { DataID, MessageID, PacketID, PayloadID, RPCID, TaskID } from "../../constants/Enums.js";
import { EventEmitter } from "events";

export interface PlayerGameData {
    
}

export class PlayerGameData extends EventEmitter {
    private client: AmongusClient;

    playerId: uint8;
    name: string;
    colour: ColourID;
    hat: HatID;
    pet: PetID;
    skin: SkinID;
    flags: bitfield;
    disconnected: boolean;
    imposter: boolean;
    dead: boolean;
    num_tasks: uint8;

    tasks: Map<TaskID, PlayerTaskState>;

    constructor(private GameData: GameData, data: ParsedPlayerGameData) {
        super();

        this.client = GameData.client;
        this.GameData = GameData;

        this.playerId = data.playerId;
        this.name = data.name;
        this.colour = data.colour;
        this.hat = data.hat;
        this.pet = data.pet;
        this.skin = data.skin;
        this.flags = data.flags;
        this.disconnected = data.disconnected;
        this.imposter = data.imposter;
        this.dead = data.dead;
        this.num_tasks = data.num_tasks;

        this.tasks = new Map(Object.values(data.tasks).map(task => [task.taskid, task]));
    }

    toJSON(): ParsedPlayerGameData {
        return {
            playerId: this.playerId,
            name: this.name,
            colour: this.colour,
            hat: this.hat,
            pet: this.pet,
            skin: this.skin,
            flags: this.flags,
            disconnected: this.disconnected,
            imposter: this.imposter,
            dead: this.dead,
            num_tasks: this.num_tasks,
            tasks: [...this.tasks.values()]
        }
    }

    get player() {
        return this.client.game.getPlayer(this.playerId);
    }
}

export interface GameData {

}

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

            this.players.set(player.playerId, new PlayerGameData(this, player));
        }
    }
}