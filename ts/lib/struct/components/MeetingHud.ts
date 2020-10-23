import { AmongusClient } from "../../Client.js"

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

export class MeetingHud extends Component {
    name: "MeetingHub";
    classname: "MeetingHud";

    states: { [key: number]: MeetingHudPlayerState };

    constructor(client: AmongusClient, netid: number, datalen: number, data: Buffer) {
        super(client, netid);

        this.OnSpawn(datalen, data);
    }

    OnSpawn(datalen: number, data: Buffer): void {
        const reader = new BufferReader(data);

        for (let playerId = 0; playerId < datalen; playerId++) {
            const flags = reader.uint8();

            this.states[playerId] = {
                flags,
                playerId,
                votedFor: flags & PlayerVoteAreaFlags.VotedFor,
                reported: (flags & PlayerVoteAreaFlags.DidReport) !== 0,
                voted: (flags & PlayerVoteAreaFlags.DidVote) !== 0,
                dead: (flags & PlayerVoteAreaFlags.IsDead) !== 0
            }
        }
    }

    OnDeserialize(datalen: number, data: Buffer): number {
        const reader = new BufferReader(data);
        
        const updateMask = reader.packed();

        for (let playerId = 0; playerId < datalen; playerId++) {
            const flags = reader.uint8();

            this.states[playerId] = {
                flags,
                playerId,
                votedFor: flags & PlayerVoteAreaFlags.VotedFor,
                reported: (flags & PlayerVoteAreaFlags.DidReport) !== 0,
                voted: (flags & PlayerVoteAreaFlags.DidVote) !== 0,
                dead: (flags & PlayerVoteAreaFlags.IsDead) !== 0
            }
        }

        return updateMask;
    }
}