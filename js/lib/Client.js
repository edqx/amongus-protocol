import { parsePacket } from "./Parser.js";
import { composePacket } from "./Compose.js";
import dgram from "dgram";
import { EventEmitter } from "events";
import { DisconnectID, LanguageID, PacketID, PayloadID } from "./constants/Enums.js";
import { Code2Int } from "./util/codes.js";
export class AmongusClient extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.socket = null;
        this.ip = null;
        this.port = null;
        this.nonce = 1;
        this.username = null;
        this.objects = new Map;
        this.game = null;
    }
    debug(...fmt) {
        if (this.options.debug) {
            console.log(...fmt);
        }
    }
    _disconnect() {
        this.emit("disconnect");
        this.socket.removeAllListeners();
        this.socket = null;
        this.ip = null;
        this.port = null;
        this.nonce = 1;
    }
    async disconnect(reason, message) {
        if (reason) {
            if (reason === DisconnectID.Custom) {
                if (message) {
                    await this.send({
                        op: PacketID.Disconnect,
                        reason: reason,
                        message: message
                    });
                }
                else {
                    await this.send({
                        op: PacketID.Disconnect,
                        reason: reason
                    });
                }
            }
            else {
                await this.send({
                    op: PacketID.Disconnect,
                    reason: reason
                });
            }
        }
        else {
            await this.send({
                op: PacketID.Disconnect
            });
        }
        await this.awaitPacket(packet => packet.op === PacketID.Disconnect);
        this._disconnect();
    }
    _connect(ip, port) {
        this.socket = dgram.createSocket("udp4");
        this.ip = ip;
        this.port = port;
        this.nonce = 1;
        this.socket.on("message", async (buffer) => {
            const packet = parsePacket(buffer);
            if (packet.reliable) {
                await this.ack(packet.nonce);
            }
            this.debug("Recieved packet", packet);
            this.emit("packet", packet);
        });
    }
    async connect(ip, port, username) {
        if (this.socket) {
            await this.disconnect();
        }
        this._connect(ip, port);
        if (await this.hello(username)) {
            this.emit("connected");
            return true;
        }
        return false;
    }
    _send(buffer) {
        return new Promise((resolve, reject) => {
            this.socket.send(buffer, this.port, this.ip, err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    awaitPacket(filter) {
        const _this = this;
        return new Promise((resolve, reject) => {
            function onPacket(packet) {
                if (filter(packet)) {
                    _this.off("disconnect", onDisconnect);
                    _this.off("packet", onPacket);
                    resolve(packet);
                }
            }
            function onDisconnect() {
                _this.off("disconnect", onDisconnect);
                _this.off("packet", onPacket);
                resolve(null);
            }
            this.on("packet", onPacket);
            this.on("disconnect", onDisconnect);
        });
    }
    async awaitPayload(filter) {
        return await this.awaitPacket(packet => {
            return (packet.op === PacketID.Unreliable || packet.op === PacketID.Reliable)
                && filter(packet);
        });
    }
    async send(packet) {
        const nonce = this.nonce;
        switch (packet.op) {
            case PacketID.Reliable:
            case PacketID.Hello:
            case PacketID.Ping:
                packet.reliable = true;
                packet.nonce = nonce;
                this.nonce++;
                break;
        }
        const composed = composePacket(packet, "server");
        await this._send(composed);
        this.debug("Sent packet", composed);
        if (packet.reliable) {
            const interval = setInterval(() => {
                this._send(composed);
            }, this.options.ackInterval || 1500);
            this.debug("Awaiting acknowledege", nonce);
            const ack = await this.awaitPacket(packet => {
                return packet.op === PacketID.Acknowledge
                    && packet.nonce === nonce;
            });
            this.debug("Recieved acknowledege", nonce);
            clearInterval(interval);
            return ack !== null;
        }
        else {
            return true;
        }
    }
    async ack(nonce) {
        await this.send({
            op: PacketID.Acknowledge,
            nonce
        });
    }
    async hello(username) {
        if (await this.send({
            op: PacketID.Hello,
            username: username
        })) {
            this.username = username;
            return true;
        }
        return false;
    }
    async join(code) {
        if (typeof code === "string") {
            return this.join(Code2Int(code));
        }
        await this.send({
            op: PacketID.Reliable,
            payloadid: PayloadID.JoinGame,
            bound: "server",
            code: code,
            mapOwnership: 0x07
        });
        const packet = await Promise.race([
            this.awaitPayload(p => p.payloadid === PayloadID.Redirect),
            this.awaitPayload(p => p.payloadid === PayloadID.JoinedGame),
            this.awaitPayload(p => p.payloadid === PayloadID.JoinGame)
        ]);
        if (packet && (packet.op === PacketID.Reliable) || (packet.op === PacketID.Unreliable)) {
            if (packet.payloadid === PayloadID.Redirect) {
                await this.disconnect();
                await this.connect(packet.ip, packet.port, this.username);
                return await this.join(code);
            }
            else if (packet.payloadid === PayloadID.JoinedGame) {
            }
            else if (packet.payloadid === PayloadID.JoinGame) {
            }
        }
        else {
            return false;
        }
    }
    async search(maps = 0, imposters = 0, language = LanguageID.Any) {
        if (Array.isArray(maps)) {
            return maps.reduce((val, map) => val + (1 << map), 0);
        }
        await this.send({
            op: PacketID.Reliable,
            payloadid: PayloadID.GameList,
            bound: "server",
            options: {
                mapID: maps,
                imposterCount: imposters,
                language
            }
        });
    }
}
