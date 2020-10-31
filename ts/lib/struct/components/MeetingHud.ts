import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    MeetingHudPlayerState,
    PlayerVoteAreaFlags
} from "../../interfaces/Packets.js";

export class MeetingHud extends Component {
    name: "MeetingHub";
    classname: "MeetingHud";

    states: Map<number, MeetingHudPlayerState>

    constructor(client: AmongusClient, netid: number, datalen?: number, data?: Buffer) {
        super(client, netid);

        this.states = new Map;

        if (typeof datalen !== "undefined" && typeof data !== "undefined") {
            this.OnSpawn(datalen, data);
        }
    }

    OnSpawn(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);

        for (let playerId = 0; playerId < datalen; playerId++) {
            const flags = reader.byte();

            this.states.set(playerId, {
                flags,
                playerId,
                votedFor: flags & PlayerVoteAreaFlags.VotedFor,
                reported: (flags & PlayerVoteAreaFlags.DidReport) !== 0,
                voted: (flags & PlayerVoteAreaFlags.DidVote) !== 0,
                dead: (flags & PlayerVoteAreaFlags.IsDead) !== 0
            });
        }
    }

    OnDeserialize(datalen: number, data: Buffer): number {
        const reader = new BufferReader(data);
        
        const updateMask = reader.packed();

        for (let playerId = 0; reader.offset < reader.size; playerId++) {
            const flags = reader.byte();

            if (((1 << playerId) & updateMask) !== 0) {
                this.states.set(playerId, {
                    flags,
                    playerId,
                    votedFor: flags & PlayerVoteAreaFlags.VotedFor,
                    reported: (flags & PlayerVoteAreaFlags.DidReport) !== 0,
                    voted: (flags & PlayerVoteAreaFlags.DidVote) !== 0,
                    dead: (flags & PlayerVoteAreaFlags.IsDead) !== 0
                });
            }
        }

        return updateMask;
    }
}