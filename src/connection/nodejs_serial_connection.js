import SerialConnection from "./serial_connection.js";

class NodeJSSerialConnection extends SerialConnection {

    /**
     * @param path serial port to connect to, e.g: "/dev/ttyACM0" or "/dev/cu.usbmodem14401"
     */
    constructor(path) {
        super();
        this.serialPortPath = path;
    }

    async connect() {

        // note: serialport module is only available in NodeJS, you shouldn't use NodeJSSerialConnection from a web browser
        const { SerialPort } = await import('serialport');

        // create new serial port
        this.serialPort = new SerialPort({
            autoOpen: false, // don't auto open, we want to control this manually
            path: this.serialPortPath, // e.g: "/dev/ttyACM0" or "/dev/cu.usbmodem14401"
            baudRate: 115200,
        });

        this.serialPort.on("open", async () => {
           await this.onConnected();
        });

        this.serialPort.on("close", () => {
            this.onDisconnected();
        });

        this.serialPort.on("error", function(err) {
            console.error("SerialPort Error: ", err.message);
            this.emit("error", err);
        });

        this.serialPort.on("data", async (data) => {
            await this.onDataReceived(data);
        });

        // open serial connection
        this.serialPort.open();

    }

    async close() {
        try {
            await this.serialPort.close();
        } catch(e) {
            console.log("failed to close serial port, ignoring...", e);
        }
    }

    /* override */ async write(bytes) {
        this.serialPort.write(bytes);
    }

}

export default NodeJSSerialConnection;
