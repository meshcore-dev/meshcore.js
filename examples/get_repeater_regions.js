import NodeJSSerialConnection from "../src/connection/nodejs_serial_connection.js";

// Usage: node examples/get_repeater_regions.js <repeater-public-key-hex>
const repeaterPublicKeyHex = process.argv[2];
if(!/^(?:[0-9a-f]{2}){32}$/i.test(repeaterPublicKeyHex ?? "")) {
    throw new Error("Pass the repeater's 64-character public key in hex.");
}

const repeaterPublicKey = Buffer.from(repeaterPublicKeyHex, "hex");
const connection = new NodeJSSerialConnection("/dev/cu.usbmodem14401");

// Minimum verified Companion version: v1.12.0.
// The repeater must already be in the Companion contact table with a direct route.
connection.on("connected", async () => {
    try {
        const contact = await connection.findContactByPublicKeyPrefix(repeaterPublicKey);
        if(!contact) {
            throw new Error("Add the repeater to the Companion contact table with a direct route first.");
        }
        if(contact.outPathLen !== 0) {
            throw new Error("The repeater contact does not have a direct route.");
        }

        const result = await connection.getRegions(contact.publicKey);
        console.log("Repeater clock:", result.repeaterClock);
        console.log("Flood-allowed regions:", result.regions);
    } catch(error) {
        console.error("Region query failed:", error.message, error.errCode ?? "");
    } finally {
        await connection.close();
    }
});

await connection.connect();
