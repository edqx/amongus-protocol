import { DataID, DisconnectID, MessageID, PacketID, PayloadID, RPCID, SpawnID } from "./constants/Enums.js";
import { DisconnectMessages } from "./constants/DisconnectMessages.js";
import { BufferReader } from "./util/BufferReader.js";
export function parseGameOptions(reader) {
    let options = {};
    options.length = reader.packed();
    options.version = reader.byte();
    options.maxPlayers = reader.uint8();
    options.language = reader.uint32LE();
    options.mapID = reader.byte();
    options.playerSpeed = reader.floatLE();
    options.crewVision = reader.floatLE();
    options.imposterVision = reader.floatLE();
    options.killCooldown = reader.floatLE();
    options.commonTasks = reader.uint8();
    options.longTasks = reader.uint8();
    options.shortTasks = reader.uint8();
    options.emergencies = reader.int32LE();
    options.imposterCount = reader.uint8();
    options.killDistance = reader.byte();
    options.discussionTime = reader.int32LE();
    options.votingTime = reader.int32LE();
    options.isDefault = reader.bool();
    if (options.version === 1 || options.version === 2 || options.version === 3) {
        options.emergencyCooldown = reader.uint8();
    }
    if (options.version === 2 || options.version === 3) {
        options.confirmEjects = reader.bool();
        options.visualTasks = reader.bool();
    }
    if (options.version === 3) {
        options.anonymousVoting = reader.bool();
        options.taskBarUpdates = reader.uint8();
    }
    return options;
}
export function parseDisconnect(reader) {
    let data;
    if (reader.offset < reader.size) {
        data.reason = reader.uint8();
        if (data.reason === DisconnectID.Custom) {
            data.message = reader.string();
        }
        else {
            data.message = DisconnectMessages[data.reason];
        }
    }
    return data;
}
export function parsePacket(buffer, bound = "client") {
    const reader = new BufferReader(buffer);
    let data = {};
    data.op = reader.byte();
    data.bound = bound;
    if (reader.size > 1) {
        switch (data.op) {
            case PacketID.Unreliable:
            case PacketID.Reliable:
                data.reliable = data.op === PacketID.Reliable;
                if (data.reliable) {
                    data.nonce = reader.uint16BE();
                }
                const payload_len = reader.uint16LE();
                data.payloadid = reader.uint8();
                const payload_start = reader.offset;
                const payload_end = payload_start + payload_len;
                switch (data.payloadid) {
                    case PayloadID.HostGame:
                        if (data.bound === "client") {
                            data.code = reader.int32LE();
                        }
                        else if (data.bound === "server") {
                            data.options = parseGameOptions(reader);
                        }
                        break;
                    case PayloadID.JoinGame:
                        if (data.bound === "client") {
                            const dc = parseDisconnect(reader);
                            data.reason = dc.reason;
                            data.message = dc.message;
                        }
                        else if (data.bound === "server") {
                            data.code;
                        }
                        break;
                    case PayloadID.StartGame:
                        data.code = reader.int32LE();
                        break;
                    case PayloadID.RemoveGame:
                        break;
                    case PayloadID.RemovePlayer:
                        break;
                    case PayloadID.GameData:
                    case PayloadID.GameDataTo:
                        data.code = reader.int32LE();
                        if (data.payloadid === PayloadID.GameDataTo) {
                            data.recipient = reader.packed();
                        }
                        data.parts = [];
                        while (reader.offset < payload_end) {
                            let part = {};
                            const part_len = reader.uint16LE();
                            part.type = reader.uint8();
                            const part_start = reader.offset;
                            const part_end = part_start + part_len;
                            switch (part.type) {
                                case MessageID.Data:
                                    part.dataid = reader.uint8();
                                    switch (part.dataid) {
                                        case DataID.Movement:
                                            part.sequencePart1 = reader.byte();
                                            part.sequencePart2 = reader.byte();
                                            part.x = reader.uint16LE(); // Should be float 16
                                            part.y = reader.uint16LE(); // Should be float 16
                                            part.xvel = reader.uint16LE(); // Should be float 16
                                            part.yvel = reader.uint16LE(); // Should be float 16
                                            break;
                                    }
                                    break;
                                case MessageID.RPC:
                                    part.sendernetid = reader.packed();
                                    part.rpcid = reader.uint8();
                                    switch (part.rpcid) {
                                        case RPCID.PlayAnimation:
                                            part.animation = reader.byte();
                                            break;
                                        case RPCID.CompleteTask:
                                            part.taskid = reader.uint8();
                                            break;
                                        case RPCID.SyncSettings:
                                            part.options = parseGameOptions(reader);
                                            break;
                                        case RPCID.SetInfected:
                                            part.count = reader.packed();
                                            part.infected = reader.bytes(part.count);
                                            break;
                                        case RPCID.Exiled:
                                            break;
                                        case RPCID.CheckName:
                                            part.name = reader.string();
                                            break;
                                        case RPCID.SetName:
                                            part.name = reader.string();
                                            break;
                                        case RPCID.CheckColour:
                                            part.colour = reader.uint8();
                                            break;
                                        case RPCID.SetColour:
                                            part.colour = reader.uint8();
                                            break;
                                        case RPCID.SetHat:
                                            part.hat = reader.uint8();
                                            break;
                                        case RPCID.SetSkin:
                                            part.skin = reader.uint8();
                                            break;
                                        case RPCID.ReportDeadBody:
                                            part.player = reader.uint8();
                                            break;
                                        case RPCID.MurderPlayer:
                                            part.targetnetid = reader.packed();
                                            break;
                                        case RPCID.SendChat:
                                            part.text = reader.string();
                                            break;
                                        case RPCID.StartMeeting:
                                            part.player = reader.uint8();
                                            break;
                                        case RPCID.SetScanner:
                                            part.scanning = reader.bool();
                                            part.count = reader.uint8();
                                            break;
                                        case RPCID.SendChatNote:
                                            part.playerid = reader.uint8();
                                            part.notetype = reader.uint8();
                                            break;
                                        case RPCID.SetPet:
                                            part.pet = reader.uint8();
                                            break;
                                        case RPCID.SetStartCounter:
                                            part.sequence = reader.packed();
                                            part.time = reader.int8();
                                            break;
                                        case RPCID.EnterVent:
                                            part.sequence = reader.packed();
                                            part.vent = reader.packed();
                                            break;
                                        case RPCID.ExitVent:
                                            part.vent = reader.packed();
                                            break;
                                        case RPCID.SnapTo:
                                            part.x = reader.floatLE();
                                            part.y = reader.floatLE();
                                            break;
                                        case RPCID.Close:
                                            break;
                                        case RPCID.VotingComplete:
                                            part.num_states = reader.packed();
                                            part.states = reader.bytes(part.num_states);
                                            part.exiled = reader.uint8();
                                            part.tie = reader.bool();
                                            break;
                                        case RPCID.CastVote:
                                            part.playerid = reader.uint8();
                                            part.suspectid = reader.uint8();
                                            break;
                                        case RPCID.ClearVote:
                                            break;
                                        case RPCID.AddVote:
                                            part.playerid = reader.uint8();
                                            break;
                                        case RPCID.CloseDoorsOfType:
                                            part.systemtype = reader.uint8();
                                            break;
                                        case RPCID.RepairSystem:
                                            part.systemtype = reader.uint8();
                                            part.sendernetid = reader.packed();
                                            part.amount = reader.uint8();
                                            break;
                                        case RPCID.SetTasks:
                                            part.playerid = reader.uint8();
                                            part.num_tasks = reader.packed();
                                            part.tasks = reader.bytes(part.num_tasks);
                                            break;
                                        case RPCID.UpdateGameData:
                                            part.players = [];
                                            while (reader.offset < part_end) {
                                                let player = {};
                                                const playerlen = reader.uint16LE();
                                                player.playerid = reader.uint8();
                                                player.name = reader.string();
                                                player.colour = reader.uint8();
                                                player.hat = reader.packed();
                                                player.pet = reader.packed();
                                                player.skin = reader.packed();
                                                player.flags = reader.byte();
                                                player.num_tasks = reader.uint8();
                                                player.tasks = [];
                                                for (let i = 0; i < player.num_tasks; i++) {
                                                    let task = {};
                                                    task.taskid = reader.packed();
                                                    task.completed = reader.bool();
                                                    player.tasks.push(task);
                                                }
                                                part.players.push(player);
                                            }
                                            break;
                                    }
                                    break;
                                case MessageID.Spawn:
                                    part.spawnid = reader.packed();
                                    part.ownerid = reader.packed();
                                    part.flags = reader.byte();
                                    part.num_components = reader.packed();
                                    switch (part.spawnid) {
                                        case SpawnID.ShipStatus: {
                                            let ShipStatus = {};
                                            ShipStatus.netid = reader.packed();
                                            const ShipStatusLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const ShipStatusStart = reader.offset;
                                            const ShipStatusEnd = ShipStatusStart + ShipStatusLength;
                                            ShipStatus.name = "ShipStatus";
                                            ShipStatus.classname = "ShipStatus";
                                            part.components = [
                                                ShipStatus
                                            ];
                                            reader.goto(ShipStatusEnd);
                                            break;
                                        }
                                        case SpawnID.MeetingHub: {
                                            let MeetingHud = {};
                                            MeetingHud.netid = reader.packed();
                                            const MeetingHudLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const MeetingHudStart = reader.offset;
                                            const MeetingHudEnd = MeetingHudStart + MeetingHudLength;
                                            MeetingHud.name = "MeetingHub";
                                            MeetingHud.classname = "MeetingHud";
                                            MeetingHud.playerStates = [];
                                            // Really this uses the number of players in the game as the length, but the parser
                                            // doesn't have access to this information, so it reads until the end of the component instead.
                                            while (reader.offset < MeetingHudEnd) {
                                                MeetingHud.playerStates.push(reader.uint8());
                                            }
                                            part.components = [
                                                MeetingHud
                                            ];
                                            reader.goto(MeetingHudEnd);
                                            break;
                                        }
                                        case SpawnID.LobbyBehaviour: {
                                            let LobbyBehaviour = {};
                                            LobbyBehaviour.netid = reader.packed();
                                            const LobbyBehaviourLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const LobbyBehaviourStart = reader.offset;
                                            const LobbyBehaviourEnd = LobbyBehaviourStart + LobbyBehaviourLength;
                                            LobbyBehaviour.name = "LobbyBehaviour";
                                            LobbyBehaviour.classname = "LobbyBehaviour";
                                            part.components = [
                                                LobbyBehaviour
                                            ];
                                            reader.goto(LobbyBehaviourEnd);
                                            break;
                                        }
                                        case SpawnID.GameData: {
                                            let GameData = {};
                                            GameData.netid = reader.packed();
                                            const GameDataLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const GameDataStart = reader.offset;
                                            const GameDataEnd = GameDataStart + GameDataLength;
                                            GameData.name = "GameData";
                                            GameData.classname = "GameData";
                                            reader.goto(GameDataEnd);
                                            let VoteBanSystem = {};
                                            VoteBanSystem.netid = reader.packed();
                                            const VoteBanSystemLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const VoteBanSystemStart = reader.offset;
                                            const VoteBanSystemEnd = VoteBanSystemStart + VoteBanSystemLength;
                                            VoteBanSystem.name = "GameData";
                                            VoteBanSystem.classname = "VoteBanSystem";
                                            reader.goto(VoteBanSystemEnd);
                                            part.components = [
                                                GameData,
                                                VoteBanSystem
                                            ];
                                            break;
                                        }
                                        case SpawnID.Player: {
                                            let PlayerControl = {};
                                            PlayerControl.netid = reader.packed();
                                            const PlayerControlLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const PlayerControlStart = reader.offset;
                                            const PlayerControlEnd = PlayerControlStart + PlayerControlLength;
                                            PlayerControl.name = "Player";
                                            PlayerControl.classname = "PlayerControl";
                                            PlayerControl.isNew = reader.bool();
                                            PlayerControl.playerid = reader.uint8();
                                            reader.goto(PlayerControlEnd);
                                            let PlayerPhysics = {};
                                            PlayerPhysics.netid = reader.packed();
                                            const PlayerPhysicsLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const PlayerPhysicsStart = reader.offset;
                                            const PlayerPhysicsEnd = PlayerPhysicsStart + PlayerPhysicsLength;
                                            PlayerPhysics.name = "Player";
                                            PlayerPhysics.classname = "PlayerPhysics";
                                            reader.goto(PlayerPhysicsEnd);
                                            let CustomNetworkTransform = {};
                                            CustomNetworkTransform.netid = reader.packed();
                                            const CustomNetworkTransformLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const CustomNetworkTransformStart = reader.offset;
                                            const CustomNetworkTransformEnd = CustomNetworkTransformStart + CustomNetworkTransformLength;
                                            CustomNetworkTransform.name = "Player";
                                            CustomNetworkTransform.classname = "CustomNetworkTransform";
                                            CustomNetworkTransform.sequence = reader.uint16LE();
                                            const interpolate = val => ((val / 255) * 80) - 40;
                                            CustomNetworkTransform.position = [
                                                interpolate(reader.uint8()),
                                                interpolate(reader.uint8())
                                            ];
                                            CustomNetworkTransform.velocity = [
                                                interpolate(reader.uint8()),
                                                interpolate(reader.uint8())
                                            ];
                                            reader.goto(CustomNetworkTransformEnd);
                                            part.components = [
                                                PlayerControl,
                                                PlayerPhysics,
                                                CustomNetworkTransform
                                            ];
                                            break;
                                        }
                                        case SpawnID.HeadQuarters: {
                                            let ShipStatus = {};
                                            ShipStatus.netid = reader.packed();
                                            const ShipStatusLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const ShipStatusStart = reader.offset;
                                            const ShipStatusEnd = ShipStatusStart + ShipStatusLength;
                                            ShipStatus.name = "HeadQuarters";
                                            ShipStatus.classname = "ShipStatus";
                                            reader.goto(ShipStatusEnd);
                                            part.components = [
                                                ShipStatus
                                            ];
                                            break;
                                        }
                                        case SpawnID.PlanetMap: {
                                            let ShipStatus = {};
                                            ShipStatus.netid = reader.packed();
                                            const ShipStatusLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const ShipStatusStart = reader.offset;
                                            const ShipStatusEnd = ShipStatusStart + ShipStatusLength;
                                            ShipStatus.name = "PlanetMap";
                                            ShipStatus.classname = "ShipStatus";
                                            reader.goto(ShipStatusEnd);
                                            part.components = [
                                                ShipStatus
                                            ];
                                            break;
                                        }
                                        case SpawnID.AprilShipStatus: {
                                            let ShipStatus = {};
                                            ShipStatus.netid = reader.packed();
                                            const ShipStatusLength = reader.uint16LE();
                                            reader.jump(0x01); // Skip type
                                            const ShipStatusStart = reader.offset;
                                            const ShipStatusEnd = ShipStatusStart + ShipStatusLength;
                                            ShipStatus.name = "AprilShipStatus";
                                            ShipStatus.classname = "ShipStatus";
                                            reader.goto(ShipStatusEnd);
                                            part.components = [
                                                ShipStatus
                                            ];
                                            break;
                                        }
                                    }
                                    break;
                                case MessageID.Despawn:
                                    part.netid = reader.packed();
                                    break;
                                case MessageID.SceneChange:
                                    part.clientid = reader.packed();
                                    part.location = reader.string();
                                    break;
                                case MessageID.Ready:
                                    part.clientid = reader.packed();
                                    break;
                                case MessageID.ChangeSettings:
                                    part;
                                    break;
                            }
                            reader.goto(part_end);
                            data.parts.push(part);
                        }
                        break;
                    case PayloadID.JoinedGame:
                        data.code = reader.int32LE();
                        data.clientid = reader.packed();
                        data.hostid = reader.packed();
                        data.num_clients = reader.packed();
                        data.clients = [];
                        for (let i = 0; i < data.num_clients; i++) {
                            data.clients.push(reader.packed());
                        }
                        break;
                    case PayloadID.EndGame:
                        data.code = reader.int32LE();
                        data.reason = reader.uint8();
                        data.show_ad = reader.bool();
                        break;
                    case PayloadID.AlterGame:
                        data.code = reader.int32LE();
                        data.tag = reader.byte();
                        data.is_public = reader.bool();
                        break;
                    case PayloadID.Redirect:
                        data.ip = reader.bytes(0x04).join(".");
                        data.port = reader.uint16LE();
                        break;
                    case PayloadID.MasterServerList:
                        reader.byte();
                        data.num_servers = reader.uint8();
                        data.servers = [];
                        for (let i = 0; i < data.num_servers; i++) {
                            let server = {};
                            reader.jump(0x02);
                            server.flag = reader.byte();
                            server.name = reader.string();
                            server.ip = reader.bytes(0x04).join(".");
                            server.port = reader.uint16LE();
                            server.num_players = reader.uint16LE();
                            data.servers.push(server);
                        }
                        break;
                    case PayloadID.GameList:
                        if (data.bound === "client") {
                            const gamelist_len = reader.uint16LE();
                            reader.jump(0x01);
                            const gamelist_start = reader.offset;
                            const gamelist_end = gamelist_start + gamelist_len;
                            data.games = [];
                            while (reader.offset < gamelist_end) {
                                let game = {};
                                reader.jump(0x03);
                                game.ip = reader.bytes(4).join(".");
                                game.port = reader.uint16LE();
                                game.code = reader.int32LE();
                                game.name = reader.string();
                                game.num_players = reader.uint8();
                                game.age = reader.packed();
                                game.map = reader.uint8();
                                game.imposters = reader.uint8();
                                game.max_players = reader.uint8();
                                data.games.push(game);
                            }
                        }
                        else if (data.bound === "server") {
                            reader.byte();
                            data.options = parseGameOptions(reader);
                        }
                        break;
                }
                break;
            case PacketID.Hello:
                data.reliable = true;
                data.nonce = reader.uint16BE();
                data.hazelver = reader.byte();
                data.clientver = reader.int32LE();
                data.username = reader.string();
                break;
            case PacketID.Disconnect:
                if (data.bound === "client") {
                    reader.jump(0x04); // Skip unnecessary bytes.
                    if (reader.size > 1) {
                        data.reason = reader.uint8();
                        if (data.reason === DisconnectID.Custom) {
                            data.message = reader.string();
                        }
                        else {
                            data.message = DisconnectMessages[data.reason];
                        }
                    }
                }
                break;
            case PacketID.Acknowledge:
                data.nonce = reader.uint16BE();
                break;
            case PacketID.Ping:
                data.reliable = true;
                data.nonce = reader.uint16BE();
                break;
        }
    }
    return data;
}
