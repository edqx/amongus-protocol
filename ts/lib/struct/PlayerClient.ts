import { AmongusClient } from "../Client.js"

import { Player } from "./Player.js"
import { Game } from "./Game.js"

import {
    ColourID,
    HatID,
    MessageID,
    PacketID,
    PayloadID,
    PetID,
    RPCID,
    SkinID,
    SpawnID
} from "../constants/Enums.js"

import { ComponentData } from "../interfaces/Packets.js"

import { EventEmitter } from "events"
import { POINT_CONVERSION_HYBRID } from "constants"

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
                        handlerid: this.object.components.PlayerControl.netid,
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
                        handlerid: this.object.components.PlayerControl.netid,
                        rpcid: RPCID.CheckName,
                        name
                    }
                ]
            });
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
                        handlerid: this.object.components.PlayerControl.netid,
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
                        handlerid: this.object.components.PlayerControl.netid,
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
                        handlerid: this.object.components.PlayerControl.netid,
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
                        handlerid: this.object.components.PlayerControl.netid,
                        rpcid: RPCID.SendChat,
                        text
                    }
                ]
            });
        }
    }
}