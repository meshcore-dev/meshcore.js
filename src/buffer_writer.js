class BufferWriter {

    constructor() {
        /** @type {number[]} */
        this.buffer = [];
    }

    /** @returns {Uint8Array} */
    toBytes() {
        return new Uint8Array(this.buffer);
    }

    /** @param {Uint8Array | number[]} bytes */
    writeBytes(bytes) {
        this.buffer = [
            ...this.buffer,
            ...bytes,
        ];
    }

    /** @param {number} byte */
    writeByte(byte) {
        this.writeBytes([
            byte,
        ]);
    }

    /** @param {number} num */
    writeUInt16LE(num) {
        const bytes = new Uint8Array(2);
        const view = new DataView(bytes.buffer);
        view.setUint16(0, num, true);
        this.writeBytes(bytes);
    }

    /** @param {number} num */
    writeUInt32LE(num) {
        const bytes = new Uint8Array(4);
        const view = new DataView(bytes.buffer);
        view.setUint32(0, num, true);
        this.writeBytes(bytes);
    }

    /** @param {number} num */
    writeInt32LE(num) {
        const bytes = new Uint8Array(4);
        const view = new DataView(bytes.buffer);
        view.setInt32(0, num, true);
        this.writeBytes(bytes);
    }

    /** @param {string} string */
    writeString(string) {
        this.writeBytes(new TextEncoder().encode(string));
    }

    /**
     * @param {string} string
     * @param {number} maxLength
     */
    writeCString(string, maxLength) {

        // create buffer of max length
        const bytes = new Uint8Array(new ArrayBuffer(maxLength));

        // encode string to bytes
        const encodedString = new TextEncoder().encode(string);

        // copy in string until we hit the max length, or we run out of string bytes
        for(var i = 0; i < maxLength && i < encodedString.length; i++){
            bytes[i] = encodedString[i];
        }

        // ensure the last byte is always a null terminator
        bytes[bytes.length - 1] = 0;

        // write to buffer
        this.writeBytes(bytes);

    }

}

export default BufferWriter;
