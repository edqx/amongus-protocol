import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    uint8
} from "../../interfaces/Types.js"

import {
    ColourID,
    HatID,
    MessageID,
    PacketID,
    PayloadID,
    PetID,
    RPCID,
    SkinID
} from "../../../index.js";

interface PlayerControlOnSpawn {
    isNew: boolean;
}

export class PlayerControl extends Component {
    name: "Player";
    classname: "PlayerControl";

    playerId: uint8;

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

    async murderPlayer(playerid: number) {
        await this.client.send({
            op: PacketID.Reliable,
            payloads: [
                {
                    payloadid: PayloadID.GameDataTo,
                    recipient: this.client.game.hostid,
                    code: this.client.game.code,
                    parts: [
                        {
                            type: MessageID.RPC,
                            handlerid: this.netid,
                            rpcid: RPCID.MurderPlayer,
                            targetnetid: playerid
                        }
                    ]
                }
            ]
        });
    }

    async setColour(colour: ColourID) {
        await this.client.send({
            op: PacketID.Reliable,
            payloads:[
                {
                    payloadid: PayloadID.GameDataTo,
                    recipient: this.client.game.hostid,
                    code: this.client.game.code,
                    parts: [
                        {
                            type: MessageID.RPC,
                            handlerid: this.netid,
                            rpcid: RPCID.CheckColour,
                            colour
                        }
                    ]
                }
            ]
        });
        
        await this.client.awaitPayload(payload => 
            payload.payloadid === PayloadID.GameData
            && payload.parts.some(part => part.type === MessageID.RPC && part.rpcid === RPCID.SetColour));
    }
    
    async setName(name: string) {
        await this.client.send({
            op: PacketID.Reliable,
            payloads: [
                {
                    payloadid: PayloadID.GameDataTo,
                    recipient: this.client.game.hostid,
                    code: this.client.game.code,
                    parts: [
                        {
                            type: MessageID.RPC,
                            handlerid: this.netid,
                            rpcid: RPCID.CheckName,
                            name
                        }
                    ]
                }
            ]
        });

        await this.client.awaitPayload(payload => 
            payload.payloadid === PayloadID.GameData
            && payload.parts.some(part => part.type === MessageID.RPC && part.rpcid === RPCID.SetName));
    }
    
    async setHat(hat: HatID) {
        await this.client.send({
            op: PacketID.Reliable,
            payloads: [
                {
                    payloadid: PayloadID.GameDataTo,
                    recipient: this.client.game.hostid,
                    code: this.client.game.code,
                    parts: [
                        {
                            type: MessageID.RPC,
                            handlerid: this.netid,
                            rpcid: RPCID.SetHat,
                            hat
                        }
                    ]
                }
            ]
        });
    }
    
    async setSkin(skin: SkinID) {
        await this.client.send({
            op: PacketID.Reliable,
            payloads: [
                {
                    payloadid: PayloadID.GameDataTo,
                    recipient: this.client.game.hostid,
                    code: this.client.game.code,
                    parts: [
                        {
                            type: MessageID.RPC,
                            handlerid: this.netid,
                            rpcid: RPCID.SetSkin,
                            skin: skin
                        }
                    ]
                }
            ]
        });
    }
    
    async setPet(pet: PetID) {
        await this.client.send({
            op: PacketID.Reliable,
            payloads: [
                {
                    payloadid: PayloadID.GameDataTo,
                    recipient: this.client.game.hostid,
                    code: this.client.game.code,
                    parts: [
                        {
                            type: MessageID.RPC,
                            handlerid: this.netid,
                            rpcid: RPCID.SetPet,
                            pet: pet
                        }
                    ]
                }
            ]
        });
    }

    async chat(text: string) {
        await this.client.send({
            op: PacketID.Reliable,
            payloads: [
                {
                    payloadid: PayloadID.GameData,
                    code: this.client.game.code,
                    parts: [
                        {
                            type: MessageID.RPC,
                            handlerid: this.netid,
                            rpcid: RPCID.SendChat,
                            text
                        }
                    ]
                }
            ]
        });
    }
}