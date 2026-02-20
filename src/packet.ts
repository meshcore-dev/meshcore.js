import BufferReader from "./buffer_reader.js";
import Advert from "./advert.js";

class Packet {

    // Packet::header values
    static PH_ROUTE_MASK = 0x03;   // 2-bits
    static PH_TYPE_SHIFT = 2;
    static PH_TYPE_MASK = 0x0F;   // 4-bits
    static PH_VER_SHIFT = 6;
    static PH_VER_MASK = 0x03;   // 2-bits

    static ROUTE_TYPE_TRANSPORT_FLOOD = 0x00;    // flood mode + transport codes
    static ROUTE_TYPE_FLOOD = 0x01;    // flood mode, needs 'path' to be built up (max 64 bytes)
    static ROUTE_TYPE_DIRECT = 0x02;    // direct route, 'path' is supplied
    static ROUTE_TYPE_TRANSPORT_DIRECT = 0x03;    // direct route + transport codes

    static PAYLOAD_TYPE_REQ = 0x00;    // request (prefixed with dest/src hashes, MAC) (enc data: timestamp, blob)
    static PAYLOAD_TYPE_RESPONSE = 0x01;    // response to REQ or ANON_REQ (prefixed with dest/src hashes, MAC) (enc data: timestamp, blob)
    static PAYLOAD_TYPE_TXT_MSG = 0x02;    // a plain text message (prefixed with dest/src hashes, MAC) (enc data: timestamp, text)
    static PAYLOAD_TYPE_ACK = 0x03;    // a simple ack
    static PAYLOAD_TYPE_ADVERT = 0x04;    // a node advertising its Identity
    static PAYLOAD_TYPE_GRP_TXT = 0x05;    // an (unverified) group text message (prefixed with channel hash, MAC) (enc data: timestamp, "name: msg")
    static PAYLOAD_TYPE_GRP_DATA = 0x06;    // an (unverified) group datagram (prefixed with channel hash, MAC) (enc data: timestamp, blob)
    static PAYLOAD_TYPE_ANON_REQ = 0x07;    // generic request (prefixed with dest_hash, ephemeral pub_key, MAC) (enc data: ...)
    static PAYLOAD_TYPE_PATH = 0x08;    // returned path (prefixed with dest/src hashes, MAC) (enc data: path, extra)
    static PAYLOAD_TYPE_TRACE = 0x09;    // trace a path, collecting SNR for each hop
    static PAYLOAD_TYPE_RAW_CUSTOM = 0x0F;    // custom packet as raw bytes, for applications with custom encryption, payloads, etc

    header: number;
    path: Uint8Array;
    payload: Uint8Array;
    transportCode1: number | null;
    transportCode2: number | null;
    route_type: number;
    route_type_string: string | null;
    payload_type: number;
    payload_type_string: string | null;
    payload_version: number;
    is_marked_do_not_retransmit: boolean;

    constructor(header: number, path: Uint8Array, payload: Uint8Array, transportCode1: number | null, transportCode2: number | null) {

        this.header = header;
        this.path = path;
        this.payload = payload;
        this.transportCode1 = transportCode1;
        this.transportCode2 = transportCode2;

        // parsed info
        this.route_type = this.getRouteType();
        this.route_type_string = this.getRouteTypeString();
        this.payload_type = this.getPayloadType();
        this.payload_type_string = this.getPayloadTypeString();
        this.payload_version = this.getPayloadVer();
        this.is_marked_do_not_retransmit = this.isMarkedDoNotRetransmit();

    }

    static fromBytes(bytes: Uint8Array): Packet {

        const bufferReader = new BufferReader(bytes);
        const header = bufferReader.readByte();

        // check if packet has transport codes
        const routeType = header & Packet.PH_ROUTE_MASK;
        const hasTransportCodes = routeType === Packet.ROUTE_TYPE_TRANSPORT_FLOOD || routeType === Packet.ROUTE_TYPE_TRANSPORT_DIRECT;

        // parse transport codes
        var transportCode1: number | null = null;
        var transportCode2: number | null = null;
        if(hasTransportCodes){
            transportCode1 = bufferReader.readUInt16LE();
            transportCode2 = bufferReader.readUInt16LE();
        }

        const pathLen = bufferReader.readInt8();
        const path = bufferReader.readBytes(pathLen);
        const payload = bufferReader.readRemainingBytes();

        return new Packet(header, path, payload, transportCode1, transportCode2);

    }

    getRouteType(): number {
        return this.header & Packet.PH_ROUTE_MASK;
    }

    getRouteTypeString(): string | null {
        switch(this.getRouteType()){
            case Packet.ROUTE_TYPE_FLOOD: return "FLOOD";
            case Packet.ROUTE_TYPE_DIRECT: return "DIRECT";
            case Packet.ROUTE_TYPE_TRANSPORT_FLOOD: return "TRANSPORT_FLOOD";
            case Packet.ROUTE_TYPE_TRANSPORT_DIRECT: return "TRANSPORT_DIRECT";
            default: return null;
        }
    }

    isRouteFlood(): boolean {
        return this.getRouteType() === Packet.ROUTE_TYPE_FLOOD;
    }

    isRouteDirect(): boolean {
        return this.getRouteType() === Packet.ROUTE_TYPE_DIRECT;
    }

    getPayloadType(): number {
        return (this.header >> Packet.PH_TYPE_SHIFT) & Packet.PH_TYPE_MASK;
    }

    getPayloadTypeString(): string | null {
        switch(this.getPayloadType()){
            case Packet.PAYLOAD_TYPE_REQ: return "REQ";
            case Packet.PAYLOAD_TYPE_RESPONSE: return "RESPONSE";
            case Packet.PAYLOAD_TYPE_TXT_MSG: return "TXT_MSG";
            case Packet.PAYLOAD_TYPE_ACK: return "ACK";
            case Packet.PAYLOAD_TYPE_ADVERT: return "ADVERT";
            case Packet.PAYLOAD_TYPE_GRP_TXT: return "GRP_TXT";
            case Packet.PAYLOAD_TYPE_GRP_DATA: return "GRP_DATA";
            case Packet.PAYLOAD_TYPE_ANON_REQ: return "ANON_REQ";
            case Packet.PAYLOAD_TYPE_PATH: return "PATH";
            case Packet.PAYLOAD_TYPE_TRACE: return "TRACE";
            case Packet.PAYLOAD_TYPE_RAW_CUSTOM: return "RAW_CUSTOM";
            default: return null;
        }
    }

    getPayloadVer(): number {
        return (this.header >> Packet.PH_VER_SHIFT) & Packet.PH_VER_MASK;
    }

    markDoNotRetransmit(): void {
        this.header = 0xFF;
    }

    isMarkedDoNotRetransmit(): boolean {
        return this.header === 0xFF;
    }

    parsePayload(): any {
        switch(this.getPayloadType()){
            case Packet.PAYLOAD_TYPE_PATH: return this.parsePayloadTypePath();
            case Packet.PAYLOAD_TYPE_REQ: return this.parsePayloadTypeReq();
            case Packet.PAYLOAD_TYPE_RESPONSE: return this.parsePayloadTypeResponse();
            case Packet.PAYLOAD_TYPE_TXT_MSG: return this.parsePayloadTypeTxtMsg();
            case Packet.PAYLOAD_TYPE_ACK: return this.parsePayloadTypeAck();
            case Packet.PAYLOAD_TYPE_ADVERT: return this.parsePayloadTypeAdvert();
            case Packet.PAYLOAD_TYPE_ANON_REQ: return this.parsePayloadTypeAnonReq();
            default: return null;
        }
    }

    parsePayloadTypePath() {

        // parse bytes
        const bufferReader = new BufferReader(this.payload);
        const dest = bufferReader.readByte();
        const src = bufferReader.readByte();
        // todo other fields

        return {
            src: src,
            dest: dest,
        };

    }

    parsePayloadTypeReq() {

        // parse bytes
        const bufferReader = new BufferReader(this.payload);
        const dest = bufferReader.readByte();
        const src = bufferReader.readByte();
        const encrypted = bufferReader.readRemainingBytes();

        return {
            src: src,
            dest: dest,
            encrypted: encrypted,
        };

    }

    parsePayloadTypeResponse() {

        // parse bytes
        const bufferReader = new BufferReader(this.payload);
        const dest = bufferReader.readByte();
        const src = bufferReader.readByte();
        // todo other fields

        return {
            src: src,
            dest: dest,
        };

    }

    parsePayloadTypeTxtMsg() {

        // parse bytes
        const bufferReader = new BufferReader(this.payload);
        const dest = bufferReader.readByte();
        const src = bufferReader.readByte();
        // todo other fields

        return {
            src: src,
            dest: dest,
        };

    }

    parsePayloadTypeAck() {
        return {
            ack_code: this.payload,
        };
    }

    parsePayloadTypeAdvert() {
        const advert = Advert.fromBytes(this.payload);
        return {
            public_key: advert.publicKey,
            timestamp: advert.timestamp,
            app_data: advert.parseAppData(),
        };
    }

    parsePayloadTypeAnonReq() {

        // parse bytes
        const bufferReader = new BufferReader(this.payload);
        const dest = bufferReader.readByte();
        const srcPublicKey = bufferReader.readBytes(32);
        // todo other fields

        return {
            src: srcPublicKey,
            dest: dest,
        };

    }

}

export default Packet;
