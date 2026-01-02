class BufferWriter {

    constructor() {
        this.buffer = [];
    }

    toBytes() {
        return new Uint8Array(this.buffer);
    }

    writeBytes(bytes) {
        this.buffer = [
            ...this.buffer,
            ...bytes,
        ];
    }

    writeByte(byte) {
        this.writeBytes([
            byte,
        ]);
    }

    writeUInt16LE(num) {
        const bytes = new Uint8Array(2);
        const view = new DataView(bytes.buffer);
        view.setUint16(0, num, true);
        this.writeBytes(bytes);
    }

    writeUInt32LE(num) {
        const bytes = new Uint8Array(4);
        const view = new DataView(bytes.buffer);
        view.setUint32(0, num, true);
        this.writeBytes(bytes);
    }

    writeInt32LE(num) {
        const bytes = new Uint8Array(4);
        const view = new DataView(bytes.buffer);
        view.setInt32(0, num, true);
        this.writeBytes(bytes);
    }

    // not little-endian because a single byte has no ordering
    writeInt8(num) {
        const bytes = new Uint8Array(1);
        const view = new DataView(bytes.buffer);
        view.setInt8(0, num);
        this.writeBytes(bytes);
    }

    writeString(string) {
        this.writeBytes(new TextEncoder().encode(string));
    }

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
