import { AmongusClient } from "../../Client.js"

import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    VotePlayerState,
    PlayerVoteAreaFlags
} from "../../interfaces/Packets.js";

export interface MeetingHud {
    on(event: "update", listener: (states: Map<number, VotePlayerState>) => void);
}

export class MeetingHud extends Component {
    name: "MeetingHub";
    classname: "MeetingHud";

    states: Map<number, VotePlayerState>

    constructor(client: AmongusClient, netid: number, datalen?: number, data?: Buffer) {
        super(client, netid);
        
        this.name = "MeetingHub";
        this.classname = "MeetingHud";

        this.states = new Map;

        if (typeof datalen !== "undefined" && typeof data !== "undefined") {
            this.OnSpawn(datalen, data);
        }
    }

    OnSpawn(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);

        for (let playerId = 0; playerId < datalen; playerId++) {
            const flags = reader.byte();

            const state = {
                flags,
                playerId,
                votedFor: flags & PlayerVoteAreaFlags.VotedFor,
                reported: (flags & PlayerVoteAreaFlags.DidReport) !== 0,
                voted: (flags & PlayerVoteAreaFlags.DidVote) !== 0,
                dead: (flags & PlayerVoteAreaFlags.IsDead) !== 0
            }

            this.states.set(playerId, state);
        }
        
        this.emit("update", this.states);
    }

    OnDeserialize(datalen: number, data: Buffer): number {
        const reader = new BufferReader(data);
        
        const updateMask = reader.packed();

        const updated = new Map<number, VotePlayerState>();

        for (let playerId = 0; reader.offset < reader.size; playerId++) {
            const flags = reader.byte();

            if (((1 << playerId) & updateMask) !== 0) {
                const state = {
                    flags,
                    playerId,
                    votedFor: flags & PlayerVoteAreaFlags.VotedFor,
                    reported: (flags & PlayerVoteAreaFlags.DidReport) !== 0,
                    voted: (flags & PlayerVoteAreaFlags.DidVote) !== 0,
                    dead: (flags & PlayerVoteAreaFlags.IsDead) !== 0
                };

                this.states.set(playerId, state);

                updated.set(playerId, state);
            }
        }

        this.emit("update", updated);

        return updateMask;
    }
}