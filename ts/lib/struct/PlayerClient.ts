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
    on(event: "vote", listener: (suspect: PlayerClient) => void);
    on(event: "kicked", listener: (banned: boolean) => void);
    on(event: "murder", listener: (target: PlayerClient) => void);
    on(event: "murdered", listener: (murderer: PlayerClient) => void);
}

export class PlayerClient extends EventEmitter {
    spawned: boolean;
    object: Player;

    removed: boolean;
    dead: boolean;

    constructor (private client: AmongusClient, public game: Game, public clientid: number) {
        super();

        this.spawned = false;
        this.removed = false;

        this.dead = false;
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

    get imposter() {
        return !!this.game.imposters.find(imposter => imposter.PlayerControl.playerId === this.PlayerControl.playerId);
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

    async kick(ban: boolean = false) {
        if (!this.removed) {
            await this.client.send({
                op: PacketID.Reliable,
                payloadid: PayloadID.KickPlayer,
                bound: "server",
                clientid: this.clientid,
                banned: ban
            });
        }
    }

    async ban() {
        return this.kick(true);
    }

    async murder(target: PlayerClient) {
        if (this.spawned && !this.removed) {
            await this.client.send({
                op: PacketID.Reliable,
                payloadid: PayloadID.GameDataTo,
                recipient: this.game.hostid,
                code: this.game.code,
                parts: [
                    {
                        type: MessageID.RPC,
                        handlerid: this.PlayerControl.netid,
                        rpcid: RPCID.MurderPlayer,
                        targetnetid: target.PlayerControl.netid
                    }
                ]
            });
        }
    }

    async setName(name: string) {
        if (this.spawned && !this.removed) {
            await this.PlayerControl.setName(name);
        }
    }

    async setColour(colour: ColourID) {
        if (this.spawned && !this.removed) {
            await this.PlayerControl.setColour(colour);
        }
    }

    async setHat(hat: HatID) {
        if (this.spawned && !this.removed) {
            await this.PlayerControl.setHat(hat);
        }
    }

    async setSkin(skin: SkinID) {
        if (this.spawned && !this.removed) {
            await this.PlayerControl.setSkin(skin);
        }
    }

    async setPet(pet: PetID) {
        if (this.spawned && !this.removed) {
            await this.PlayerControl.setPet(pet);
        }
    }

    async chat(text: string) {
        if (this.spawned && !this.removed) {
            await this.PlayerControl.chat(text);
        }
    }

    async move(position: Vector2, velocity: Vector2) {
        if (this.spawned && !this.removed) {
            await this.CustomNetworkTransform.move(position, velocity);
        }
    }

    async snapTo(position: Vector2) {
        if (this.spawned && !this.removed) {
            await this.CustomNetworkTransform.snapTo(position);
        }
    }
}