/**
 * TypeScript declarations for @liamcottle/meshcore.js
 */

declare module '@liamcottle/meshcore.js' {
  import { EventEmitter } from 'events';

  export class Connection extends EventEmitter {
    connect(): Promise<void>;
    close(): Promise<void>;

    // High-level API methods
    getSelfInfo(timeout?: number): Promise<SelfInfo>;
    getWaitingMessages(): Promise<Message[]>;
    getChannels(): Promise<Channel[]>;
    getContacts(since?: number): Promise<Contact[]>;
    syncNextMessage(): Promise<void>;

    // Message sending
    sendTextMessage(publicKey: Buffer, text: string): Promise<void>;
    sendChannelTextMessage(channelIdx: number, text: string): Promise<void>;

    // Contact lookup
    findContactByPublicKeyPrefix(prefix: Buffer): Promise<Contact | null>;

    // Frame handling (can be overridden in subclasses)
    onFrameReceived(frame: Buffer): void;

    // Events
    on(event: 'connected', listener: () => void): this;
    on(event: 'disconnected', listener: () => void): this;
    on(event: number, listener: (data: any) => void): this;
    on(event: string | number, listener: (...args: any[]) => void): this;

    emit(event: string | number, ...args: any[]): boolean;
  }

  export class NodeJSSerialConnection extends Connection {
    constructor(port: string);
  }

  export class WebSerialConnection extends Connection {
    constructor();
  }

  export class TCPConnection extends Connection {
    constructor(host: string, port: number);
  }

  export class WebBleConnection extends Connection {
    constructor();
  }

  export class SerialConnection extends Connection {
    constructor();
  }

  // Type definitions
  export interface SelfInfo {
    publicKey: Buffer;
    name?: string;
  }

  export interface Message {
    pubKeyPrefix: Buffer;
    pathLen: number;
    txtType: number;
    senderTimestamp: number;
    text: string;
  }

  export interface Channel {
    channelIdx: number;
    name: string;
    secret: Buffer;
  }

  export interface Contact {
    publicKey: Buffer;
    name?: string;
    lastSeen?: number;
  }

  // Constants
  export class Constants {
    static readonly SupportedCompanionProtocolVersion: number;

    static readonly ResponseCodes: {
      ContactMsgRecv: number;
      ChannelMsgRecv: number;
      [key: string]: number;
    };

    static readonly PushCodes: {
      MsgWaiting: number;
      NewAdvert: number;
      [key: string]: number;
    };

    static readonly CommandCodes: {
      AppStart: number;
      SendTxtMsg: number;
      SendChannelTxtMsg: number;
      GetContacts: number;
      GetDeviceTime: number;
      SetDeviceTime: number;
      SendSelfAdvert: number;
      SetAdvertName: number;
      [key: string]: number;
    };
  }

  export class Advert {
    constructor(data: Buffer);
    publicKey: Buffer;
    advName?: string;
  }

  export class Packet {
    constructor(data: Buffer);
  }

  export class BufferUtils {
    static xor(a: Buffer, b: Buffer): Buffer;
    static concat(...buffers: Buffer[]): Buffer;
  }

  export class CayenneLpp {
    constructor();
  }
}

// Type declarations for submodules
declare module '@liamcottle/meshcore.js/src/constants.js' {
  const Constants: {
    SupportedCompanionProtocolVersion: number;
    ResponseCodes: {
      ContactMsgRecv: number;
      ChannelMsgRecv: number;
      [key: string]: number;
    };
    PushCodes: {
      MsgWaiting: number;
      NewAdvert: number;
      [key: string]: number;
    };
    CommandCodes: {
      AppStart: number;
      SendTxtMsg: number;
      SendChannelTxtMsg: number;
      GetContacts: number;
      GetDeviceTime: number;
      SetDeviceTime: number;
      SendSelfAdvert: number;
      SetAdvertName: number;
      [key: string]: number;
    };
  };
  export default Constants;
}

declare module '@liamcottle/meshcore.js/src/buffer_reader.js' {
  export default class BufferReader {
    constructor(buffer: Buffer);
    readByte(): number;
    readInt8(): number;
    readUInt16LE(): number;
    readUInt32LE(): number;
    readBytes(length: number): Buffer;
    readString(): string;
  }
}

declare module '@liamcottle/meshcore.js/src/buffer_writer.js' {
  export default class BufferWriter {
    constructor();
    writeByte(value: number): void;
    writeInt8(value: number): void;
    writeUInt16LE(value: number): void;
    writeUInt32LE(value: number): void;
    writeBytes(buffer: Buffer | Uint8Array): void;
    writeString(str: string): void;
    toBytes(): Buffer;
  }
}
