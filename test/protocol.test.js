import { describe, it } from 'node:test';
import assert from 'node:assert';
import Connection from '../src/connection/connection.js';
import BufferWriter from '../src/buffer_writer.js';
import Constants from '../src/constants.js';

// Helper to wait for an event from the connection
function waitForEvent(conn, eventCode) {
    return new Promise((resolve) => {
        conn.on(eventCode, (data) => {
            resolve(data);
        });
    });
}

describe('SelfInfo Response Parsing', () => {
    it('should parse SelfInfo with correct field order', async () => {
        // Build a mock SelfInfo response
        const writer = new BufferWriter();
        writer.writeByte(Constants.ResponseCodes.SelfInfo);
        writer.writeByte(Constants.AdvType.Chat);  // type
        writer.writeByte(20);       // txPower
        writer.writeByte(30);       // maxTxPower
        writer.writeBytes(new Uint8Array(32).fill(0xAB)); // publicKey
        writer.writeInt32LE(12345678);  // advLat
        writer.writeInt32LE(-87654321); // advLon
        writer.writeBytes(new Uint8Array(3)); // reserved
        writer.writeByte(1);        // manualAddContacts
        writer.writeUInt32LE(915000); // radioFreq
        writer.writeUInt32LE(125);   // radioBw
        writer.writeByte(10);       // radioSf
        writer.writeByte(5);        // radioCr
        writer.writeString('TestNode'); // name

        const conn = new Connection();
        const resultPromise = waitForEvent(conn, Constants.ResponseCodes.SelfInfo);

        conn.onFrameReceived(writer.toBytes());

        const result = await resultPromise;

        assert.strictEqual(result.type, 1);
        assert.strictEqual(result.txPower, 20);
        assert.strictEqual(result.maxTxPower, 30);
        assert.deepStrictEqual(result.publicKey, new Uint8Array(32).fill(0xAB));
        assert.strictEqual(result.advLat, 12345678);
        assert.strictEqual(result.advLon, -87654321);
        assert.strictEqual(result.manualAddContacts, 1);
        assert.strictEqual(result.radioFreq, 915000);
        assert.strictEqual(result.radioBw, 125);
        assert.strictEqual(result.radioSf, 10);
        assert.strictEqual(result.radioCr, 5);
        assert.strictEqual(result.name, 'TestNode');
    });
});

describe('Contact Response Parsing', () => {
    it('should parse Contact with correct field order starting with publicKey', async () => {
        // Create a specific outPath with known values for the first 3 bytes (matching outPathLen)
        const outPath = new Uint8Array(64).fill(0x00);
        outPath[0] = 0xAA; // First hop
        outPath[1] = 0xBB; // Second hop
        outPath[2] = 0xCC; // Third hop

        const writer = new BufferWriter();
        writer.writeByte(Constants.ResponseCodes.Contact);
        writer.writeBytes(new Uint8Array(32).fill(0xCD)); // publicKey
        writer.writeByte(Constants.AdvType.Repeater);  // type
        writer.writeByte(0x01);     // flags
        writer.writeInt8(3);        // outPathLen
        writer.writeBytes(outPath); // outPath (fixed 64 bytes)
        writer.writeCString('James Example', 32); // advName (32 bytes C-string)
        writer.writeUInt32LE(1704067200); // lastAdvert (timestamp)
        writer.writeUInt32LE(40000000);   // advLat
        writer.writeUInt32LE(-74000000 >>> 0); // advLon (as unsigned)
        writer.writeUInt32LE(1704153600); // lastMod

        const conn = new Connection();
        const resultPromise = waitForEvent(conn, Constants.ResponseCodes.Contact);

        conn.onFrameReceived(writer.toBytes());

        const result = await resultPromise;

        assert.strictEqual(result.publicKey.length, 32);
        assert.strictEqual(result.publicKey[0], 0xCD);
        assert.strictEqual(result.type, 2);
        assert.strictEqual(result.flags, 0x01);
        assert.strictEqual(result.outPathLen, 3);
        assert.strictEqual(result.outPath.length, 64);
        // Verify the actual path bytes match what was written
        assert.strictEqual(result.outPath[0], 0xAA);
        assert.strictEqual(result.outPath[1], 0xBB);
        assert.strictEqual(result.outPath[2], 0xCC);
        // Note: bytes beyond outPathLen are undefined and should not be asserted
        assert.strictEqual(result.advName, 'James Example');
        assert.strictEqual(result.lastAdvert, 1704067200);
    });

    it('should parse Contact with empty outPath (direct connection)', async () => {
        const writer = new BufferWriter();
        writer.writeByte(Constants.ResponseCodes.Contact);
        writer.writeBytes(new Uint8Array(32).fill(0xEE)); // publicKey
        writer.writeByte(Constants.AdvType.Chat);  // type
        writer.writeByte(0x00);     // flags
        writer.writeInt8(0);        // outPathLen = 0 (direct connection)
        writer.writeBytes(new Uint8Array(64).fill(0x00)); // outPath (all zeros)
        writer.writeCString('Direct Contact', 32); // advName
        writer.writeUInt32LE(1704067200); // lastAdvert
        writer.writeUInt32LE(0);          // advLat
        writer.writeUInt32LE(0);          // advLon
        writer.writeUInt32LE(1704153600); // lastMod

        const conn = new Connection();
        const resultPromise = waitForEvent(conn, Constants.ResponseCodes.Contact);

        conn.onFrameReceived(writer.toBytes());

        const result = await resultPromise;

        assert.strictEqual(result.outPathLen, 0);
        assert.strictEqual(result.outPath.length, 64);
        // Note: when outPathLen is 0, all bytes in outPath are undefined and should not be asserted
    });

    it('should parse Contact with longer multi-hop outPath', async () => {
        // Create a path with 6 hops
        const outPath = new Uint8Array(64).fill(0x00);
        const pathHops = [0x11, 0x22, 0x33, 0x44, 0x55, 0x66];
        for (let i = 0; i < pathHops.length; i++) {
            outPath[i] = pathHops[i];
        }

        const writer = new BufferWriter();
        writer.writeByte(Constants.ResponseCodes.Contact);
        writer.writeBytes(new Uint8Array(32).fill(0xAB)); // publicKey
        writer.writeByte(Constants.AdvType.Repeater);  // type
        writer.writeByte(0x03);     // flags
        writer.writeInt8(6);        // outPathLen = 6 hops
        writer.writeBytes(outPath); // outPath
        writer.writeCString('Multi-hop Node', 32); // advName
        writer.writeUInt32LE(1704067200); // lastAdvert
        writer.writeUInt32LE(40000000);   // advLat
        writer.writeUInt32LE(0);          // advLon
        writer.writeUInt32LE(1704153600); // lastMod

        const conn = new Connection();
        const resultPromise = waitForEvent(conn, Constants.ResponseCodes.Contact);

        conn.onFrameReceived(writer.toBytes());

        const result = await resultPromise;

        assert.strictEqual(result.outPathLen, 6);
        assert.strictEqual(result.outPath.length, 64);
        // Verify all path hops are correctly parsed
        for (let i = 0; i < pathHops.length; i++) {
            assert.strictEqual(result.outPath[i], pathHops[i], `outPath[${i}] should be 0x${pathHops[i].toString(16)}`);
        }
        // Note: bytes beyond outPathLen are undefined and should not be asserted
    });
});

describe('LogRxData Push Parsing', () => {
    it('should parse SNR and RSSI from beginning of payload', async () => {
        const writer = new BufferWriter();
        writer.writeByte(Constants.PushCodes.LogRxData);
        writer.writeInt8(40);  // snr * 4 = 10.0
        writer.writeInt8(-90); // rssi
        writer.writeBytes([0xDE, 0xAD, 0xBE, 0xEF]); // raw payload

        const conn = new Connection();
        const resultPromise = waitForEvent(conn, Constants.PushCodes.LogRxData);

        conn.onFrameReceived(writer.toBytes());

        const result = await resultPromise;

        assert.strictEqual(result.lastSnr, 10.0);  // 40/4
        assert.strictEqual(result.lastRssi, -90);
        assert.deepStrictEqual(result.raw, new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]));
    });

    it('should handle negative SNR values', async () => {
        const writer = new BufferWriter();
        writer.writeByte(Constants.PushCodes.LogRxData);
        writer.writeInt8(-20); // snr * 4 = -5.0
        writer.writeInt8(-110); // rssi
        writer.writeBytes([0x01, 0x02]); // raw payload

        const conn = new Connection();
        const resultPromise = waitForEvent(conn, Constants.PushCodes.LogRxData);

        conn.onFrameReceived(writer.toBytes());

        const result = await resultPromise;

        assert.strictEqual(result.lastSnr, -5.0);  // -20/4
        assert.strictEqual(result.lastRssi, -110);
    });
});

describe('SendConfirmed Push Parsing', () => {
    it('should parse ackCode as 4 bytes (uint32)', async () => {
        const writer = new BufferWriter();
        writer.writeByte(Constants.PushCodes.SendConfirmed);
        writer.writeUInt32LE(0xDEADBEEF); // ackCode (4 bytes)
        writer.writeUInt32LE(1500);       // roundTrip (4 bytes)

        const conn = new Connection();
        const resultPromise = waitForEvent(conn, Constants.PushCodes.SendConfirmed);

        conn.onFrameReceived(writer.toBytes());

        const result = await resultPromise;

        assert.strictEqual(result.ackCode, 0xDEADBEEF);
        assert.strictEqual(result.roundTrip, 1500);
    });
});

describe('RawData Push Parsing', () => {
    it('should parse SNR, RSSI, reserved byte, then payload', async () => {
        const writer = new BufferWriter();
        writer.writeByte(Constants.PushCodes.RawData);
        writer.writeInt8(24);    // snr * 4 = 6.0
        writer.writeInt8(-85);   // rssi
        writer.writeByte(0x00);  // reserved
        writer.writeBytes([0xCA, 0xFE, 0xBA, 0xBE]); // payload

        const conn = new Connection();
        const resultPromise = waitForEvent(conn, Constants.PushCodes.RawData);

        conn.onFrameReceived(writer.toBytes());

        const result = await resultPromise;

        assert.strictEqual(result.lastSnr, 6.0);  // 24/4
        assert.strictEqual(result.lastRssi, -85);
        assert.deepStrictEqual(result.payload, new Uint8Array([0xCA, 0xFE, 0xBA, 0xBE]));
    });
});

describe('NewAdvert Push Parsing', () => {
    it('should parse NewAdvert with lastMod field', async () => {
        const writer = new BufferWriter();
        writer.writeByte(Constants.PushCodes.NewAdvert);
        writer.writeBytes(new Uint8Array(32).fill(0xEF)); // publicKey
        writer.writeByte(Constants.AdvType.Chat);  // type
        writer.writeByte(0x02);     // flags
        writer.writeInt8(2);        // outPathLen
        writer.writeBytes(new Uint8Array(64).fill(0x00)); // outPath (fixed 64 bytes)
        writer.writeCString('NewNode', 32); // advName (32 bytes C-string)
        writer.writeUInt32LE(1704067200); // lastAdvert
        writer.writeUInt32LE(40000000);   // advLat
        writer.writeUInt32LE(0);          // advLon
        writer.writeUInt32LE(1704153600); // lastMod

        const conn = new Connection();
        const resultPromise = waitForEvent(conn, Constants.PushCodes.NewAdvert);

        conn.onFrameReceived(writer.toBytes());

        const result = await resultPromise;

        assert.deepStrictEqual(result.publicKey, new Uint8Array(32).fill(0xEF));
        assert.strictEqual(result.type, 1);
        assert.strictEqual(result.flags, 0x02);
        assert.strictEqual(result.outPathLen, 2);
        assert.strictEqual(result.outPath.length, 64);
        assert.strictEqual(result.advName, 'NewNode');
        assert.strictEqual(result.lastAdvert, 1704067200);
        assert.strictEqual(result.lastMod, 1704153600);
    });
});

describe('Sent Response Parsing', () => {
    it('should parse Sent response with result, expectedAckCrc, and estTimeout', async () => {
        const writer = new BufferWriter();
        writer.writeByte(Constants.ResponseCodes.Sent);
        writer.writeInt8(0);              // result
        writer.writeUInt32LE(0x12345678); // expectedAckCrc
        writer.writeUInt32LE(5000);       // estTimeout

        const conn = new Connection();
        const resultPromise = waitForEvent(conn, Constants.ResponseCodes.Sent);

        conn.onFrameReceived(writer.toBytes());

        const result = await resultPromise;

        assert.strictEqual(result.result, 0);
        assert.strictEqual(result.expectedAckCrc, 0x12345678);
        assert.strictEqual(result.estTimeout, 5000);
    });
});
