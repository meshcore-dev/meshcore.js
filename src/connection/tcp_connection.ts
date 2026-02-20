import BufferWriter from "../buffer_writer.js";
import BufferReader from "../buffer_reader.js";
import Constants from "../constants.js";
import Connection from "./connection.js";

class TCPConnection extends Connection {

    host: string;
    port: number;
    readBuffer: number[];
    socket: any;

    constructor(host: string, port: number) {
        super();
        this.host = host;
        this.port = port;
        this.readBuffer = [];
    }

    async connect(): Promise<void> {

        // note: net module is only available in NodeJS, you shouldn't use TCPConnection from a web browser
        const { Socket } = await import("net");

        // create new socket
        this.socket = new Socket();

        // handle received data
        this.socket.on('data', (data: Buffer) => {
            this.onSocketDataReceived(data);
        });

        // handle errors
        this.socket.on('error', (error: Error) => {
            console.error('Connection Error', error);
        });

        // handle socket close
        this.socket.on('close', (error: boolean) => {
            this.onDisconnected();
        });

        // connect to server
        this.socket.connect(this.port, this.host, async () => {
            await this.onConnected();
        });

    }

    onSocketDataReceived(data: Buffer): void {

        // append received bytes to read buffer
        this.readBuffer = [
            ...this.readBuffer,
            ...data,
        ];

        // process read buffer while there is enough bytes for a frame header
        // 3 bytes frame header = (1 byte frame type) + (2 bytes frame length as unsigned 16-bit little endian)
        const frameHeaderLength = 3;
        while(this.readBuffer.length >= frameHeaderLength){
            try {

                // extract frame header
                const frameHeader = new BufferReader(this.readBuffer.slice(0, frameHeaderLength));

                // ensure frame type supported
                const frameType = frameHeader.readByte();
                if(frameType !== Constants.SerialFrameTypes.Incoming && frameType !== Constants.SerialFrameTypes.Outgoing){
                    // unexpected byte, lets skip it and try again
                    this.readBuffer = this.readBuffer.slice(1);
                    continue;
                }

                // ensure frame length valid
                const frameLength = frameHeader.readUInt16LE();
                if(!frameLength){
                    // unexpected byte, lets skip it and try again
                    this.readBuffer = this.readBuffer.slice(1);
                    continue;
                }

                // check if we have received enough bytes for this frame, otherwise wait until more bytes received
                const requiredLength = frameHeaderLength + frameLength;
                if(this.readBuffer.length < requiredLength){
                    break;
                }

                // get frame data, and remove it and its frame header from the read buffer
                const frameData = this.readBuffer.slice(frameHeaderLength, requiredLength);
                this.readBuffer = this.readBuffer.slice(requiredLength);

                // handle received frame
                this.onFrameReceived(new Uint8Array(frameData));

            } catch(e) {
                console.error("Failed to process frame", e);
                break;
            }
        }

    }

    async close(): Promise<void> {
        try {
            this.socket.destroy();
        } catch(e) {
            // console.log("failed to release lock on serial port readable, ignoring...", e);
        }
    }

    async write(bytes: Uint8Array): Promise<void> {
        this.socket.write(new Uint8Array(bytes));
    }

    async writeFrame(frameType: number, frameData: Uint8Array): Promise<void> {

        // create frame
        const frame = new BufferWriter();

        // add frame header
        frame.writeByte(frameType);
        frame.writeUInt16LE(frameData.length);

        // add frame data
        frame.writeBytes(frameData);

        // write frame to device
        await this.write(frame.toBytes());

    }

    async sendToRadioFrame(data: Uint8Array): Promise<void> {
        // write "app to radio" frame 0x3c "<"
        this.emit("tx", data);
        await this.writeFrame(0x3c, data);
    }

}

export default TCPConnection;
