import SerialConnection from "./serial_connection.js";

class WebSerialConnection extends SerialConnection {

    constructor(serialPort, bootDelayMs = 0) {

        super();

        this.serialPort = serialPort;
        this.reader = serialPort.readable.getReader();
        this.writable = serialPort.writable;
        this.readLoop();

        // listen for disconnect
        this.serialPort.addEventListener("disconnect", () => {
            this.onDisconnected();
        });

        // fire connected callback after constructor has returned.
        //
        // bootDelayMs lets boards that reset on connect finish booting before we
        // send the handshake. Some boards (e.g. STM32WL / Seeed Wio-E5 devboards)
        // wire DTR -> RST through a cap, so opening the port asserts DTR and resets
        // the MCU. The original setTimeout(0) raced that boot -> handshake (deviceQuery)
        // was sent into a rebooting MCU -> never answered -> connection timeout.
        // Measured boot-to-ready on a Wio-E5 repeater: ~1.2-1.9 s, so ~2.5 s is safe.
        // Default 0 preserves the original behaviour for native-USB boards.
        setTimeout(async () => {
            await this.onConnected();
        }, bootDelayMs);

    }

    static async open(options = {}) {

        const baudRate = options.baudRate ?? 115200;
        const bootDelayMs = options.bootDelayMs ?? 0; // set to ~2500 for DTR-reset boards (Wio-E5)

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
            baudRate: baudRate,
        });

        // De-assert DTR/RTS after opening.
        //
        // Chrome's Web Serial asserts DTR on open(); on boards that wire DTR -> RST
        // (via a cap) that pulses a reset. We can't suppress the open-time assertion
        // (the API gives no pre-open signal control), but holding a steady de-asserted
        // state afterwards avoids further spurious resets mid-session. This is harmless
        // on native-USB boards (no reset wire). setSignals may be unsupported on some
        // platforms, so failures are ignored.
        try {
            await serialPort.setSignals({ dataTerminalReady: false, requestToSend: false });
        } catch(e) {
            // setSignals unsupported / failed; ignore
        }

        return new WebSerialConnection(serialPort, bootDelayMs);

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
