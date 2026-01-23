import SerialConnection from "./serial_connection.js";

class WebSerialConnection extends SerialConnection {

    constructor(serialPort) {

        super();

        this.serialPort = serialPort;
        this.reader = serialPort.readable.getReader();
        this.writable = serialPort.writable;
        this.readLoop();

        // listen for disconnect
        this.serialPort.addEventListener("disconnect", () => {
            this.onDisconnected();
        });

        // wait to fire connected event after the caller has a chance to set up handlers
        // by calling setTimeout(..., 0), we wait for the next tick of the JavaScript event
        // loop.
        setTimeout(async () => {
            await this.onConnected();
        }, 0);

    }

    static async open() {

        // ensure browser supports web serial
        if(!navigator.serial){
            alert("Web Serial is not supported in this browser");
            return null;
        }

        // ask user to select device
        const serialPort = await navigator.serial.requestPort({
            filters: [],
        });

        // open port
        await serialPort.open({
            baudRate: 115200,
        });

        return new WebSerialConnection(serialPort);

    }

    async close() {

        // release reader lock
        try {
            this.reader.releaseLock();
        } catch(e) {
            // console.log("failed to release lock on serial port readable, ignoring...", e);
        }

        // close serial port
        try {
            await this.serialPort.close();
        } catch(e) {
            // console.log("failed to close serial port, ignoring...", e);
        }

    }

    /* override */ async write(bytes) {
        const writer = this.writable.getWriter();
        try {
            await writer.write(new Uint8Array(bytes));
        } finally {
            writer.releaseLock();
        }
    }

    async readLoop() {
        try {
            while(true){

                // read bytes until reader indicates it's done
                const { value, done } = await this.reader.read();
                if(done){
                    break;
                }

                // pass to super class handler
                await this.onDataReceived(value);

            }
        } catch(error) {

            // ignore error if reader was released
            if(error instanceof TypeError){
                return;
            }

            console.error('Error reading from serial port: ', error);

        } finally {
            this.reader.releaseLock();
        }
    }

}

export default WebSerialConnection;
