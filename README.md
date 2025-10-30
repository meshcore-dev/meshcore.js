# MeshCore.js

A Javascript library for interacting with a [MeshCore](https://github.com/ripplebiz/MeshCore) device running the [Companion Radio Firmware](https://github.com/ripplebiz/MeshCore/blob/main/examples/companion_radio/main.cpp).

This library can be used in a Web Browser to connect to MeshCore Companion devices over BLE or USB Serial.

It can also be used in NodeJS to connect to MeshCore Companion devices over TCP/WiFi or USB Serial.

## Supported Connection Methods

- Web Browser
    - BLE: [WebBleConnection()](./src/connection/web_ble_connection.js)
    - USB/Serial: [WebSerialConnection()](./src/connection/web_serial_connection.js)
    - WebSocket: [WebSocketConnection()](./src/connection/websocket_connection.js)
- NodeJS
    - TCP/WiFi: [TCPConnection("host", "port")](./src/connection/tcp_connection.js)
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

## License

MIT
