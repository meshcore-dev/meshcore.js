import BufferReader from './buffer_reader.js';
import BufferWriter from './buffer_writer.js';

class Advert {
  static ADV_TYPE_NONE = 0;
  static ADV_TYPE_CHAT = 1;
  static ADV_TYPE_REPEATER = 2;
  static ADV_TYPE_ROOM = 3;

  static ADV_LATLON_MASK = 0x10;
  static ADV_BATTERY_MASK = 0x20;
  static ADV_TEMPERATURE_MASK = 0x40;
  static ADV_NAME_MASK = 0x80;

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
    return flags & 0x0f;
  }

  getTypeString() {
    const type = this.getType();
    if (type === Advert.ADV_TYPE_NONE) return 'NONE';
    if (type === Advert.ADV_TYPE_CHAT) return 'CHAT';
    if (type === Advert.ADV_TYPE_REPEATER) return 'REPEATER';
    if (type === Advert.ADV_TYPE_ROOM) return 'ROOM';
    return null;
  }

  async isVerified() {
    const { ed25519 } = await import('@noble/curves/ed25519');

    // build signed data
    const bufferWriter = new BufferWriter();
    bufferWriter.writeBytes(this.publicKey);
    bufferWriter.writeUInt32LE(this.timestamp);
    bufferWriter.writeBytes(this.appData);

    // verify signature
    return ed25519.verify(
      this.signature,
      bufferWriter.toBytes(),
      this.publicKey,
    );
  }

  parseAppData() {
    // read app data
    const bufferReader = new BufferReader(this.appData);
    const flags = bufferReader.readByte();

    // parse lat lon
    var lat = null;
    var lon = null;
    if (flags & Advert.ADV_LATLON_MASK) {
      lat = bufferReader.readInt32LE();
      lon = bufferReader.readInt32LE();
    }

    // parse name (remainder of app data)
    var name = null;
    if (flags & Advert.ADV_NAME_MASK) {
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
