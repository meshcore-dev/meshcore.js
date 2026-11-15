# MeshCore.js

A JavaScript library for interacting with a [MeshCore](https://github.com/meshcore-dev/MeshCore) device running the [Companion Radio Firmware](https://github.com/meshcore-dev/MeshCore/blob/main/examples/companion_radio/main.cpp).

This library can be used in a Web Browser to connect to MeshCore Companion devices over BLE or USB Serial.

It can also be used in Node.js to connect to MeshCore Companion devices over TCP/Wi-Fi or USB Serial.

## Supported Connection Methods

- Web Browser
  - BLE: [WebBleConnection()](./src/connection/web_ble_connection.js)
  - USB/Serial: [WebSerialConnection()](./src/connection/web_serial_connection.js)
- Node.js
  - TCP/Wi-Fi: [TCPConnection("host", "port")](./src/connection/tcp_connection.js)
  - USB/Serial: [NodeJSSerialConnection("/dev/ttyUSB0")](./src/connection/nodejs_serial_connection.js)

## Install

```
npm install @liamcottle/meshcore.js
```

## Simple Example

```
import { TCPConnection, NodeJSSerialConnection } from "@liamcottle/meshcore.js";

// serial connections are supported by "companion_radio_usb" firmware
const connection = new NodeJSSerialConnection("/dev/cu.usbmodem14401");

// tcp connections are supported by "companion_radio_wifi" firmware
// const connection = new TCPConnection("10.1.0.226", 5000);

// wait until connected
connection.on("connected", async () => {

    // we are now connected
    console.log("connected!");

    // log contacts
    const contacts = await connection.getContacts();
    for(const contact of contacts) {
        console.log(`Contact: ${contact.advName}`);
    }

    // disconnect
    connection.close();

});

// connect to meshcore device
await connection.connect();
```

## Examples

There's a few other examples scripts in the [examples](./examples) folder.

### Repeater regions

`connection.getRegions(publicKey)` returns `{ regions, repeaterClock }`. See [get_repeater_regions.js](./examples/get_repeater_regions.js) for a Node.js example.

The minimum verified Companion version is v1.12.0. The repeater must already be in the Companion contact table with a direct route; the library does not add contacts or change routes. Companion v1.11.0 returns `UnsupportedCmd`, and a missing contact on v1.12.0 returns `NotFound`. A flooded route is rejected because repeaters only answer direct region requests.

Serialize remote requests by awaiting each result before starting the next; do not overlap them with `Promise.all()`. A response can omit region names if the repeater's response buffer fills, and the firmware does not report truncation.

## License

MIT
