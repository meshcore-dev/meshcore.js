import BufferReader from "./buffer_reader.js";
import BufferWriter from "./buffer_writer.js";

/** @typedef {import("./types.js").AdvertParsedData} AdvertParsedData */

class Advert {

    static ADV_TYPE_NONE = 0;
    static ADV_TYPE_CHAT = 1;
    static ADV_TYPE_REPEATER = 2;
    static ADV_TYPE_ROOM = 3;

    static ADV_LATLON_MASK = 0x10;
    static ADV_FEAT1_MASK = 0x20;
    static ADV_FEAT2_MASK = 0x40;
    static ADV_NAME_MASK = 0x80;

    /**
     * @param {Uint8Array} publicKey
     * @param {number} timestamp
     * @param {Uint8Array} signature
     * @param {Uint8Array} appData
     */
    constructor(publicKey, timestamp, signature, appData) {
        this.publicKey = publicKey;
        this.timestamp = timestamp;
        this.signature = signature;
        this.appData = appData;
        /** @type {AdvertParsedData} */
        this.parsed = this.parseAppData();
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {Advert}
     */
    static fromBytes(bytes) {

        // read bytes
        const bufferReader = new BufferReader(bytes);
        const publicKey = bufferReader.readBytes(32);
        const timestamp = bufferReader.readUInt32LE();
        const signature = bufferReader.readBytes(64);
        const appData = bufferReader.readRemainingBytes();

        return new Advert(publicKey, timestamp, signature, appData);

    }

    /** @returns {number} */
    getFlags() {
        return this.appData[0];
    }

    /** @returns {number} */
    getType() {
        const flags = this.getFlags();
        return flags & 0x0F;
    }

    /** @returns {"NONE" | "CHAT" | "REPEATER" | "ROOM" | null} */
    getTypeString() {
        const type = this.getType();
        if(type === Advert.ADV_TYPE_NONE) return "NONE";
        if(type === Advert.ADV_TYPE_CHAT) return "CHAT";
        if(type === Advert.ADV_TYPE_REPEATER) return "REPEATER";
        if(type === Advert.ADV_TYPE_ROOM) return "ROOM";
        return null;
    }

    /** @returns {Promise<boolean>} */
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

    /** @returns {AdvertParsedData} */
    parseAppData() {

        // read app data
        const bufferReader = new BufferReader(this.appData);
        const flags = bufferReader.readByte();

        // parse lat lon
        var lat = null;
        var lon = null;
        if(flags & Advert.ADV_LATLON_MASK){
            lat = bufferReader.readInt32LE();
            lon = bufferReader.readInt32LE();
        }

        // parse feat1
        var feat1 = null;
        if(flags & Advert.ADV_FEAT1_MASK){
            feat1 = bufferReader.readUInt16LE();
        }

        // parse feat2
        var feat2 = null;
        if(flags & Advert.ADV_FEAT2_MASK){
            feat2 = bufferReader.readUInt16LE();
        }

        // parse name (remainder of app data)
        var name = null;
        if(flags & Advert.ADV_NAME_MASK){
            name = bufferReader.readString();
        }

        return {
            type: this.getTypeString(),
            lat: lat,
            lon: lon,
            name: name,
            feat1: feat1,
            feat2: feat2,
        };

    }

}

export default Advert;
