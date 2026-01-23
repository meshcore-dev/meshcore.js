import Constants from "../constants.js";
import Connection from "./connection.js";

class WebBleConnection extends Connection {

    constructor(bleDevice) {
        super();
        this.bleDevice = bleDevice;
        this.gattServer = null;
        this.rxCharacteristic = null;
        this.txCharacteristic = null;
        this.init();
    }

    static async open() {

        // ensure browser supports web bluetooth
        if(!navigator.bluetooth){
            alert("Web Bluetooth is not supported in this browser");
            return;
        }

        // ask user to select device
        const device = await navigator.bluetooth.requestDevice({
            filters: [
                {
                    services: [
                        Constants.Ble.ServiceUuid.toLowerCase(),
                    ],
                },
            ],
        });

        // make sure user selected a device
        if(!device){
            return null;
        }

        return new WebBleConnection(device);

    }

    async init() {

        // listen for ble disconnect
        this.bleDevice.addEventListener("gattserverdisconnected", () => {
            this.onDisconnected();
        });

        // connect to gatt server
        this.gattServer = await this.bleDevice.gatt.connect();

        // find service
        const service = await this.gattServer.getPrimaryService(Constants.Ble.ServiceUuid.toLowerCase());
        const characteristics = await service.getCharacteristics();

        // find rx characteristic (we write to this one, it's where the radio reads from)
        this.rxCharacteristic = characteristics.find((characteristic) => {
            return characteristic.uuid.toLowerCase() === Constants.Ble.CharacteristicUuidRx.toLowerCase();
        });

        // find tx characteristic (we read this one, it's where the radio writes to)
        this.txCharacteristic = characteristics.find((characteristic) => {
            return characteristic.uuid.toLowerCase() === Constants.Ble.CharacteristicUuidTx.toLowerCase();
        });

        // listen for frames from transmitted to us from the ble device
        await this.txCharacteristic.startNotifications();
        this.txCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
            const frame = new Uint8Array(event.target.value.buffer);
            this.onFrameReceived(frame);
        });

        // fire connected event
        await this.onConnected();

    }

    async close() {
        try {
            this.gattServer?.disconnect();
            this.gattServer = null;
        } catch(e) {
            // ignore error when disconnecting
        }
    }

    async write(bytes) {
        try {
            // fixme: NetworkError: GATT operation already in progress.
            // todo: implement mutex to prevent multiple writes when another write is in progress
            // we write to the rx characteristic, as that's where the radio reads from
            await this.rxCharacteristic.writeValue(bytes);
        } catch(e) {
            console.log("failed to write to ble device", e);
        }
    }

    async sendToRadioFrame(frame) {
        this.emit("tx", frame);
        await this.write(frame);
    }

}

export default WebBleConnection;
