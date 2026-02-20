import SerialConnection from "./serial_connection.js";

declare global {
    interface Navigator {
        serial: any;
    }
}

class WebSerialConnection extends SerialConnection {

    serialPort: any;
    reader: any;
    writable: any;

    constructor(serialPort: any) {

        super();

        this.serialPort = serialPort;
        this.reader = serialPort.readable.getReader();
        this.writable = serialPort.writable;
        this.readLoop();

        // listen for disconnect
        this.serialPort.addEventListener("disconnect", () => {
            this.onDisconnected();
        });

        // fire connected callback after constructor has returned
        setTimeout(async () => {
            await this.onConnected();
        }, 0);

    }

    static async open(): Promise<WebSerialConnection | null> {

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

    async close(): Promise<void> {

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

    /* override */ async write(bytes: Uint8Array): Promise<void> {
        const writer = this.writable.getWriter();
        try {
            await writer.write(new Uint8Array(bytes));
        } finally {
            writer.releaseLock();
        }
    }

    async readLoop(): Promise<void> {
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
