import SerialConnection from "./serial_connection.js";

class NodeJSSerialConnection extends SerialConnection {

    /**
     * @param path serial port to connect to, e.g: "/dev/ttyACM0" or "/dev/cu.usbmodem14401"
     * @param bootDelayMs ms to wait after the port opens before handshaking. Set to
     *        ~2500 for boards that reset on connect (DTR -> RST, e.g. Wio-E5/STM32WL
     *        devboards). Default 0 preserves the original behaviour.
     */
    constructor(path, bootDelayMs = 0) {
        super();
        this.serialPortPath = path;
        this.bootDelayMs = bootDelayMs;
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

            // De-assert DTR/RTS. On boards that wire DTR -> RST (via a cap), opening
            // the port asserts DTR and resets the MCU; hold a steady de-asserted state
            // to avoid further spurious resets. Harmless on native-USB boards.
            try {
                this.serialPort.set({ dtr: false, rts: false });
            } catch(e) {
                // set() unsupported / failed; ignore
            }

            // Wait for the device to finish booting before handshaking. The MCU was
            // reset by the DTR assertion on open; the original immediate onConnected()
            // raced that boot (~1.2-1.9 s measured on a Wio-E5) and the handshake was
            // lost -> connection timeout. Default bootDelayMs 0 = original behaviour.
            if(this.bootDelayMs > 0){
                await new Promise((resolve) => setTimeout(resolve, this.bootDelayMs));
            }

            await this.onConnected();

        });

        this.serialPort.on("close", () => {
            this.onDisconnected();
        });

        this.serialPort.on("error", function(err) {
            console.log("SerialPort Error: ", err.message)
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
