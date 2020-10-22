import dgram from "dgram";
import { EventEmitter } from "events";
import { parsePacket } from "./Parser.js";
export class AmongusServer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.socket = null;
        this.port = null;
        this.host = null;
        this.clients = new Map;
        this.options = options;
    }
    handleMessage(message, remote) {
        const parsed = parsePacket(message);
    }
    listen(port, host) {
        if (this.socket) {
            this.disconnect();
            return;
        }
        this.port = port;
        this.host = host || "0.0.0.0";
        this.socket = dgram.createSocket("udp4");
        this.socket.bind(this.port, this.host);
        this.socket.on("listening", () => {
            this.emit("listening", port, host);
        });
        this.socket.on("message", this.handleMessage.bind(this));
    }
    async broadcast(buffer) {
    }
    async disconnect() {
    }
}
