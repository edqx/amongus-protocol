import { DataID, DisconnectID, MessageID, PacketID, PayloadID, RPCID } from "./constants/Enums.js";
import { BufferWriter } from "./util/BufferWriter.js";
export function composeGameOptions(bwrite, options) {
    bwrite.packed(options.length);
    bwrite.byte(options.version);
    bwrite.uint8(options.maxPlayers);
    bwrite.uint32LE(options.language);
    bwrite.byte(options.mapID);
    bwrite.floatLE(options.playerSpeed);
    bwrite.floatLE(options.crewVision);
    bwrite.floatLE(options.imposterVision);
    bwrite.floatLE(options.killCooldown);
    bwrite.uint8(options.commonTasks);
    bwrite.uint8(options.longTasks);
    bwrite.uint8(options.shortTasks);
    bwrite.int32LE(options.emergencies);
    bwrite.uint8(options.imposterCount);
    bwrite.byte(options.killDistance);
    bwrite.int32LE(options.discussionTime);
    bwrite.int32LE(options.votingTime);
    bwrite.bool(options.isDefault);
    if (options.version === 1 || options.version === 2 || options.version === 3) {
        bwrite.uint8(options.emergencyCooldown);
    }
    if (options.version === 2 || options.version === 3) {
        bwrite.bool(options.confirmEjects);
        bwrite.bool(options.visualTasks);
    }
    if (options.version === 3) {
        bwrite.bool(options.anonymousVoting);
        bwrite.uint8(options.taskBarUpdates);
    }
}
export function composePacket(packet, bound = "server") {
    packet.bound = bound;
    const bwrite = new BufferWriter;
    bwrite.uint8(packet.op);
    if (packet.op === PacketID.Reliable) {
        packet.reliable = true;
    }
    if (packet.op === PacketID.Unreliable) {
        packet.reliable = false;
    }
    if (packet.reliable) {
        bwrite.uint16BE(packet.nonce);
    }
    switch (packet.op) {
        case PacketID.Unreliable:
        case PacketID.Reliable:
            const lenpos = bwrite.offset;
            bwrite.jump(0x02); // Jump the length of the payload (will be written later).
            bwrite.uint8(packet.payloadid);
            switch (packet.payloadid) {
                case PayloadID.HostGame:
                    if (packet.bound === "server") {
                        composeGameOptions(bwrite, packet.options);
                    }
                    else if (packet.bound === "client") {
                        bwrite.int32LE(packet.code);
                    }
                    break;
                case PayloadID.JoinGame:
                    if (packet.bound === "server") {
                        bwrite.int32LE(packet.code);
                        bwrite.byte(packet.mapOwnership);
                    }
                    else if (packet.bound === "client") {
                        if (packet.reason) {
                            bwrite.uint8(packet.reason);
                            if (packet.reason === DisconnectID.Custom) {
                                bwrite.string(packet.message, true);
                            }
                        }
                    }
                    break;
                case PayloadID.StartGame:
                    bwrite.int32LE(packet.code);
                    break;
                case PayloadID.RemoveGame:
                    break;
                case PayloadID.RemovePlayer:
                    break;
                case PayloadID.GameData:
                case PayloadID.GameDataTo:
                    bwrite.int32LE(packet.code);
                    if (packet.payloadid === PayloadID.GameDataTo) {
                        bwrite.packed(packet.recipient);
                    }
                    for (let i = 0; i < packet.parts.length; i++) {
                        const mwrite = new BufferWriter;
                        const part = packet.parts[i];
                        switch (part.type) {
                            case MessageID.Data:
                                switch (part.dataid) {
                                    case DataID.Movement:
                                        mwrite.uint8(part.sequencePart1);
                                        mwrite.uint8(part.sequencePart2);
                                        mwrite.uint16LE(part.x);
                                        mwrite.uint16LE(part.y);
                                        mwrite.uint16LE(part.xvel);
                                        mwrite.uint16LE(part.yvel);
                                        break;
                                }
                                break;
                            case MessageID.RPC:
                                mwrite.packed(part.sendernetid);
                                mwrite.uint8(part.rpcid);
                                switch (part.rpcid) {
                                    case RPCID.PlayAnimation:
                                        mwrite.uint8(part.animation);
                                        break;
                                    case RPCID.CompleteTask:
                                        mwrite.uint8(part.taskid);
                                        break;
                                    case RPCID.SyncSettings:
                                        composeGameOptions(mwrite, part.options);
                                        break;
                                    case RPCID.SetInfected:
                                        mwrite.packed(part.count);
                                        mwrite.bytes(part.infected);
                                        break;
                                    case RPCID.Exiled:
                                        break;
                                    case RPCID.CheckName:
                                        mwrite.string(part.name, true);
                                        break;
                                    case RPCID.SetName:
                                        mwrite.string(part.name, true);
                                        break;
                                    case RPCID.CheckColour:
                                        mwrite.uint8(part.colour);
                                        break;
                                    case RPCID.SetColour:
                                        mwrite.uint8(part.colour);
                                        break;
                                    case RPCID.SetHat:
                                        mwrite.uint8(part.hat);
                                        break;
                                    case RPCID.SetSkin:
                                        mwrite.uint8(part.skin);
                                        break;
                                    case RPCID.ReportDeadBody:
                                        mwrite.uint8(part.player);
                                        break;
                                    case RPCID.MurderPlayer:
                                        mwrite.packed(part.targetnetid);
                                        break;
                                    case RPCID.SendChat:
                                        mwrite.string(part.text, true);
                                        break;
                                    case RPCID.StartMeeting:
                                        mwrite.uint8(part.player);
                                        break;
                                    case RPCID.SetScanner:
                                        mwrite.bool(part.scanning);
                                        mwrite.uint8(part.count);
                                        break;
                                    case RPCID.SendChatNote:
                                        mwrite.uint8(part.playerid);
                                        mwrite.uint8(part.notetype);
                                        break;
                                    case RPCID.SetPet:
                                        mwrite.uint8(part.pet);
                                        break;
                                    case RPCID.SetStartCounter:
                                        mwrite.packed(part.sequence);
                                        mwrite.int8(part.time);
                                        break;
                                    case RPCID.EnterVent:
                                        mwrite.packed(part.sequence);
                                        mwrite.packed(part.vent);
                                        break;
                                    case RPCID.ExitVent:
                                        mwrite.packed(part.vent);
                                        break;
                                    case RPCID.SnapTo:
                                        mwrite.floatLE(part.x);
                                        mwrite.floatLE(part.y);
                                        break;
                                    case RPCID.Close:
                                        break;
                                    case RPCID.VotingComplete:
                                        mwrite.packed(part.num_states);
                                        mwrite.bytes(part.states);
                                        mwrite.uint8(part.exiled);
                                        mwrite.bool(part.tie);
                                        break;
                                    case RPCID.CastVote:
                                        mwrite.uint8(part.playerid);
                                        mwrite.uint8(part.suspectid);
                                        break;
                                    case RPCID.ClearVote:
                                        break;
                                    case RPCID.AddVote:
                                        mwrite.uint8(part.playerid);
                                        break;
                                    case RPCID.CloseDoorsOfType:
                                        mwrite.uint8(part.systemtype);
                                        break;
                                    case RPCID.RepairSystem:
                                        mwrite.uint8(part.systemtype);
                                        mwrite.packed(part.sendernetid);
                                        mwrite.uint8(part.amount);
                                        break;
                                    case RPCID.SetTasks:
                                        mwrite.uint8(part.playerid);
                                        mwrite.packed(part.num_tasks);
                                        mwrite.bytes(part.tasks);
                                        break;
                                    case RPCID.UpdateGameData:
                                        for (let i = 0; i < part.players.length; i++) {
                                            const player = part.players[i];
                                            const pwrite = new BufferWriter;
                                            pwrite.uint8(player.playerid);
                                            pwrite.string(player.name, true);
                                            pwrite.uint8(player.colour);
                                            pwrite.packed(player.hat);
                                            pwrite.packed(player.pet);
                                            pwrite.packed(player.skin);
                                            pwrite.byte(player.flags);
                                            pwrite.uint8(player.num_tasks);
                                            for (let i = 0; i < player.num_tasks; i++) {
                                                const task = player.tasks[i];
                                                pwrite.packed(task.taskid);
                                                pwrite.bool(task.completed);
                                            }
                                            mwrite.uint16LE(pwrite.size - 1);
                                            mwrite.write(pwrite);
                                        }
                                        break;
                                }
                                break;
                            case MessageID.Spawn: // WIP
                                mwrite.packed(part.spawnid);
                                mwrite.packed(part.ownerid);
                                mwrite.byte(part.flags);
                                mwrite.packed(part.num_components);
                                break;
                            case MessageID.Despawn:
                                mwrite.packed(part.netid);
                                break;
                            case MessageID.SceneChange:
                                mwrite.packed(part.clientid);
                                mwrite.string(part.location, true);
                                break;
                            case MessageID.Ready:
                                mwrite.packed(part.clientid);
                                break;
                            case MessageID.ChangeSettings:
                                break;
                        }
                        bwrite.uint16LE(mwrite.size);
                        bwrite.uint8(part.type);
                        bwrite.write(mwrite);
                    }
                    break;
                case PayloadID.JoinedGame:
                    bwrite.int32LE(packet.code);
                    bwrite.uint32LE(packet.clientid);
                    bwrite.uint32LE(packet.hostid);
                    bwrite.packed(packet.num_clients);
                    for (let i = 0; i < packet.num_clients; i++) {
                        bwrite.packed(packet.clients[i]);
                        break;
                    }
                    break;
                case PayloadID.EndGame:
                    bwrite.int32LE(packet.code);
                    bwrite.uint8(packet.reason);
                    bwrite.bool(packet.show_ad);
                    break;
                case PayloadID.AlterGame:
                    bwrite.int32LE(packet.code);
                    bwrite.byte(packet.tag);
                    bwrite.bool(packet.is_public);
                    break;
                case PayloadID.Redirect:
                    bwrite.bytes(packet.ip.split(".").map(val => parseInt(val)));
                    bwrite.uint16LE(packet.port);
                    break;
                case PayloadID.MasterServerList:
                    bwrite.uint8(0x01);
                    bwrite.uint8(packet.num_servers);
                    for (let i = 0; i < packet.servers.length; i++) {
                        const server = packet.servers[i];
                        const swrite = new BufferWriter;
                        swrite.byte(server.flag);
                        swrite.string(server.name, true);
                        swrite.bytes(server.ip.split(".").map(val => parseInt(val)));
                        swrite.uint16LE(server.port);
                        swrite.uint16LE(server.num_players);
                        bwrite.uint16LE(swrite.size);
                        bwrite.write(swrite);
                    }
                    break;
                case PayloadID.GameList:
                    if (packet.bound === "client") {
                        const glwrite = new BufferWriter;
                        for (let i = 0; i < packet.games.length; i++) {
                            const game = packet.games[i];
                            const gwrite = new BufferWriter;
                            gwrite.bytes(game.ip.split(".").map(val => parseInt(val)));
                            gwrite.uint16LE(game.port);
                            gwrite.int32LE(game.code);
                            gwrite.string(game.name, true);
                            gwrite.uint8(game.num_players);
                            gwrite.packed(game.age);
                            gwrite.uint8(game.map);
                            gwrite.uint8(game.imposters);
                            gwrite.uint8(game.max_players);
                            glwrite.uint16LE(gwrite.size);
                            glwrite.uint8(0x00);
                            glwrite.write(gwrite);
                        }
                        bwrite.uint16LE(glwrite.size);
                        bwrite.uint8(0x00);
                        bwrite.write(glwrite);
                    }
                    else if (packet.bound === "server") {
                        bwrite.uint8(0x00);
                        composeGameOptions(bwrite, packet.options);
                    }
                    break;
            }
            bwrite.goto(lenpos);
            bwrite.uint16LE(bwrite.buffer.slice(lenpos + 3).byteLength); // Length of the payload (not including the type).
            break;
        case PacketID.Hello:
            bwrite.string(packet.username, true);
            break;
        case PacketID.Disconnect:
            if (packet.reason) {
                bwrite.uint8(packet.reason);
                if (packet.reason === DisconnectID.Custom) {
                    bwrite.string(packet.message, true);
                }
            }
            break;
        case PacketID.Acknowledge:
            bwrite.uint16LE(packet.nonce);
            bwrite.uint8(0xFF);
            break;
        case PacketID.Ping:
            // Nonce is already writer.
            break;
    }
    return bwrite.buffer;
}
