import { parsePacket } from "./Parser.js";
import { composePacket } from "./Compose.js";
import dgram from "dgram";
import { EventEmitter } from "events";
import { PacketID } from "./constants/Enums.js";
import { DisconnectMessages } from "./constants/DisconnectMessages.js";
export class AmongusClient extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.socket = null;
        this.ip = null;
        this.port = null;
        this.nonce = 1;
        this.objects = new Map;
    }
    debug(...fmt) {
        if (this.options.debug) {
            console.log(...fmt);
        }
    }
    _disconnect() {
        this.emit("disconnect");
    }
    async disconnect(reason) {
        if (reason) {
            await this.send({
                op: PacketID.Disconnect,
                reason: reason,
                message: DisconnectMessages[reason]
            });
        }
        else {
            await this.send({
                op: PacketID.Disconnect
            });
        }
    }
    _connect(ip, port) {
        this.socket = dgram.createSocket("udp4");
        this.ip = ip;
        this.port = port;
        this.nonce = 1;
        this.socket.on("message", buffer => {
            const packet = parsePacket(buffer);
            this.debug("Recieved packet", packet);
            this.emit("packet", packet);
        });
    }
    async connect(ip, port, username) {
        if (typeof username === "undefined") {
            const parts = ip.split(":");
            return await this.connect(parts[0], parts[1], port);
        }
        this._connect(ip, parseInt(port));
        if (await this.hello(username)) {
            this.emit("connected");
        }
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
    async send(packet) {
        const nonce = this.nonce;
        if (packet.reliable)
            packet.nonce = nonce;
        const composed = composePacket(packet, "server");
        await this._send(composed);
        this.debug("Sent packet", composed);
        if (packet.reliable) {
            const interval = setInterval(function () {
                this._send(composed);
            }, this.options.ackInterval || 1500);
            const ack = await this.awaitPacket(packet => {
                return packet.op === PacketID.Acknowledge
                    && packet.nonce === nonce;
            });
            clearInterval(interval);
            return ack !== null;
        }
        else {
            return true;
        }
    }
    async hello(username) {
        return await this.send({
            op: PacketID.Hello,
            username: username
        });
    }
}
