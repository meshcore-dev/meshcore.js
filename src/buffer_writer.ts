class BufferWriter {

    buffer: number[];

    constructor() {
        this.buffer = [];
    }

    toBytes(): Uint8Array {
        return new Uint8Array(this.buffer);
    }

    writeBytes(bytes: ArrayLike<number>): void {
        this.buffer = [
            ...this.buffer,
            ...Array.from(bytes),
        ];
    }

    writeByte(byte: number): void {
        this.writeBytes([
            byte,
        ]);
    }

    writeUInt16LE(num: number): void {
        const bytes = new Uint8Array(2);
        const view = new DataView(bytes.buffer);
        view.setUint16(0, num, true);
        this.writeBytes(bytes);
    }

    writeUInt32LE(num: number): void {
        const bytes = new Uint8Array(4);
        const view = new DataView(bytes.buffer);
        view.setUint32(0, num, true);
        this.writeBytes(bytes);
    }

    writeInt32LE(num: number): void {
        const bytes = new Uint8Array(4);
        const view = new DataView(bytes.buffer);
        view.setInt32(0, num, true);
        this.writeBytes(bytes);
    }

    writeString(string: string): void {
        this.writeBytes(new TextEncoder().encode(string));
    }

    writeCString(string: string, maxLength: number): void {

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
