class BufferReader {

    /**
     * @param {Uint8Array | ArrayLike<number>} data
     */
    constructor(data) {
        /** @type {number} */
        this.pointer = 0;
        /** @type {Uint8Array} */
        this.buffer = new Uint8Array(data);
    }

    /** @returns {number} */
    getRemainingBytesCount() {
        return this.buffer.length - this.pointer;
    }

    /** @returns {number} */
    readByte() {
        return this.readBytes(1)[0];
    }

    /**
     * @param {number} count
     * @returns {Uint8Array}
     */
    readBytes(count) {
        const data = this.buffer.slice(this.pointer, this.pointer + count);
        this.pointer += count;
        return data;
    }

    /** @returns {Uint8Array} */
    readRemainingBytes() {
        return this.readBytes(this.getRemainingBytesCount());
    }

    /** @returns {string} */
    readString() {
        return new TextDecoder().decode(this.readRemainingBytes());
    }

    /**
     * @param {number} maxLength
     * @returns {string | undefined}
     */
    readCString(maxLength) {
        const value = [];
        const bytes = this.readBytes(maxLength);
        for(const byte of bytes){

            // if we find a null terminator character, we have reached the end of the cstring
            if(byte === 0){
                return new TextDecoder().decode(new Uint8Array(value));
            }

            value.push(byte);

        }
    }

    /** @returns {number} */
    readInt8() {
        const bytes = this.readBytes(1);
        const view = new DataView(bytes.buffer);
        return view.getInt8(0);
    }

    /** @returns {number} */
    readUInt8() {
        const bytes = this.readBytes(1);
        const view = new DataView(bytes.buffer);
        return view.getUint8(0);
    }

    /** @returns {number} */
    readUInt16LE() {
        const bytes = this.readBytes(2);
        const view = new DataView(bytes.buffer);
        return view.getUint16(0, true);
    }

    /** @returns {number} */
    readUInt16BE() {
        const bytes = this.readBytes(2);
        const view = new DataView(bytes.buffer);
        return view.getUint16(0, false);
    }

    /** @returns {number} */
    readUInt32LE() {
        const bytes = this.readBytes(4);
        const view = new DataView(bytes.buffer);
        return view.getUint32(0, true);
    }

    /** @returns {number} */
    readUInt32BE() {
        const bytes = this.readBytes(4);
        const view = new DataView(bytes.buffer);
        return view.getUint32(0, false);
    }

    /** @returns {number} */
    readInt16LE() {
        const bytes = this.readBytes(2);
        const view = new DataView(bytes.buffer);
        return view.getInt16(0, true);
    }

    /** @returns {number} */
    readInt16BE() {
        const bytes = this.readBytes(2);
        const view = new DataView(bytes.buffer);
        return view.getInt16(0, false);
    }

    /** @returns {number} */
    readInt32LE() {
        const bytes = this.readBytes(4);
        const view = new DataView(bytes.buffer);
        return view.getInt32(0, true);
    }

    /** @returns {number} */
    readInt24BE() {

        // read 24-bit (3 bytes) big endian integer
        var value = (this.readByte() << 16) | (this.readByte() << 8) | this.readByte();

        // convert 24-bit signed integer to 32-bit signed integer
        // 0x800000 is the sign bit for a 24-bit value
        // if it's set, value is negative in 24-bit two's complement
        // so we subtract 0x1000000 (which is 2^24) to get the correct negative value as a Dart integer
        if((value & 0x800000) !== 0){
            value -= 0x1000000;
        }

        return value;

    }

}

export default BufferReader;
