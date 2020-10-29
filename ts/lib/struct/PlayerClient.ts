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

import {
    float,
    uint16,
    uint8,
    Vector2
} from "../interfaces/Types.js"

import { BufferWriter } from "../util/BufferWriter.js"

import { UnlerpValue } from "../util/Lerp.js"
import { PlayerTaskState } from "../interfaces/Packets.js"
import { GameObject } from "./objects/GameObject.js"

export interface PlayerClient {
    on(event: "spawn", listener: (player: Player) => void);
    on(event: "taskComplete", listener: (task: PlayerTaskState) => void);
    on(event: "setTasks", listener: (tasks: TaskID[]) => void);
    on(event: "vote", listener: (suspect: PlayerClient) => void);
    on(event: "kicked", listener: (banned: boolean) => void);
    on(event: "murder", listener: (target: PlayerClient) => void);
    on(event: "murdered", listener: (murderer: PlayerClient) => void);
}

export class PlayerClient extends GameObject {
    children: Player[];

    removed: boolean;
    dead: boolean;

    tasks: TaskID[];

    constructor (protected client: AmongusClient, public clientid: number) {
        super(client, client);

        this.removed = false;
        this.dead = false;

        this.tasks = [];
    }

    awaitSpawn() {
        return new Promise<void>(resolve => {
            if (this.Player) {
                return resolve();
            }

            this.once("spawn", () => {
                resolve();
            });
        });
    }

    addChild(object: GameObject) {
        super.addChild(object);

        this.client.game.registerComponents(object);
        
        if (object instanceof Player) this.emit("spawn", object);
    }

    get imposter() {
        return !!this.client.game.imposters.find(imposter => imposter.Player.PlayerControl.playerId === this.Player.PlayerControl.playerId);
    }

    get Player() {
        return this.children[0];
    }

    get PlayerData() {
        return this.client.game.GameData.GameData.players.get(this.Player.PlayerControl.playerId);
    }

    get name() {
        return this.PlayerData?.name;
    }

    async kick(ban: boolean = false) {
        if (!this.removed) {
            await this.client.send({
                op: PacketID.Reliable,
                payloads: [
                    {
                        bound: "server",
                        payloadid: PayloadID.KickPlayer,
                        clientid: this.clientid,
                        banned: ban
                    }
                ]
            });
        }
    }

    async ban() {
        return this.kick(true);
    }

    async murder(target: PlayerClient) {
        if (this.Player && !this.removed) {
            this.Player.PlayerControl.murderPlayer(target.Player.PlayerControl.playerId);
        }
    }

    _setTasks(tasks: TaskID[]) {
        this.tasks = tasks;

        this.emit("setTasks", this.tasks);
    }

    async setTasks(tasks: TaskID[]) {
        this._setTasks(tasks);

        await this.client.send({
            op: PacketID.Reliable,
            payloads: [
                {
                    payloadid: PayloadID.GameData,
                    code: this.client.game.code,
                    parts: [
                        {
                            type: MessageID.RPC,
                            handlerid: this.client.game.GameData.GameData.netid,
                            rpcid: RPCID.SetTasks,
                            playerid: this.Player.PlayerControl.playerId,
                            num_tasks: tasks.length,
                            tasks
                        }
                    ]
                }
            ]
        });
    }
    
    async vote(player: PlayerClient) {
        if (this.Player && !this.removed) {
            await this.client.send({
                op: PacketID.Reliable,
                payloads: [
                    {
                        payloadid: PayloadID.GameData,
                        code: this.client.game.code,
                        parts: [
                            {
                                type: MessageID.RPC,
                                rpcid: RPCID.CastVote,
                                handlerid: this.Player.PlayerControl.netid,
                                voterid: this.Player.PlayerControl.playerId,
                                suspectid: player.Player.PlayerControl.playerId
                            },
                            {
                                type: MessageID.RPC,
                                rpcid: RPCID.SendChatNote,
                                handlerid: this.Player.PlayerControl.playerId,
                                playerid: this.Player.PlayerControl.playerId,
                                notetype: 0x00
                            }
                        ]
                    }
                ]
            });
        }
    }

    async ready() {
        await this.client.send({
            op: PacketID.Reliable,
            payloads: [
                {
                    payloadid: PayloadID.GameData,
                    code: this.client.game.code,
                    parts: [
                        {
                            type: MessageID.Ready,
                            clientid: this.clientid
                        }
                    ]
                }
            ]
        });
    }

    async setName(name: string) {
        if (this.Player && !this.removed) {
            await this.Player.PlayerControl.setName(name);
        }
    }

    async setColour(colour: ColourID) {
        if (this.Player && !this.removed) {
            await this.Player.PlayerControl.setColour(colour);
        }
    }

    async setHat(hat: HatID) {
        if (this.Player && !this.removed) {
            await this.Player.PlayerControl.setHat(hat);
        }
    }

    async setSkin(skin: SkinID) {
        if (this.Player && !this.removed) {
            await this.Player.PlayerControl.setSkin(skin);
        }
    }

    async setPet(pet: PetID) {
        if (this.Player && !this.removed) {
            await this.Player.PlayerControl.setPet(pet);
        }
    }

    async chat(text: string) {
        if (this.Player && !this.removed) {
            await this.Player.PlayerControl.chat(text);
        }
    }

    async move(position: Vector2, velocity: Vector2) {
        if (this.Player && !this.removed) {
            await this.Player.CustomNetworkTransform.move(position, velocity);
        }
    }

    async snapTo(position: Vector2) {
        if (this.Player && !this.removed) {
            await this.Player.CustomNetworkTransform.snapTo(position);
        }
    }
}