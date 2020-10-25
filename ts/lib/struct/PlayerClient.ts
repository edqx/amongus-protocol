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
    SpawnID,
    TaskID
} from "../constants/Enums.js"

import { EventEmitter } from "events"
import {
    float,
    uint16,
    Vector2
} from "../interfaces/Types.js"
import { BufferWriter } from "../util/BufferWriter.js"

import { UnlerpValue } from "../util/Lerp.js"
import { PlayerTaskState } from "../interfaces/Packets.js"

export interface PlayerClient {
    on(event: "spawn", listener: (player: Player) => void);
    on(event: "taskComplete", listener: (task: PlayerTaskState) => void);
    on(event: "setTasks", listener: (tasks: Map<TaskID, PlayerTaskState>) => void);
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

    awaitSpawn() {
        return new Promise<void>(resolve => {
            if (this.spawned) {
                return resolve();
            }

            this.once("spawn", () => {
                resolve();
            });
        });
    }

    get infected() {
        return this.game.imposters.find(imposter => imposter.PlayerControl.playerId === this.PlayerControl.playerId);
    }

    get PlayerControl() {
        return this?.object?.components?.PlayerControl;
    }

    get PlayerPhysics() {
        return this?.object?.components?.PlayerPhysics;
    }

    get CustomNetworkTransform() {
        return this?.object?.components?.CustomNetworkTransform;
    }

    get PlayerData() {
        return this.game.GameData.GameData.players.get(this.PlayerControl.playerId);
    }

    get name() {
        return this.PlayerData?.name;
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
            this.PlayerData.hat = hat;

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
                    },
                    {
                        type: MessageID.RPC,
                        handlerid: this.game.GameData.GameData.netid,
                        rpcid: RPCID.UpdateGameData,
                        players: [
                            this.PlayerData.toJSON()
                        ]
                    }
                ]
            });
        }
    }
    
    async setSkin(skin: SkinID) {
        if (this.spawned) {
            this.PlayerData.skin = skin;

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
                    },
                    {
                        type: MessageID.RPC,
                        handlerid: this.game.GameData.GameData.netid,
                        rpcid: RPCID.UpdateGameData,
                        players: [
                            this.PlayerData.toJSON()
                        ]
                    }
                ]
            });
        }
    }
    
    async setPet(pet: PetID) {
        if (this.spawned) {
            this.PlayerData.pet = pet;

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
                    },
                    {
                        type: MessageID.RPC,
                        handlerid: this.game.GameData.GameData.netid,
                        rpcid: RPCID.UpdateGameData,
                        players: [
                            this.PlayerData.toJSON()
                        ]
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

    async move(position: Vector2, velocity: Vector2) {
        const nettransform = this.CustomNetworkTransform;

        const data = new BufferWriter;
        nettransform.sequence++;
        data.uint8(nettransform.sequence);
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
                    netid: nettransform.netid,
                    datalen: data.size,
                    data: data.buffer
                }
            ]
        });
    }

    async snapTo(position: Vector2) {
        const nettransform = this.CustomNetworkTransform;

        await this.client.send({
            op: PacketID.Reliable,
            payloadid: PayloadID.GameData,
            code: this.game.code,
            parts: [
                {
                    type: MessageID.RPC,
                    handlerid: nettransform.netid,
                    rpcid: RPCID.SnapTo,
                    x: UnlerpValue(position.x, -40, 40) * 65535,
                    y: UnlerpValue(position.y, -40, 40) * 65535
                }
            ]
        });
    }
}