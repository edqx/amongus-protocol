import util from "util";
/**
 * Represents a buffer reader.
 */
export class BufferReader {
    constructor(buffer) {
        if (typeof buffer === "string") {
            this.buffer = Buffer.from(buffer.split(" ").map(byte => parseInt(byte, 16)));
        }
        else {
            this.buffer = buffer;
        }
        /**
         * The offset of the reader.
         */
        this.offset = 0x00;
    }
    [Symbol.toStringTag]() {
        return this.buffer.toString();
    }
    [util.inspect.custom]() {
        return this.buffer;
    }
    cut(start, len) {
        if (typeof len === "undefined") {
            return this.slice(this.offset, start);
        }
        return new BufferReader(this.buffer.slice(start, start + len));
    }
    slice(start, len) {
        if (typeof start === "undefined") {
            return this.slice(this.offset);
        }
        if (typeof len === "undefined") {
            return new BufferReader(this.buffer.slice(start));
        }
        if (start < 0) {
            return this.slice(this.offset + start, len);
        }
        return new BufferReader(this.buffer.slice(start, start + len));
    }
    /**
     * The size of the buffer in bytes.
     */
    get size() {
        return this.buffer.byteLength;
    }
    /**
     * Goto a certain position in the buffer.
     */
    goto(offset) {
        this.offset = offset;
    }
    /**
     * Jump a certain amount of bytes.
     */
    jump(bytes) {
        this.offset += bytes;
        return this.offset;
    }
    /**
     * Read a Big-Endian unsigned 32 bit integer.
     */
    uint32BE() {
        const val = this.buffer.readUInt32BE(this.offset);
        this.offset += 0x04;
        return val;
    }
    /**
     * Read a Little-Endian unsigned 32 bit integer.
     */
    uint32LE() {
        const val = this.buffer.readUInt32LE(this.offset);
        this.offset += 0x04;
        return val;
    }
    /**
     * Read a Big-Endian 32 bit integer.
     */
    int32BE() {
        const val = this.buffer.readInt32BE(this.offset);
        this.offset += 0x04;
        return val;
    }
    /**
     * Read a Big-Endian 32 bit integer.
     */
    int32LE() {
        const val = this.buffer.readInt32LE(this.offset);
        this.offset += 0x04;
        return val;
    }
    /**
     * Read a Big-Endian unsigned 16 bit integer.
     */
    uint16BE() {
        const val = this.buffer.readUInt16BE(this.offset);
        this.offset += 0x02;
        return val;
    }
    /**
     * Read a Little-Endian unsigned 16 bit integer.
     */
    uint16LE() {
        const val = this.buffer.readUInt16LE(this.offset);
        this.offset += 0x02;
        return val;
    }
    /**
     * Read a Big-Endian 16 bit integer.
     */
    int16BE() {
        const val = this.buffer.readInt16LE(this.offset);
        this.offset += 0x02;
        return val;
    }
    /**
     * Read a Little-Endian 16 bit integer.
     */
    int16LE() {
        const val = this.buffer.readInt16LE(this.offset);
        this.offset += 0x02;
        return val;
    }
    /**
     * Read an unsigned 8 bit integer.
     */
    uint8() {
        const val = this.buffer.readUInt8(this.offset);
        this.offset += 0x01;
        return val;
    }
    /**
     * Read an 8 bit integer.
     */
    int8() {
        const val = this.buffer.readInt8(this.offset);
        this.offset += 0x01;
        return val;
    }
    /**
     * Read a single byte.
     */
    byte() {
        return this.uint8();
    }
    /**
     * Read several bytes.
     */
    bytes(num) {
        const bytes = [];
        for (let i = 0; i < num; i++) {
            bytes.push(this.byte());
        }
        return bytes;
    }
    /**
     * Read a boolean.
     */
    bool() {
        return this.uint8() === 0x01;
    }
    /**
     * Read a Big-Endian 32 bit float.
     */
    floatBE() {
        const val = this.buffer.readFloatBE(this.offset);
        this.offset += 0x04;
        return val;
    }
    /**
     * Read a Little-Endian 32 bit float.
     */
    floatLE() {
        const val = this.buffer.readFloatLE(this.offset);
        this.offset += 0x04;
        return val;
    }
    /**
     * Read a Big-Endian 64 bit double.
     */
    doubleBE() {
        const val = this.buffer.readDoubleBE(this.offset);
        this.offset += 0x08;
        return val;
    }
    /**
     * Read a Little-Endian 64 bit double.
     */
    doubleLE() {
        const val = this.buffer.readDoubleLE(this.offset);
        this.offset += 0x08;
        return val;
    }
    /**
     * Read a packed integer.
     */
    packed() {
        let output = 0;
        for (let shift = 0;; shift += 7) {
            const byte = this.uint8();
            const read = (byte >> 7) & 1;
            const val = read ? byte ^ 0b10000000 : byte;
            output |= val << shift;
            if (!read) {
                break;
            }
        }
        return output;
    }
    /**
     * Read a string with a known length.
     */
    string(length) {
        if (length === 0) {
            return "";
        }
        if (!length) {
            const len = this.uint8();
            return this.string(len);
        }
        let str = "";
        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(this.uint8());
        }
        return str;
    }
}
