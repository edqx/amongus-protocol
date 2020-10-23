import { Component } from "./Component.js"
import { BufferReader } from "../../util/BufferReader.js"

import {
    packed,
    uint8
} from "../../interfaces/Types.js"

import {
    MeetingHudPlayerState,
    PlayerVoteAreaFlags
} from "../../interfaces/Packets.js";

interface MeetingHudOnSpawn {
    playerStates: MeetingHudPlayerState[];
}

interface MeetingHudOnDeserialize {
    updateMask: packed;
    playerStates: MeetingHudPlayerState[];
}

export class MeetingHud extends Component {
    constructor(public netid: number, datalen: number, data: Buffer) {
        super(netid, datalen, data);

        this.OnSpawn(datalen, data);
    }

    OnSpawn(datalen: number, data: Buffer): MeetingHudOnSpawn {
        const reader = new BufferReader(data);

        const playerStates: MeetingHudPlayerState[] = [];

        for (let playerId = 0; playerId < datalen; playerId++) {
            const flags = reader.uint8();

            playerStates.push({
                flags,
                playerId,
                votedFor: flags & PlayerVoteAreaFlags.VotedFor,
                reported: (flags & PlayerVoteAreaFlags.DidReport) !== 0,
                voted: (flags & PlayerVoteAreaFlags.DidVote) !== 0,
                dead: (flags & PlayerVoteAreaFlags.IsDead) !== 0
            });
        }

        return {
            playerStates
        }
    }

    OnDeserialize(datalen: number, data: Buffer): MeetingHudOnDeserialize {
        const reader = new BufferReader(data);

        const updateMask = reader.packed(); 

        const num_players = datalen - reader.offset;
        const playerStates: MeetingHudPlayerState[] = [];

        for (let playerId = 0; playerId < num_players; playerId++) {
            if ((updateMask & (1 << playerId)) !== 0) {
                const flags = reader.uint8();

                playerStates.push({
                    flags,
                    playerId,
                    votedFor: flags & PlayerVoteAreaFlags.VotedFor,
                    reported: (flags & PlayerVoteAreaFlags.DidReport) !== 0,
                    voted: (flags & PlayerVoteAreaFlags.DidVote) !== 0,
                    dead: (flags & PlayerVoteAreaFlags.IsDead) !== 0
                });
            }
        }

        return {
            updateMask,
            playerStates
        }
    }
}