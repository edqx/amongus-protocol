import dgram, { RemoteInfo, Socket } from "dgram"
import { EventEmitter } from "events";
import { Server } from "http";
import { runInThisContext } from "vm";
import { PacketID } from "./constants/Enums.js";

import { ServerOptions } from "./interfaces/ServerOptions.js"

import { parsePacket } from "./Parser.js"
import { BufferWriter } from "./util/BufferWriter.js";

export class AmongusServer extends EventEmitter {
    socket: dgram.Socket;
    port: number;
    host: string;
    clients: Map<string, null>;

    options: ServerOptions;

    constructor(options: ServerOptions = {}) {
        super();
        
        this.socket = null;
        this.port = null;
        this.host = null;
        this.clients = new Map;
        this.options = options;
    }

    handleMessage(message: Buffer, remote: dgram.RemoteInfo) {
        const parsed = parsePacket(message);
    }

    listen(port: number, host?: string) {
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

    async broadcast(buffer: Buffer) {

    }

    async disconnect() {

    }
}