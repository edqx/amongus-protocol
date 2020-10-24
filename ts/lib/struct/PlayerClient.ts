import { AmongusClient } from "../Client.js"

import { Player } from "./objects/Player.js"
import { Game } from "./Game.js"
import { CustomNetworkTransform } from "./components/CustomNetworkTransform.js"

import {
    ColourID,
    DataID,
    HatID,
    MessageID,
    PacketID,
    PayloadID,
    PetID,
    RPCID,
    SkinID,
    SpawnID
} from "../constants/Enums.js"

import { EventEmitter } from "events"
import { float, uint16 } from "../interfaces/Types.js"
import { BufferWriter } from "../util/BufferWriter.js"

export interface PlayerClient {
    on(event: "spawn", listener: (player: Player) => void);
}

export class PlayerClient extends EventEmitter {
    spawned: boolean;
    object: Player;

    constructor (private client: AmongusClient, public game: Game, public clientid: number) {
        super();

        this.spawned = false;
    }

    spawn(object: Player) {
        this.object = object;
        this.spawned = true;
        
        this.emit("spawn", object);
    }

    get PlayerControl() {
        return this?.object?.components?.PlayerControl;
    }

    get CustomNetworkTransform() {
        return this?.object?.components?.CustomNetworkTransform;
    }

    async setColour(colour: ColourID) {
        if (this.spawned) {
            await this.client.send({
                op: PacketID.Reliable,
                payloadid: PayloadID.GameDataTo,
                recipient: this.game.hostid,
                code: this.game.code,
                parts: [
                    {
                        type: MessageID.RPC,
                        handlerid: this.PlayerControl.netid,
                        rpcid: RPCID.CheckColour,
                        colour
                    }
                ]
            });
        }
    }
    
    async setName(name: string) {
        if (this.spawned) {
            await this.client.send({
                op: PacketID.Reliable,
                payloadid: PayloadID.GameDataTo,
                recipient: this.game.hostid,
                code: this.game.code,
                parts: [
                    {
                        type: MessageID.RPC,
                        handlerid: this.PlayerControl.netid,
                        rpcid: RPCID.CheckName,
                        name
                    }
                ]
            });

            await this.client.awaitPacket(packet => packet.bound === "client"
                && packet.op === PacketID.Reliable
                && packet.payloadid === PayloadID.GameData
                && !!packet.parts.find(part => part.type === MessageID.RPC && part.rpcid === RPCID.SetName));
        }
    }
    
    async setHat(hat: HatID) {
        if (this.spawned) {
            await this.client.send({
                op: PacketID.Reliable,
                payloadid: PayloadID.GameDataTo,
                recipient: this.game.hostid,
                code: this.game.code,
                parts: [
                    {
                        type: MessageID.RPC,
                        handlerid: this.PlayerControl.netid,
                        rpcid: RPCID.SetHat,
                        hat
                    }
                ]
            });
        }
    }
    
    async setSkin(skin: SkinID) {
        if (this.spawned) {
            await this.client.send({
                op: PacketID.Reliable,
                payloadid: PayloadID.GameDataTo,
                recipient: this.game.hostid,
                code: this.game.code,
                parts: [
                    {
                        type: MessageID.RPC,
                        handlerid: this.PlayerControl.netid,
                        rpcid: RPCID.SetSkin,
                        skin: skin
                    }
                ]
            });
        }
    }
    
    async setPet(pet: PetID) {
        if (this.spawned) {
            await this.client.send({
                op: PacketID.Reliable,
                payloadid: PayloadID.GameDataTo,
                recipient: this.game.hostid,
                code: this.game.code,
                parts: [
                    {
                        type: MessageID.RPC,
                        handlerid: this.PlayerControl.netid,
                        rpcid: RPCID.SetPet,
                        pet: pet
                    }
                ]
            });
        }
    }

    async chat(text: string) {
        if (this.spawned) {
            await this.client.send({
                op: PacketID.Reliable,
                payloadid: PayloadID.GameData,
                code: this.game.code,
                parts: [
                    {
                        type: MessageID.RPC,
                        handlerid: this.PlayerControl.netid,
                        rpcid: RPCID.SendChat,
                        text
                    }
                ]
            });
        }
    }
}