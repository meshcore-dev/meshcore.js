import BufferReader from "./buffer_reader.js";
import BufferWriter from "./buffer_writer.js";
import Constants from "./constants.js";

class Advert {

    constructor(publicKey, timestamp, signature, appData) {
        this.publicKey = publicKey;
        this.timestamp = timestamp;
        this.signature = signature;
        this.appData = appData;
        this.parsed = this.parseAppData();
    }

    static fromBytes(bytes) {

        // read bytes
        const bufferReader = new BufferReader(bytes);
        const publicKey = bufferReader.readBytes(32);
        const timestamp = bufferReader.readUInt32LE();
        const signature = bufferReader.readBytes(64);
        const appData = bufferReader.readRemainingBytes();

        return new Advert(publicKey, timestamp, signature, appData);

    }

    getFlags() {
        return this.appData[0];
    }

    getType() {
        const flags = this.getFlags();
        return flags & 0x0F;
    }

    getTypeString() {
        const type = this.getType();
        if(type === Constants.AdvType.None) return "NONE";
        if(type === Constants.AdvType.Chat) return "CHAT";
        if(type === Constants.AdvType.Repeater) return "REPEATER";
        if(type === Constants.AdvType.Room) return "ROOM";
        return null;
    }

    async isVerified() {

        const { ed25519 } = await import("@noble/curves/ed25519");

        // build signed data
        const bufferWriter = new BufferWriter();
        bufferWriter.writeBytes(this.publicKey);
        bufferWriter.writeUInt32LE(this.timestamp);
        bufferWriter.writeBytes(this.appData);

        // verify signature
        return ed25519.verify(this.signature, bufferWriter.toBytes(), this.publicKey);

    }

    parseAppData() {

        // read app data
        const bufferReader = new BufferReader(this.appData);
        const flags = bufferReader.readByte();

        // parse lat lon
        var lat = null;
        var lon = null;
        if(flags & Constants.AdvertFlags.LatLon){
            lat = bufferReader.readInt32LE();
            lon = bufferReader.readInt32LE();
        }

        // parse name (remainder of app data)
        var name = null;
        if(flags & Constants.AdvertFlags.Name){
            name = bufferReader.readString();
        }

        return {
            type: this.getTypeString(),
            lat: lat,
            lon: lon,
            name: name,
        };

    }

}

export default Advert;
