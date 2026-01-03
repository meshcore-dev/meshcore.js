# MeshCore.js

A Javascript library for interacting with a [MeshCore](https://github.com/meshcore-dev/MeshCore) device running the [Companion Radio Firmware](https://github.com/meshcore-dev/MeshCore/blob/main/examples/companion_radio/main.cpp).

This library can be used in a Web Browser to connect to MeshCore Companion devices over BLE or USB Serial.

It can also be used in NodeJS to connect to MeshCore Companion devices over TCP/WiFi or USB Serial.

## Supported Connection Methods

- Web Browser
  - BLE: [WebBleConnection()](./src/connection/web_ble_connection.js)
  - USB/Serial: [WebSerialConnection()](./src/connection/web_serial_connection.js)
- NodeJS
  - TCP/WiFi: [TCPConnection("host", "port")](./src/connection/tcp_connection.js)
  - USB/Serial: [NodeJSSerialConnection("/dev/ttyUSB0")](./src/connection/nodejs_serial_connection.js)

## Install

```
npm install @liamcottle/meshcore.js
```

## Simple Examples

### Enumerate Contacts (Node.js)

```javascript
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

### Enumerate Contacts (Browser)

```html
<button id="connect-serial">Connect via Serial</button>

<script type="module">
import { WebBleConnection, WebSerialConnection } from "@liamcottle/meshcore.js";

// wait until connected
async function onConnected(connection) {

    // we are now connected
    console.log("connected!");

    // log contacts
    const contacts = await connection.getContacts();
    for (const contact of contacts) {
        console.log(`Contact: ${contact.advName}`);
    }
}

document.getElementById("connect-serial").addEventListener("click", async () => {
    const connection = await WebSerialConnection.open();
    connection.on("connected", () => onConnected(connection));
});
</script>
```

## Examples

There's a few other examples scripts in the [examples](./examples) folder.

## License

MIT
