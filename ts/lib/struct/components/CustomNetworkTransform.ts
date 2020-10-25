import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"

import { BufferReader } from "../../util/BufferReader.js"
import { BufferWriter } from "../../util/BufferWriter.js";

import {
    float16,
    uint8,
    Vector2
} from "../../interfaces/Types.js"

import { LerpValue, UnlerpValue } from "../../util/Lerp.js";

import { Game } from "../Game.js";

import {
    DataID,
    MessageID,
    PacketID,
    PayloadID,
    RPCID
} from "../../../index.js";

export interface CustomNetworkTransform extends Component {
    on(event: "move", listener: (transform: CustomNetworkTransform) => void);
}

export class CustomNetworkTransform extends Component {
    name: "Player";
    classname: "CustomNetworkTransform";

    sequence: number;
    position: Vector2;
    velocity: Vector2;

    constructor(client: AmongusClient, game: Game, netid: number, datalen: number, data: Buffer) {
        super(client, game, netid);

        this.sequence = null;

        this.OnSpawn(datalen, data);
    }

    OnSpawn(datalen: number, data: Buffer): void {
        return this.OnDeserialize(datalen, data);
    }

    OnDeserialize(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);

        const sequence = reader.byte();

        if (this.sequence !== null && sequence < this.sequence) {
            return;
        }

        this.sequence = sequence;

        reader.jump(0x01);

        this.position = {
            x: LerpValue(reader.uint16LE() / 65535, -40, 40),
            y: LerpValue(reader.uint16LE() / 65535, -40, 40)
        }

        this.velocity = {
            x: LerpValue(reader.uint16LE() / 65535, -40, 40),
            y: LerpValue(reader.uint16LE() / 65535, -40, 40)
        }

        this.emit("move", this);
    }

    async move(position: Vector2, velocity: Vector2) {
        const data = new BufferWriter;
        this.sequence++;
        data.uint8(this.sequence);
        data.uint8(0x00);
        data.uint16LE(UnlerpValue(position.x, -40, 40) * 65535);
        data.uint16LE(UnlerpValue(position.y, -40, 40) * 65535);
        data.uint16LE(UnlerpValue(velocity.x, -40, 40) * 65535);
        data.uint16LE(UnlerpValue(velocity.x, -40, 40) * 65535);
        
        await this.client.send({
            op: PacketID.Unreliable,
            payloadid: PayloadID.GameData,
            code: this.game.code,
            parts: [
                {
                    type: MessageID.Data,
                    datatype: DataID.Movement,
                    netid: this.netid,
                    datalen: data.size,
                    data: data.buffer
                }
            ]
        });
    }

    async snapTo(position: Vector2) {
        await this.client.send({
            op: PacketID.Reliable,
            payloadid: PayloadID.GameData,
            code: this.game.code,
            parts: [
                {
                    type: MessageID.RPC,
                    handlerid: this.netid,
                    rpcid: RPCID.SnapTo,
                    x: position.x,
                    y: position.y
                }
            ]
        });
    }
}