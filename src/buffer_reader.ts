class BufferReader {

    pointer: number;
    buffer: Uint8Array;

    constructor(data: ArrayLike<number> | ArrayBuffer) {
        this.pointer = 0;
        this.buffer = new Uint8Array(data);
    }

    getRemainingBytesCount(): number {
        return this.buffer.length - this.pointer;
    }

    readByte(): number {
        return this.readBytes(1)[0];
    }

    readBytes(count: number): Uint8Array {
        const data = this.buffer.slice(this.pointer, this.pointer + count);
        this.pointer += count;
        return data;
    }

    readRemainingBytes(): Uint8Array {
        return this.readBytes(this.getRemainingBytesCount());
    }

    readString(): string {
        return new TextDecoder().decode(this.readRemainingBytes());
    }

    readCString(maxLength: number): string {
        const value: number[] = [];
        const bytes = this.readBytes(maxLength);
        for(const byte of bytes){

            // if we find a null terminator character, we have reached the end of the cstring
            if(byte === 0){
                return new TextDecoder().decode(new Uint8Array(value));
            }

            value.push(byte);

        }
        return new TextDecoder().decode(new Uint8Array(value));
    }

    readInt8(): number {
        const bytes = this.readBytes(1);
        const view = new DataView(bytes.buffer);
        return view.getInt8(0);
    }

    readUInt8(): number {
        const bytes = this.readBytes(1);
        const view = new DataView(bytes.buffer);
        return view.getUint8(0);
    }

    readUInt16LE(): number {
        const bytes = this.readBytes(2);
        const view = new DataView(bytes.buffer);
        return view.getUint16(0, true);
    }

    readUInt16BE(): number {
        const bytes = this.readBytes(2);
        const view = new DataView(bytes.buffer);
        return view.getUint16(0, false);
    }

    readUInt32LE(): number {
        const bytes = this.readBytes(4);
        const view = new DataView(bytes.buffer);
        return view.getUint32(0, true);
    }

    readUInt32BE(): number {
        const bytes = this.readBytes(4);
        const view = new DataView(bytes.buffer);
        return view.getUint32(0, false);
    }

    readInt16LE(): number {
        const bytes = this.readBytes(2);
        const view = new DataView(bytes.buffer);
        return view.getInt16(0, true);
    }

    readInt16BE(): number {
        const bytes = this.readBytes(2);
        const view = new DataView(bytes.buffer);
        return view.getInt16(0, false);
    }

    readInt32LE(): number {
        const bytes = this.readBytes(4);
        const view = new DataView(bytes.buffer);
        return view.getInt32(0, true);
    }

    readInt24BE(): number {

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
