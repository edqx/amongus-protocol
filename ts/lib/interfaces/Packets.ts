import {
    DisconnectID,
    PacketID,
    RPCID,
    ColourID,
    HatID,
    SkinID,
    PetID,
    SystemType,
    TaskID,
    DataID,
    SpawnID,
    MessageID,
    GameEndReason,
    AlterGameTag,
    PayloadID,
    DistanceID,
    TaskBarUpdate,
    MapID
} from "../constants/Enums.js"

import {
    bit,
    byte,
    bitfield,
    uint8,
    int8,
    uint16,
    int16,
    uint32,
    int32,
    float,
    double,
    packed,
    code,
    float16,
    vector
} from "./Types.js"

export interface BaseGameOptionsData {
    length: packed;
    version: byte;
    maxPlayers: uint8;
    language: uint32;
    mapID: byte;
    playerSpeed: float;
    crewVision: float;
    imposterVision: float;
    killCooldown: float;
    commonTasks: uint8;
    longTasks: uint8;
    shortTasks: uint8;
    emergencies: int32;
    imposterCount: uint8;
    killDistance: DistanceID;
    discussionTime: int32;
    votingTime: int32;
    isDefault: boolean;
}

export interface GameOptionsDataV1 extends BaseGameOptionsData {
    version: 1;
    emergencyCooldown: uint8;
}

export interface GameOptionsDataV2 extends BaseGameOptionsData {
    version: 2;
    emergencyCooldown: uint8;
    confirmEjects: boolean;
    visualTasks: boolean;
}

export interface GameOptionsDataV3 extends BaseGameOptionsData {
    version: 3;
    emergencyCooldown: uint8;
    confirmEjects: boolean;
    visualTasks: boolean;
    anonymousVoting: boolean;
    taskBarUpdates: TaskBarUpdate;
}

export type GameOptionsData = GameOptionsDataV1 | GameOptionsDataV2 | GameOptionsDataV3;

export interface BasePacket {
    bound?: "server" | "client";
}

export interface Reliable extends BasePacket {
    reliable?: true;
    nonce?: uint16;
}

export interface Unreliable extends BasePacket {
    reliable?: false;
}

export interface HelloPacket extends Reliable {
    op: PacketID.Hello;
    hazelver?: number;
    clientver?: number;
    username: string;
}

export interface DisconnectReason {
    reason?: DisconnectID;
    message?: string;
}

export interface DisconnectPacketClientBound extends DisconnectReason, Unreliable {
    bound?: "client",
    op: PacketID.Disconnect;
}

export interface DisconnectPacketServerBound extends Unreliable {
    bound?: "server",
    op: PacketID.Disconnect;
}

export type DisconnectPacket = DisconnectPacketClientBound | DisconnectPacketServerBound;

export interface AcknowledegePacket extends Unreliable {
    op: PacketID.Acknowledge;
    nonce: uint16;
}

export interface PingPacket extends Reliable {
    op: PacketID.Ping;
}

export interface HostGamePayloadServerBound extends Payload {
    payloadid: PayloadID.HostGame;
    bound?: "server";
    options: Partial<GameOptionsData>;
}

export interface HostGamePayloadClientBound extends Payload {
    payloadid: PayloadID.HostGame;
    bound?: "client";
    code: code;
}

export type HostGamePayload = HostGamePayloadServerBound | HostGamePayloadClientBound;

export interface JoinGamePayloadServerbound extends Payload {
    bound?: "server";
    payloadid: PayloadID.JoinGame;
    code: code;
    mapOwnership: bitfield;
}

export interface JoinGamePayloadClientbound extends DisconnectReason, Payload {
    bound?: "client";
    payloadid: PayloadID.JoinGame;
}

export type JoinGamePayload = JoinGamePayloadServerbound | JoinGamePayloadClientbound;

export interface StartGamePayload extends Payload {
    payloadid: PayloadID.StartGame;
    code: code;
}

export interface RemoveGamePayload extends Payload {
    payloadid: PayloadID.RemoveGame;
}

export interface RemovePlayerPayload extends Payload {
    payloadid: PayloadID.RemovePlayer;
}

export interface Message {
    type: MessageID;
}

export interface DataMessage extends Message {
    type: MessageID.Data;
    netid: packed;
    datalen: uint16;
    data: Buffer;
}

export interface RPC extends Message {
    type: MessageID.RPC;
    sendernetid: packed;
    rpcid: uint8;
}

export interface RPCPlayAnimation extends RPC {
    rpcid: RPCID.PlayAnimation;
    animation: uint8;
}

export interface RPCCompleteTask extends RPC {
    rpcid: RPCID.CompleteTask;
    taskid: uint8;
}

export interface RPCSyncSettings extends RPC {
    rpcid: RPCID.SyncSettings;
    options: GameOptionsData;
}

export interface RPCSetInfected extends RPC {
    rpcid: RPCID.SetInfected;
    count: packed;
    infected: byte[];
}

export interface RPCExiled extends RPC {
    rpcid: RPCID.Exiled;
}

export interface RPCCheckName extends RPC {
    rpcid: RPCID.CheckName;
    name: string;
}

export interface RPCSetName extends RPC {
    rpcid: RPCID.SetName;
    name: string;
}

export interface RPCCheckColour extends RPC {
    rpcid: RPCID.CheckColour;
    colour: ColourID;
}

export interface RPCSetColour extends RPC {
    rpcid: RPCID.SetColour;
    colour: ColourID;
}

export interface RPCSetHat extends RPC {
    rpcid: RPCID.SetHat;
    hat: HatID;
}

export interface RPCSetSkin extends RPC {
    rpcid: RPCID.SetSkin;
    skin: SkinID;
}

export interface RPCReportDeadBody extends RPC {
    rpcid: RPCID.ReportDeadBody;
    player: uint8 | 0xff;
}

export interface RPCMurderPlayer extends RPC {
    rpcid: RPCID.MurderPlayer;
    targetnetid: packed;
}

export interface RPCSendChat extends RPC {
    rpcid: RPCID.SendChat;
    text: string;
}

export interface RPCStartMeeting extends RPC {
    rpcid: RPCID.StartMeeting;
    player: uint8 | 0xff;
}

export interface RPCSetScanner extends RPC {
    rpcid: RPCID.SetScanner;
    scanning: boolean;
    count: uint8;
}

export interface RPCSendChatNote extends RPC {
    rpcid: RPCID.SendChatNote;
    playerid: uint8;
    notetype: uint8;
}

export interface RPCSetPet extends RPC {
    rpcid: RPCID.SetPet;
    pet: PetID;
}

export interface RPCSetStartCounter extends RPC {
    rpcid: RPCID.SetStartCounter;
    sequence: packed;
    time: int8;
}

export interface RPCEnterVent extends RPC {
    rpcid: RPCID.EnterVent;
    sequence: packed;
    vent: packed;
}

export interface RPCExitVent extends RPC {
    rpcid: RPCID.ExitVent;
    vent: packed;
}

export interface RPCSnapTo extends RPC {
    rpcid: RPCID.SnapTo;
    x: float;
    y: float;
}

export interface RPCClose extends RPC {
    rpcid: RPCID.Close;
}

export interface RPCVotingComplete extends RPC {
    rpcid: RPCID.VotingComplete;
    num_states: uint32;
    states: byte[];
    exiled: uint8;
    tie: boolean;
}

export interface RPCCastVote extends RPC {
    rpcid: RPCID.CastVote;
    playerid: uint8;
    suspectid: uint8;
}

export interface RPCClearVote extends RPC {
    rpcid: RPCID.ClearVote;
}

export interface RPCAddVote extends RPC {
    rpcid: RPCID.AddVote;
    playerid: uint8;
}

export interface RPCCloseDoorsOfType extends RPC {
    rpcid: RPCID.CloseDoorsOfType;
    systemtype: SystemType;
}

export interface RPCRepairSystem extends RPC {
    rpcid: RPCID.RepairSystem;
    systemtype: SystemType;
    sendernetid: packed;
    amount: uint8;
}

export interface RPCSetTasks extends RPC {
    rpcid: RPCID.SetTasks;
    playerid: uint8;
    num_tasks: uint8;
    tasks: uint8[];
}

export interface TaskUpdate {
    taskid: TaskID;
    completed: boolean;
}

export interface PlayerGameDataUpdate {
    playerid: uint8;
    name: string;
    colour: ColourID;
    hat: HatID;
    pet: PetID;
    skin: SkinID;
    flags: bitfield;
    num_tasks: uint8;
    tasks: TaskUpdate[];
}

export interface RPCUpdateGameData extends RPC {
    rpcid: RPCID.UpdateGameData;
    players: PlayerGameDataUpdate[];
}

export type RPCMessage = RPCPlayAnimation
    | RPCCompleteTask
    | RPCSyncSettings
    | RPCSetInfected
    | RPCExiled
    | RPCCheckName
    | RPCSetName
    | RPCCheckColour
    | RPCSetColour
    | RPCSetHat
    | RPCSetSkin
    | RPCReportDeadBody
    | RPCMurderPlayer
    | RPCSendChat
    | RPCStartMeeting
    | RPCSetScanner
    | RPCSendChatNote
    | RPCSetPet
    | RPCSetStartCounter
    | RPCEnterVent
    | RPCExitVent
    | RPCSnapTo
    | RPCClose
    | RPCVotingComplete
    | RPCCastVote
    | RPCClearVote
    | RPCAddVote
    | RPCCloseDoorsOfType
    | RPCRepairSystem
    | RPCSetTasks
    | RPCUpdateGameData;

export enum PlayerVoteAreaFlags {
    VotedFor = 0x0f,
    DidReport = 0x20,
    DidVote = 0x40,
    IsDead = 0x80
}

export interface MeetingHudPlayerState {
    flags: PlayerVoteAreaFlags;
    playerid: number;
    votedFor: uint8;
    reported: boolean;
    voted: boolean;
    dead: boolean;
}

export interface Component {
    netid: packed;
    datalen: uint16;
    data: Buffer;
    type: uint8;
}

export interface ObjectSpawn extends Message {
    type: MessageID.Spawn;
    spawnid: SpawnID;
    ownerid: packed;
    flags: bitfield;
    num_components: packed;
    components: Component[];
}

export interface ShipStatusSpawn extends ObjectSpawn {
    spawnid: SpawnID.ShipStatus;
}

export interface MeetingHubSpawn extends ObjectSpawn {
    spawnid: SpawnID.MeetingHub;
}

export interface LobbySpawn extends ObjectSpawn {
    spawnid: SpawnID.LobbyBehaviour;
}

export interface GameDataSpawn extends ObjectSpawn {
    spawnid: SpawnID.GameData;
}

export interface PlayerSpawn extends ObjectSpawn {
    spawnid: SpawnID.Player;
}

export interface HeadQuartersSpawn extends ObjectSpawn {
    spawnid: SpawnID.HeadQuarters;
}

export interface PlanetMapSpawn extends ObjectSpawn {
    spawnid: SpawnID.PlanetMap;
}

export interface AprilShipStatusSpawn extends ObjectSpawn {
    spawnid: SpawnID.AprilShipStatus;
}

export type SpawnMessage = ShipStatusSpawn
    | MeetingHubSpawn
    | LobbySpawn
    | GameDataSpawn
    | PlayerSpawn
    | HeadQuartersSpawn
    | PlanetMapSpawn
    | AprilShipStatusSpawn;

export interface DespawnMessage extends Message {
    type: MessageID.Despawn;
    netid: packed;
}

export interface SceneChangeMessage extends Message {
    type: MessageID.SceneChange;
    clientid: packed;
    location: string;
}

export interface ReadyMessage extends Message {
    type: MessageID.Ready;
    clientid: packed;
}

export interface ChangeSettingsMessage extends Message {
    type: MessageID.ChangeSettings;
}

export type GameDataMessage = DataMessage
    | RPCMessage
    | SpawnMessage
    | DespawnMessage
    | SceneChangeMessage
    | ReadyMessage
    | ChangeSettingsMessage;


export interface Payload extends BasePacket {
    op: PacketID.Reliable | PacketID.Unreliable;
    reliable?: boolean;
    nonce?: number;
    payloadid: PayloadID;
}

export interface GameDataPayload extends Payload {
    payloadid: PayloadID.GameData;
    code: code;
    parts: GameDataMessage[];
}

export interface GameDataToPayload extends Payload {
    payloadid: PayloadID.GameDataTo;
    code: code;
    recipient: packed;
    parts: GameDataMessage[];
}

export interface JoinedGamePayload extends Payload {
    payloadid: PayloadID.JoinedGame;
    code: code;
    clientid: uint32;
    hostid: uint32;
    num_clients: packed;
    clients: packed[];
}

export interface EndGamePayload extends Payload {
    payloadid: PayloadID.EndGame;
    code: code;
    reason: GameEndReason;
    show_ad: boolean;
}

export interface AlterGamePayload extends Payload {
    payloadid: PayloadID.AlterGame;
    code: code;
    tag: AlterGameTag;
    is_public: boolean;
}

export interface RedirectPayload extends Payload {
    payloadid: PayloadID.Redirect;
    ip: string;
    port: uint16;
}

export interface MasterServer {
    flag: byte;
    name: string;
    ip: string;
    port: uint16;
    num_players: uint16;
}

export interface MasterServerListPayload extends Payload {
    payloadid: PayloadID.MasterServerList;
    num_servers: uint8;
    servers: MasterServer[];
}

export interface GameListGame {
    ip: string;
    port: uint16;
    code: int32;
    name: string;
    num_players: uint8;
    age: packed;
    map: MapID;
    imposters: uint8;
    max_players: uint8;
}

export interface GameListPayloadClientbound extends Payload {
    bound?: "client";
    payloadid: PayloadID.GameList;
    games: GameListGame[];
}

export interface GameListPayloadServerBound extends Payload {
    bound?: "server";
    payloadid: PayloadID.GameList;
    options: Partial<GameOptionsData>;
}

export type GameListPayload = GameListPayloadClientbound | GameListPayloadServerBound;

export type PayloadPacket = HostGamePayload
    | JoinGamePayload
    | StartGamePayload
    | RemoveGamePayload
    | RemovePlayerPayload
    | GameDataPayload
    | GameDataToPayload
    | JoinedGamePayload
    | EndGamePayload
    | AlterGamePayload
    | RedirectPayload
    | MasterServerListPayload
    | GameListPayload;

export type Packet = PayloadPacket
    | HelloPacket
    | DisconnectPacket
    | AcknowledegePacket
    | PingPacket;