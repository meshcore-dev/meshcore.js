import BufferWriter from "../buffer_writer.js";
import BufferReader from "../buffer_reader.js";
import Constants from "../constants.js";
import EventEmitter from "../events.js";
import BufferUtils from "../buffer_utils.js";
import Packet from "../packet.js";
import RandomUtils from "../random_utils.js";

class Connection extends EventEmitter {

    async onConnected() {

        // tell device what protocol version we support
        try {
            await this.deviceQuery(Constants.SupportedCompanionProtocolVersion);
        } catch(e) {
            // ignore
        }

        // tell clients we are connected
        this.emit("connected");

    }

    onDisconnected() {
        this.emit("disconnected");
    }

    async close() {
        throw new Error("This method must be implemented by the subclass.");
    }

    async sendToRadioFrame(data) {
        throw new Error("This method must be implemented by the subclass.");
    }

    async sendCommandAppStart() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.AppStart);
        data.writeByte(1); // appVer
        data.writeBytes(new Uint8Array(6)); // reserved
        data.writeString("test client"); // appName
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendTxtMsg(txtType, attempt, senderTimestamp, pubKeyPrefix, text) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendTxtMsg);
        data.writeByte(txtType);
        data.writeByte(attempt);
        data.writeUInt32LE(senderTimestamp);
        data.writeBytes(pubKeyPrefix.slice(0, 6)); // only the first 6 bytes of pubKey are sent
        data.writeString(text);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendChannelTxtMsg(txtType, channelIdx, senderTimestamp, text) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendChannelTxtMsg);
        data.writeByte(txtType);
        data.writeByte(channelIdx);
        data.writeUInt32LE(senderTimestamp);
        data.writeString(text);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandGetContacts(since) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.GetContacts);
        if(since){
            data.writeUInt32LE(since);
        }
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandGetDeviceTime() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.GetDeviceTime);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetDeviceTime(epochSecs) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetDeviceTime);
        data.writeUInt32LE(epochSecs);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendSelfAdvert(type) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendSelfAdvert);
        data.writeByte(type);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetAdvertName(name) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetAdvertName);
        data.writeString(name);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandAddUpdateContact(publicKey, type, flags, outPathLen, outPath, advName, lastAdvert, advLat, advLon) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.AddUpdateContact);
        data.writeBytes(publicKey);
        data.writeByte(type);
        data.writeByte(flags);
        data.writeByte(outPathLen); // todo writeInt8
        data.writeBytes(outPath); // 64 bytes
        data.writeCString(advName, 32); // 32 bytes
        data.writeUInt32LE(lastAdvert);
        data.writeUInt32LE(advLat);
        data.writeUInt32LE(advLon);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSyncNextMessage() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SyncNextMessage);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetRadioParams(radioFreq, radioBw, radioSf, radioCr) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetRadioParams);
        data.writeUInt32LE(radioFreq);
        data.writeUInt32LE(radioBw);
        data.writeByte(radioSf);
        data.writeByte(radioCr);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetTxPower(txPower) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetTxPower);
        data.writeByte(txPower);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandResetPath(pubKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ResetPath);
        data.writeBytes(pubKey); // 32 bytes
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetAdvertLatLon(lat, lon) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetAdvertLatLon);
        data.writeInt32LE(lat);
        data.writeInt32LE(lon);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandRemoveContact(pubKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.RemoveContact);
        data.writeBytes(pubKey); // 32 bytes
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandShareContact(pubKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ShareContact);
        data.writeBytes(pubKey); // 32 bytes
        await this.sendToRadioFrame(data.toBytes());
    }

    // provide a public key to export that contact
    // not providing a public key will export local identity as a contact instead
    async sendCommandExportContact(pubKey = null) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ExportContact);
        if(pubKey){
            data.writeBytes(pubKey); // 32 bytes
        }
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandImportContact(advertPacketBytes) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ImportContact);
        data.writeBytes(advertPacketBytes); // raw advert packet bytes
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandReboot() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.Reboot);
        data.writeString("reboot");
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandGetBatteryVoltage() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.GetBatteryVoltage);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandDeviceQuery(appTargetVer) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.DeviceQuery);
        data.writeByte(appTargetVer); // e.g: 1
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandExportPrivateKey() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ExportPrivateKey);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandImportPrivateKey(privateKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ImportPrivateKey);
        data.writeBytes(privateKey);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendRawData(path, rawData) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendRawData);
        data.writeByte(path.length);
        data.writeBytes(path);
        data.writeBytes(rawData);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendLogin(publicKey, password) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendLogin);
        data.writeBytes(publicKey); // 32 bytes - id of repeater or room server
        data.writeString(password); // password is remainder of frame, max 15 characters
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendStatusReq(publicKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendStatusReq);
        data.writeBytes(publicKey); // 32 bytes - id of repeater or room server
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendTelemetryReq(publicKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendTelemetryReq);
        data.writeByte(0); // reserved
        data.writeByte(0); // reserved
        data.writeByte(0); // reserved
        data.writeBytes(publicKey); // 32 bytes - id of destination node
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendBinaryReq(publicKey, requestCodeAndParams) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendBinaryReq);
        data.writeBytes(publicKey); // 32 bytes - public key of contact to send request to
        data.writeBytes(requestCodeAndParams);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandGetChannel(channelIdx) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.GetChannel);
        data.writeByte(channelIdx);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetChannel(channelIdx, name, secret) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetChannel);
        data.writeByte(channelIdx);
        data.writeCString(name, 32);
        data.writeBytes(secret);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSignStart() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SignStart);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSignData(dataToSign) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SignData);
        data.writeBytes(dataToSign);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSignFinish() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SignFinish);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendTracePath(tag, auth, path) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendTracePath);
        data.writeUInt32LE(tag);
        data.writeUInt32LE(auth);
        data.writeByte(0); // flags
        data.writeBytes(path);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetOtherParams(manualAddContacts) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetOtherParams);
        data.writeByte(manualAddContacts); // 0 or 1
        await this.sendToRadioFrame(data.toBytes());
    }

    onFrameReceived(frame) {

        // emit received frame
        this.emit("rx", frame);

        const bufferReader = new BufferReader(frame);
        const responseCode = bufferReader.readByte();

        if(responseCode === Constants.ResponseCodes.Ok){
            this.onOkResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Err){
            this.onErrResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.SelfInfo){
            this.onSelfInfoResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.CurrTime){
            this.onCurrTimeResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.NoMoreMessages){
            this.onNoMoreMessagesResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ContactMsgRecv){
            this.onContactMsgRecvResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ChannelMsgRecv){
            this.onChannelMsgRecvResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ContactMsgRecv3){
            this.onContactMsgRecvResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ChannelMsgRecv3){
            this.onChannelMsgRecvResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ContactsStart){
            this.onContactsStartResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Contact){
            this.onContactResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.EndOfContacts){
            this.onEndOfContactsResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Sent){
            this.onSentResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ExportContact){
            this.onExportContactResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.BatteryVoltage){
            this.onBatteryVoltageResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.DeviceInfo){
            this.onDeviceInfoResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.PrivateKey){
            this.onPrivateKeyResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Disabled){
            this.onDisabledResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ChannelInfo){
            this.onChannelInfoResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.SignStart){
            this.onSignStartResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Signature){
            this.onSignatureResponse(bufferReader);
        } else if(responseCode === Constants.PushCodes.Advert){
            this.onAdvertPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.PathUpdated){
            this.onPathUpdatedPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.SendConfirmed){
            this.onSendConfirmedPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.MsgWaiting){
            this.onMsgWaitingPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.RawData){
            this.onRawDataPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.LoginSuccess){
            this.onLoginSuccessPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.StatusResponse){
            this.onStatusResponsePush(bufferReader);
        } else if(responseCode === Constants.PushCodes.LogRxData){
            this.onLogRxDataPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.TelemetryResponse){
            this.onTelemetryResponsePush(bufferReader);
        } else if(responseCode === Constants.PushCodes.TraceData){
            this.onTraceDataPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.NewAdvert){
            this.onNewAdvertPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.BinaryResponse){
            this.onBinaryResponsePush(bufferReader);
        } else {
            console.log(`unhandled frame: code=${responseCode}`, frame);
        }

    }

    onAdvertPush(bufferReader) {
        this.emit(Constants.PushCodes.Advert, {
            publicKey: bufferReader.readBytes(32),
        });
    }

    onPathUpdatedPush(bufferReader) {
        this.emit(Constants.PushCodes.PathUpdated, {
            publicKey: bufferReader.readBytes(32),
        });
    }

    onSendConfirmedPush(bufferReader) {
        this.emit(Constants.PushCodes.SendConfirmed, {
            ackCode: bufferReader.readUInt32LE(),
            roundTrip: bufferReader.readUInt32LE(),
        });
    }

    onMsgWaitingPush(bufferReader) {
        this.emit(Constants.PushCodes.MsgWaiting, {

        });
    }

    onRawDataPush(bufferReader) {
        this.emit(Constants.PushCodes.RawData, {
            lastSnr: bufferReader.readInt8() / 4,
            lastRssi: bufferReader.readInt8(),
            reserved: bufferReader.readByte(),
            payload: bufferReader.readRemainingBytes(),
        });
    }

    onLoginSuccessPush(bufferReader) {
        this.emit(Constants.PushCodes.LoginSuccess, {
            reserved: bufferReader.readByte(), // reserved
            pubKeyPrefix: bufferReader.readBytes(6), // 6 bytes of public key this login success is from
        });
    }

    onStatusResponsePush(bufferReader) {
        this.emit(Constants.PushCodes.StatusResponse, {
            reserved: bufferReader.readByte(), // reserved
            pubKeyPrefix: bufferReader.readBytes(6), // 6 bytes of public key this status response is from
            statusData: bufferReader.readRemainingBytes(),
        });
    }

    onLogRxDataPush(bufferReader) {
        this.emit(Constants.PushCodes.LogRxData, {
            lastSnr: bufferReader.readInt8() / 4,
            lastRssi: bufferReader.readInt8(),
            raw: bufferReader.readRemainingBytes(),
        });
    }

    onTelemetryResponsePush(bufferReader) {
        this.emit(Constants.PushCodes.TelemetryResponse, {
            reserved: bufferReader.readByte(), // reserved
            pubKeyPrefix: bufferReader.readBytes(6), // 6 bytes of public key this telemetry response is from
            lppSensorData: bufferReader.readRemainingBytes(),
        });
    }

    onBinaryResponsePush(bufferReader) {
        this.emit(Constants.PushCodes.BinaryResponse, {
            reserved: bufferReader.readByte(), // reserved
            tag: bufferReader.readUInt32LE(), // 4 bytes tag
            responseData: bufferReader.readRemainingBytes(),
        });
    }

    onTraceDataPush(bufferReader) {
        const reserved = bufferReader.readByte();
        const pathLen = bufferReader.readUInt8();
        this.emit(Constants.PushCodes.TraceData, {
            reserved: reserved,
            pathLen: pathLen,
            flags: bufferReader.readUInt8(),
            tag: bufferReader.readUInt32LE(),
            authCode: bufferReader.readUInt32LE(),
            pathHashes: bufferReader.readBytes(pathLen),
            pathSnrs: bufferReader.readBytes(pathLen),
            lastSnr: bufferReader.readInt8() / 4,
        });
    }

    onNewAdvertPush(bufferReader) {
        this.emit(Constants.PushCodes.NewAdvert, {
            publicKey: bufferReader.readBytes(32),
            type: bufferReader.readByte(),
            flags: bufferReader.readByte(),
            outPathLen: bufferReader.readInt8(),
            outPath: bufferReader.readBytes(64),
            advName: bufferReader.readCString(32),
            lastAdvert: bufferReader.readUInt32LE(),
            advLat: bufferReader.readUInt32LE(),
            advLon: bufferReader.readUInt32LE(),
            lastMod: bufferReader.readUInt32LE(),
        });
    }

    onOkResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.Ok, {

        });
    }

    onErrResponse(bufferReader) {
        const errCode = bufferReader.getRemainingBytesCount() > 0 ? bufferReader.readByte() : null;
        this.emit(Constants.ResponseCodes.Err, {
            errCode: errCode,
        });
    }

    onContactsStartResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.ContactsStart, {
            count: bufferReader.readUInt32LE(),
        });
    }

    onContactResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.Contact, {
            publicKey: bufferReader.readBytes(32),
            type: bufferReader.readByte(),
            flags: bufferReader.readByte(),
            outPathLen: bufferReader.readInt8(),
            outPath: bufferReader.readBytes(64),
            advName: bufferReader.readCString(32),
            lastAdvert: bufferReader.readUInt32LE(),
            advLat: bufferReader.readUInt32LE(),
            advLon: bufferReader.readUInt32LE(),
            lastMod: bufferReader.readUInt32LE(),
        });
    }

    onEndOfContactsResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.EndOfContacts, {
            mostRecentLastmod: bufferReader.readUInt32LE(),
        });
    }

    onSentResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.Sent, {
            result: bufferReader.readInt8(),
            expectedAckCrc: bufferReader.readUInt32LE(),
            estTimeout: bufferReader.readUInt32LE(),
        });
    }

    onExportContactResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.ExportContact, {
            advertPacketBytes: bufferReader.readRemainingBytes(),
        });
    }

    onBatteryVoltageResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.BatteryVoltage, {
            batteryMilliVolts: bufferReader.readUInt16LE(),
        });
    }

    onDeviceInfoResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.DeviceInfo, {
            firmwareVer: bufferReader.readInt8(),
            reserved: bufferReader.readBytes(6), // reserved
            firmware_build_date: bufferReader.readCString(12), // eg. "19 Feb 2025"
            manufacturerModel: bufferReader.readString(), // remainder of frame
        });
    }

    onPrivateKeyResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.PrivateKey, {
            privateKey: bufferReader.readBytes(64),
        });
    }

    onDisabledResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.Disabled, {

        });
    }

    onChannelInfoResponse(bufferReader) {

        const idx = bufferReader.readUInt8();
        const name = bufferReader.readCString(32);
        const remainingBytesLength = bufferReader.getRemainingBytesCount();

        // 128-bit keys
        if(remainingBytesLength === 16){
            this.emit(Constants.ResponseCodes.ChannelInfo, {
                channelIdx: idx,
                name: name,
                secret: bufferReader.readBytes(remainingBytesLength),
            });
        } else {
            console.log(`ChannelInfo has unexpected key length: ${remainingBytesLength}`);
        }

    }

    onSignStartResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.SignStart, {
            reserved: bufferReader.readByte(),
            maxSignDataLen: bufferReader.readUInt32LE(),
        });
    }

    onSignatureResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.Signature, {
            signature: bufferReader.readBytes(64),
        });
    }

    onSelfInfoResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.SelfInfo, {
            type: bufferReader.readByte(),
            txPower: bufferReader.readByte(),
            maxTxPower: bufferReader.readByte(),
            publicKey: bufferReader.readBytes(32),
            advLat: bufferReader.readInt32LE(),
            advLon: bufferReader.readInt32LE(),
            reserved: bufferReader.readBytes(3),
            manualAddContacts: bufferReader.readByte(),
            radioFreq: bufferReader.readUInt32LE(),
            radioBw: bufferReader.readUInt32LE(),
            radioSf: bufferReader.readByte(),
            radioCr: bufferReader.readByte(),
            name: bufferReader.readString(),
        });
    }

    onCurrTimeResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.CurrTime, {
            epochSecs: bufferReader.readUInt32LE(),
        });
    }

    onNoMoreMessagesResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.NoMoreMessages, {

        });
    }

    onContactMsgRecvResponse(bufferReader) {

        if (Constants.SupportedCompanionProtocolVersion >= 3) {
          this.emit(Constants.ResponseCodes.ContactMsgRecv3, {
            snr: bufferReader.readByte() / 4.0,
            reserved1: bufferReader.readByte(),
            reserved2: bufferReader.readByte(),
            pubKeyPrefix: bufferReader.readBytes(6),
            pathLen: bufferReader.readByte(),
            txtType: bufferReader.readByte(),
            senderTimestamp: bufferReader.readUInt32LE(),
            text: bufferReader.readString(),
          });
        } else {
          this.emit(Constants.ResponseCodes.ContactMsgRecv, {
            pubKeyPrefix: bufferReader.readBytes(6),
            pathLen: bufferReader.readByte(),
            txtType: bufferReader.readByte(),
            senderTimestamp: bufferReader.readUInt32LE(),
            text: bufferReader.readString(),
          });
        }        
    }

    onChannelMsgRecvResponse(bufferReader) {
        if (Constants.SupportedCompanionProtocolVersion >= 3) {
            this.emit(Constants.ResponseCodes.ChannelMsgRecv3, {
                snr: bufferReader.readByte() / 4.0,
                reserved1: bufferReader.readByte(),
                reserved2: bufferReader.readByte(),
                channelIdx: bufferReader.readInt8(), // reserved (0 for now, ie. 'public')
                pathLen: bufferReader.readByte(), // 0xFF if was sent direct, otherwise hop count for flood-mode
                txtType: bufferReader.readByte(),
                senderTimestamp: bufferReader.readUInt32LE(),
                text: bufferReader.readString(),
            });
        } else {
            this.emit(Constants.ResponseCodes.ChannelMsgRecv, {
              channelIdx: bufferReader.readInt8(), // reserved (0 for now, ie. 'public')
              pathLen: bufferReader.readByte(), // 0xFF if was sent direct, otherwise hop count for flood-mode
              txtType: bufferReader.readByte(),
              senderTimestamp: bufferReader.readUInt32LE(),
              text: bufferReader.readString(),
            });
        }
    }

    getSelfInfo(timeoutMillis = null) {
        return new Promise(async (resolve, reject) => {

            // listen for response
            this.once(Constants.ResponseCodes.SelfInfo, (selfInfo) => {
                resolve(selfInfo);
            });

            // timeout after provided milliseconds if device did not respond
            if(timeoutMillis != null){
                setTimeout(reject, timeoutMillis);
            }

            // request self info
            await this.sendCommandAppStart();

        });
    }

    async sendAdvert(type) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // send advert
                await this.sendCommandSendSelfAdvert(type);

            } catch(e) {
                reject(e);
            }
        });
    }

    async sendFloodAdvert() {
        return await this.sendAdvert(Constants.SelfAdvertTypes.Flood);
    }

    async sendZeroHopAdvert() {
        return await this.sendAdvert(Constants.SelfAdvertTypes.ZeroHop);
    }

    setAdvertName(name) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set advert name
                await this.sendCommandSetAdvertName(name);

            } catch(e) {
                reject(e);
            }
        });
    }

    setAdvertLatLong(latitude, longitude) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set advert lat lon
                await this.sendCommandSetAdvertLatLon(latitude, longitude);

            } catch(e) {
                reject(e);
            }
        });
    }

    setTxPower(txPower) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set tx power
                await this.sendCommandSetTxPower(txPower);

            } catch(e) {
                reject(e);
            }
        });
    }

    setRadioParams(radioFreq, radioBw, radioSf, radioCr) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set tx power
                await this.sendCommandSetRadioParams(radioFreq, radioBw, radioSf, radioCr);

            } catch(e) {
                reject(e);
            }
        });
    }

    getContacts() {
        return new Promise(async (resolve, reject) => {

            // add contacts we receive to a list
            const contacts = [];
            const onContactReceived = (contact) => {
                contacts.push(contact);
            }

            // listen for contacts
            this.on(Constants.ResponseCodes.Contact, onContactReceived);

            // there's no more contacts to receive, stop listening and resolve the promise
            this.once(Constants.ResponseCodes.EndOfContacts, () => {
                this.off(Constants.ResponseCodes.Contact, onContactReceived);
                resolve(contacts);
            });

            // request contacts from device
            await this.sendCommandGetContacts();

        });
    }

    async findContactByName(name) {

        // get contacts
        const contacts = await this.getContacts();

        // find first contact matching name exactly
        return contacts.find((contact) => {
            return contact.advName === name;
        });

    }

    async findContactByPublicKeyPrefix(pubKeyPrefix) {

        // get contacts
        const contacts = await this.getContacts();

        // find first contact matching pub key prefix
        return contacts.find((contact) => {
            const contactPubKeyPrefix = contact.publicKey.subarray(0, pubKeyPrefix.length);
            return BufferUtils.areBuffersEqual(pubKeyPrefix, contactPubKeyPrefix);
        });

    }

    sendTextMessage(contactPublicKey, text, type) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive sent response
                const onSent = (response) => {
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Sent, onSent);
                this.once(Constants.ResponseCodes.Err, onErr);

                // compose message
                const txtType = type ?? Constants.TxtTypes.Plain;
                const attempt = 0;
                const senderTimestamp = Math.floor(Date.now() / 1000);

                // send message
                await this.sendCommandSendTxtMsg(txtType, attempt, senderTimestamp, contactPublicKey, text);

            } catch(e) {
                reject(e);
            }
        });
    }

    sendChannelTextMessage(channelIdx, text) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // compose message
                const txtType = Constants.TxtTypes.Plain;
                const senderTimestamp = Math.floor(Date.now() / 1000);

                // send message
                await this.sendCommandSendChannelTxtMsg(txtType, channelIdx, senderTimestamp, text);

            } catch(e) {
                reject(e);
            }
        });
    }

    syncNextMessage() {
        return new Promise(async (resolve, reject) => {

            // resolve promise when we receive a contact message
            const onContactMessageReceived = (message) => {
                this.off(Constants.ResponseCodes.ContactMsgRecv, onContactMessageReceived);
                this.off(Constants.ResponseCodes.ChannelMsgRecv, onChannelMessageReceived);
                this.off(Constants.ResponseCodes.ContactMsgRecv3, onContactMessageReceived);
                this.off(Constants.ResponseCodes.ChannelMsgRecv3, onChannelMessageReceived);
                this.off(Constants.ResponseCodes.NoMoreMessages, onNoMoreMessagesReceived);
                resolve({
                    contactMessage: message,
                });
            }

            // resolve promise when we receive a channel message
            const onChannelMessageReceived = (message) => {
                this.off(Constants.ResponseCodes.ContactMsgRecv, onContactMessageReceived);
                this.off(Constants.ResponseCodes.ChannelMsgRecv, onChannelMessageReceived);
                this.off(Constants.ResponseCodes.ContactMsgRecv3, onContactMessageReceived);
                this.off(Constants.ResponseCodes.ChannelMsgRecv3, onChannelMessageReceived);
                this.off(Constants.ResponseCodes.NoMoreMessages, onNoMoreMessagesReceived);
                resolve({
                    channelMessage: message,
                });
            }

            // resolve promise when we have no more messages to receive
            const onNoMoreMessagesReceived = () => {
                this.off(Constants.ResponseCodes.ContactMsgRecv, onContactMessageReceived);
                this.off(Constants.ResponseCodes.ChannelMsgRecv, onChannelMessageReceived);
                this.off(Constants.ResponseCodes.ContactMsgRecv3, onContactMessageReceived);
                this.off(Constants.ResponseCodes.ChannelMsgRecv3, onChannelMessageReceived);
                this.off(Constants.ResponseCodes.NoMoreMessages, onNoMoreMessagesReceived);
                resolve(null);
            }

            // listen for events
            this.once(Constants.ResponseCodes.ContactMsgRecv, onContactMessageReceived);
            this.once(Constants.ResponseCodes.ChannelMsgRecv, onChannelMessageReceived);
            this.once(Constants.ResponseCodes.ContactMsgRecv3, onContactMessageReceived);
            this.once(Constants.ResponseCodes.ChannelMsgRecv3, onChannelMessageReceived);
            this.once(Constants.ResponseCodes.NoMoreMessages, onNoMoreMessagesReceived);

            // sync next message from device
            await this.sendCommandSyncNextMessage();

        });
    }

    async getWaitingMessages() {

        const waitingMessages = [];

        while(true){

            // get next message, otherwise stop if nothing is returned
            const message = await this.syncNextMessage();
            if(!message){
                break;
            }

            // add to waiting messages list
            waitingMessages.push(message);

        }

        return waitingMessages;

    }

    getDeviceTime() {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive sent response
                const onCurrTime = (response) => {
                    this.off(Constants.ResponseCodes.CurrTime, onCurrTime);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.CurrTime, onCurrTime);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.CurrTime, onCurrTime);
                this.once(Constants.ResponseCodes.Err, onErr);

                // get device time
                await this.sendCommandGetDeviceTime();

            } catch(e) {
                reject(e);
            }
        });
    }

    setDeviceTime(epochSecs) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = (response) => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set device time
                await this.sendCommandSetDeviceTime(epochSecs);

            } catch(e) {
                reject(e);
            }
        });
    }

    async syncDeviceTime() {
        await this.setDeviceTime(Math.floor(Date.now() / 1000));
    }

    importContact(advertPacketBytes) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = (response) => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // import contact
                await this.sendCommandImportContact(advertPacketBytes);

            } catch(e) {
                reject(e);
            }
        });
    }

    exportContact(pubKey = null) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive export contact response
                const onExportContact = (response) => {
                    this.off(Constants.ResponseCodes.ExportContact, onExportContact);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.ExportContact, onExportContact);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.ExportContact, onExportContact);
                this.once(Constants.ResponseCodes.Err, onErr);

                // export contact
                await this.sendCommandExportContact(pubKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    shareContact(pubKey) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = (response) => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // share contact
                await this.sendCommandShareContact(pubKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    removeContact(pubKey) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // remove contact
                await this.sendCommandRemoveContact(pubKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    addOrUpdateContact(publicKey, type, flags, outPathLen, outPath, advName, lastAdvert, advLat, advLon) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // add or update contact
                await this.sendCommandAddUpdateContact(publicKey, type, flags, outPathLen, outPath, advName, lastAdvert, advLat, advLon);

            } catch(e) {
                reject(e);
            }
        });
    }

    setContactPath(contact, path) {
        return new Promise(async (resolve, reject) => {
            try {

                // create empty out path
                const maxPathLength = 64;
                const outPath = new Uint8Array(maxPathLength);

                // fill out path with the provided path
                for(var i = 0; i < path.length && i < maxPathLength; i++){
                    outPath[i] = path[i];
                }

                // update contact details with new path and path length
                contact.outPathLen = path.length;
                contact.outPath = outPath;

                // update contact
                return await this.addOrUpdateContact(contact.publicKey, contact.type, contact.flags, contact.outPathLen, contact.outPath, contact.advName, contact.lastAdvert, contact.advLat, contact.advLon);

            } catch(e) {
                reject(e);
            }
        });
    }

    resetPath(pubKey) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // reset path
                await this.sendCommandResetPath(pubKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    reboot() {
        return new Promise(async (resolve, reject) => {
            try {

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // assume device rebooted after a short delay
                setTimeout(() => {
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }, 1000);

                // listen for events
                this.once(Constants.ResponseCodes.Err, onErr);

                // reboot
                await this.sendCommandReboot();

            } catch(e) {
                reject(e);
            }
        });
    }

    getBatteryVoltage() {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive battery voltage
                const onBatteryVoltage = (response) => {
                    this.off(Constants.ResponseCodes.BatteryVoltage, onBatteryVoltage);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.BatteryVoltage, onBatteryVoltage);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.BatteryVoltage, onBatteryVoltage);
                this.once(Constants.ResponseCodes.Err, onErr);

                // get battery voltage
                await this.sendCommandGetBatteryVoltage();

            } catch(e) {
                reject(e);
            }
        });
    }

    deviceQuery(appTargetVer) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive device info
                const onDeviceInfo = (response) => {
                    this.off(Constants.ResponseCodes.DeviceInfo, onDeviceInfo);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.DeviceInfo, onDeviceInfo);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.DeviceInfo, onDeviceInfo);
                this.once(Constants.ResponseCodes.Err, onErr);

                // query device
                await this.sendCommandDeviceQuery(appTargetVer);

            } catch(e) {
                reject(e);
            }
        });
    }

    exportPrivateKey() {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive private Key
                const onPrivateKey = (response) => {
                    this.off(Constants.ResponseCodes.PrivateKey, onPrivateKey);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.PrivateKey, onPrivateKey);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    reject();
                }

                // reject promise when we receive disabled
                const onDisabled = () => {
                    this.off(Constants.ResponseCodes.PrivateKey, onPrivateKey);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    reject("disabled");
                }

                // listen for events
                this.once(Constants.ResponseCodes.PrivateKey, onPrivateKey);
                this.once(Constants.ResponseCodes.Err, onErr);
                this.once(Constants.ResponseCodes.Disabled, onDisabled);

                // export private key
                await this.sendCommandExportPrivateKey();

            } catch(e) {
                reject(e);
            }
        });
    }

    importPrivateKey(privateKey) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = (response) => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    reject();
                }

                // reject promise when we receive disabled
                const onDisabled = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    reject("disabled");
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);
                this.once(Constants.ResponseCodes.Disabled, onDisabled);

                // import private key
                await this.sendCommandImportPrivateKey(privateKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    login(contactPublicKey, password, extraTimeoutMillis = 1000) {
        return new Promise(async (resolve, reject) => {
            try {

                // get public key prefix we expect in the login response
                const publicKeyPrefix = contactPublicKey.subarray(0, 6);

                // listen for sent response so we can get estimated timeout
                var timeoutHandler = null;
                const onSent = (response) => {

                    // remove error listener since we received sent response
                    this.off(Constants.ResponseCodes.Err, onErr);

                    // reject login request as timed out after estimated delay, plus a bit extra
                    const estTimeout = response.estTimeout + extraTimeoutMillis;
                    timeoutHandler = setTimeout(() => {
                        this.off(Constants.ResponseCodes.Err, onErr);
                        this.off(Constants.ResponseCodes.Sent, onSent);
                        this.off(Constants.PushCodes.LoginSuccess, onLoginSuccess);
                        reject("timeout");
                    }, estTimeout);

                }

                // resolve promise when we receive login success push code
                const onLoginSuccess = (response) => {

                    // make sure login success response is for this login request
                    if(!BufferUtils.areBuffersEqual(publicKeyPrefix, response.pubKeyPrefix)){
                        console.log("onLoginSuccess is not for this login request, ignoring...");
                        return;
                    }

                    // login successful
                    clearTimeout(timeoutHandler);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.LoginSuccess, onLoginSuccess);
                    resolve(response);

                }

                // reject promise when we receive err
                const onErr = () => {
                    clearTimeout(timeoutHandler);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.LoginSuccess, onLoginSuccess);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Err, onErr);
                this.once(Constants.ResponseCodes.Sent, onSent);
                this.once(Constants.PushCodes.LoginSuccess, onLoginSuccess);

                // login
                await this.sendCommandSendLogin(contactPublicKey, password);

            } catch(e) {
                reject(e);
            }
        });
    }

    getStatus(contactPublicKey, extraTimeoutMillis = 1000) {
        return new Promise(async (resolve, reject) => {
            try {

                // get public key prefix we expect in the status response
                const publicKeyPrefix = contactPublicKey.subarray(0, 6);

                // listen for sent response so we can get estimated timeout
                var timeoutHandler = null;
                const onSent = (response) => {

                    // remove error listener since we received sent response
                    this.off(Constants.ResponseCodes.Err, onErr);

                    // reject login request as timed out after estimated delay, plus a bit extra
                    const estTimeout = response.estTimeout + extraTimeoutMillis;
                    timeoutHandler = setTimeout(() => {
                        this.off(Constants.ResponseCodes.Err, onErr);
                        this.off(Constants.ResponseCodes.Sent, onSent);
                        this.off(Constants.PushCodes.StatusResponse, onStatusResponsePush);
                        reject("timeout");
                    }, estTimeout);

                }

                // resolve promise when we receive status response push code
                const onStatusResponsePush = (response) => {

                    // make sure login success response is for this login request
                    if(!BufferUtils.areBuffersEqual(publicKeyPrefix, response.pubKeyPrefix)){
                        console.log("onStatusResponsePush is not for this status request, ignoring...");
                        return;
                    }

                    // status request successful
                    clearTimeout(timeoutHandler);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.StatusResponse, onStatusResponsePush);

                    // parse repeater stats from status data
                    const bufferReader = new BufferReader(response.statusData);
                    const repeaterStats = {
                        batt_milli_volts: bufferReader.readUInt16LE(), // uint16_t batt_milli_volts;
                        curr_tx_queue_len: bufferReader.readUInt16LE(), // uint16_t curr_tx_queue_len;
                        noise_floor: bufferReader.readInt16LE(), // int16_t noise_floor;
                        last_rssi: bufferReader.readInt16LE(), // int16_t  last_rssi;
                        n_packets_recv: bufferReader.readUInt32LE(), // uint32_t n_packets_recv;
                        n_packets_sent: bufferReader.readUInt32LE(), // uint32_t n_packets_sent;
                        total_air_time_secs: bufferReader.readUInt32LE(), // uint32_t total_air_time_secs;
                        total_up_time_secs: bufferReader.readUInt32LE(), // uint32_t total_up_time_secs;
                        n_sent_flood: bufferReader.readUInt32LE(), // uint32_t n_sent_flood
                        n_sent_direct: bufferReader.readUInt32LE(), // uint32_t n_sent_direct
                        n_recv_flood: bufferReader.readUInt32LE(), // uint32_t n_recv_flood
                        n_recv_direct: bufferReader.readUInt32LE(), // uint32_t n_recv_direct
                        err_events: bufferReader.readUInt16LE(), // uint16_t err_events
                        last_snr: bufferReader.readInt16LE(), // int16_t last_snr
                        n_direct_dups: bufferReader.readUInt16LE(), // uint16_t n_direct_dups
                        n_flood_dups: bufferReader.readUInt16LE(), // uint16_t n_flood_dups
                    }

                    resolve(repeaterStats);

                }

                // reject promise when we receive err
                const onErr = () => {
                    clearTimeout(timeoutHandler);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.StatusResponse, onStatusResponsePush);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Err, onErr);
                this.once(Constants.ResponseCodes.Sent, onSent);
                this.once(Constants.PushCodes.StatusResponse, onStatusResponsePush);

                // request status
                await this.sendCommandSendStatusReq(contactPublicKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    getTelemetry(contactPublicKey, extraTimeoutMillis = 1000) {
        return new Promise(async (resolve, reject) => {
            try {

                // get public key prefix we expect in the telemetry response
                const publicKeyPrefix = contactPublicKey.subarray(0, 6);

                // listen for sent response so we can get estimated timeout
                var timeoutHandler = null;
                const onSent = (response) => {

                    // remove error listener since we received sent response
                    this.off(Constants.ResponseCodes.Err, onErr);

                    // reject as timed out after estimated delay, plus a bit extra
                    const estTimeout = response.estTimeout + extraTimeoutMillis;
                    timeoutHandler = setTimeout(() => {
                        this.off(Constants.ResponseCodes.Err, onErr);
                        this.off(Constants.ResponseCodes.Sent, onSent);
                        this.off(Constants.PushCodes.TelemetryResponse, onTelemetryResponsePush);
                        reject("timeout");
                    }, estTimeout);

                }

                // resolve promise when we receive telemetry response push code
                const onTelemetryResponsePush = (response) => {

                    // make sure telemetry response is for this telemetry request
                    if(!BufferUtils.areBuffersEqual(publicKeyPrefix, response.pubKeyPrefix)){
                        console.log("onTelemetryResponsePush is not for this telemetry request, ignoring...");
                        return;
                    }

                    // telemetry request successful
                    clearTimeout(timeoutHandler);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.TelemetryResponse, onTelemetryResponsePush);

                    resolve(response);

                }

                // reject promise when we receive err
                const onErr = () => {
                    clearTimeout(timeoutHandler);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.TelemetryResponse, onTelemetryResponsePush);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Err, onErr);
                this.once(Constants.ResponseCodes.Sent, onSent);
                this.once(Constants.PushCodes.TelemetryResponse, onTelemetryResponsePush);

                // request telemetry
                await this.sendCommandSendTelemetryReq(contactPublicKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    sendBinaryRequest(contactPublicKey, requestCodeAndParams, extraTimeoutMillis = 1000) {
        return new Promise(async (resolve, reject) => {
            try {

                // we need the tag for this request (provided in sent listener), so we can listen for the response
                var tag = null;

                // listen for sent response so we can get estimated timeout
                var timeoutHandler = null;
                const onSent = (response) => {

                    tag = response.expectedAckCrc;

                    // remove error listener since we received sent response
                    this.off(Constants.ResponseCodes.Err, onErr);

                    // reject as timed out after estimated delay, plus a bit extra
                    const estTimeout = response.estTimeout + extraTimeoutMillis;
                    timeoutHandler = setTimeout(() => {
                        this.off(Constants.ResponseCodes.Err, onErr);
                        this.off(Constants.ResponseCodes.Sent, onSent);
                        this.off(Constants.PushCodes.BinaryResponse, onBinaryResponsePush);
                        reject("timeout");
                    }, estTimeout);

                }

                // resolve promise when we receive binary response push code
                const onBinaryResponsePush = (response) => {

                    // make sure tag matches
                    if(tag !== response.tag){
                        console.log("onBinaryResponse is not for this request tag, ignoring...");
                        return;
                    }

                    // binary request successful
                    clearTimeout(timeoutHandler);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.BinaryResponse, onBinaryResponsePush);

                    resolve(response.responseData);

                }

                // reject promise when we receive err
                const onErr = () => {
                    clearTimeout(timeoutHandler);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.BinaryResponse, onBinaryResponsePush);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Err, onErr);
                this.once(Constants.ResponseCodes.Sent, onSent);
                this.once(Constants.PushCodes.BinaryResponse, onBinaryResponsePush);

                // send binary request
                await this.sendCommandSendBinaryReq(contactPublicKey, requestCodeAndParams);

            } catch(e) {
                reject(e);
            }
        });
    }

    // @deprecated migrate to using tracePath instead. pingRepeaterZeroHop will be removed in a future update
    pingRepeaterZeroHop(contactPublicKey, timeoutMillis) {
        return new Promise(async (resolve, reject) => {
            try {

                // create raw data using custom packet
                const bufferWriter = new BufferWriter();
                bufferWriter.writeUInt32LE(Date.now()); // timestamp millis so every ping is unique
                bufferWriter.writeBytes([0x70, 0x69, 0x6E, 0x67]); // "ping" as bytes
                bufferWriter.writeBytes(contactPublicKey.subarray(0, 2)); // 2 bytes from the repeaters public key, so we don't use another repeaters ping response
                const rawBytes = bufferWriter.toBytes();

                var startMillis = Date.now();

                // resolve promise when we receive expected response
                const onLogRxDataPush = (response) => {

                    // calculate round trip time
                    const endMillis = Date.now();
                    const durationMillis = endMillis - startMillis;

                    // parse packet from rx data, and make sure it's expected type
                    const packet = Packet.fromBytes(response.raw);
                    if(packet.payload_type !== Packet.PAYLOAD_TYPE_RAW_CUSTOM){
                        return;
                    }

                    // make sure the payload we sent, is the payload we received
                    if(!BufferUtils.areBuffersEqual(packet.payload, rawBytes)){
                        return;
                    }

                    // ping successful remove all listeners
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.PushCodes.LogRxData, onLogRxDataPush);

                    // send back results
                    resolve({
                        rtt: durationMillis,
                        snr: response.lastSnr,
                        rssi: response.lastRssi,
                    });

                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.PushCodes.LogRxData, onLogRxDataPush);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Err, onErr);
                this.on(Constants.PushCodes.LogRxData, onLogRxDataPush);

                // check if a timeout was provided
                if(timeoutMillis != null){
                    setTimeout(() => {

                        // stop listening for events
                        this.off(Constants.ResponseCodes.Err, onErr);
                        this.off(Constants.PushCodes.LogRxData, onLogRxDataPush);

                        // reject since it timed out
                        reject("timeout");

                    }, timeoutMillis);
                }

                // send raw data to repeater, for it to repeat zero hop
                await this.sendCommandSendRawData([
                    // we set the repeater we want to ping as the path
                    // it should repeat our packet, and we can listen for it
                    contactPublicKey.subarray(0, 1),
                ], rawBytes);

            } catch(e) {
                reject(e);
            }
        });
    }

    getChannel(channelIdx) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive channel info response
                const onChannelInfoResponse = (response) => {
                    this.off(Constants.ResponseCodes.ChannelInfo, onChannelInfoResponse);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.ChannelInfo, onChannelInfoResponse);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.ChannelInfo, onChannelInfoResponse);
                this.once(Constants.ResponseCodes.Err, onErr);

                // get channel
                await this.sendCommandGetChannel(channelIdx);

            } catch(e) {
                reject(e);
            }
        });
    }

    setChannel(channelIdx, name, secret) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set channel
                await this.sendCommandSetChannel(channelIdx, name, secret);

            } catch(e) {
                reject(e);
            }
        });
    }

    async deleteChannel(channelIdx) {
        return await this.setChannel(channelIdx, "", new Uint8Array(16));
    }

    getChannels() {
        return new Promise(async (resolve, reject) => {

            // get channels until we get an error
            var channelIdx = 0;
            const channels = [];
            while(true){

                // try to get next channel
                try {
                    const channel = await this.getChannel(channelIdx);
                    channels.push(channel);
                } catch(e){
                    break;
                }

                channelIdx++;

            }

            return resolve(channels);

        });
    }

    async findChannelByName(name) {

        // get channels
        const channels = await this.getChannels();

        // find first channel matching name exactly
        return channels.find((channel) => {
            return channel.name === name;
        });

    }

    async findChannelBySecret(secret) {

        // get channels
        const channels = await this.getChannels();

        // find first channel matching secret
        return channels.find((channel) => {
            return BufferUtils.areBuffersEqual(secret, channel.secret);
        });

    }

    async sign(data) {
        return new Promise(async (resolve, reject) => {
            try {

                const chunkSize = 128;
                const bufferReader = new BufferReader(data);

                const sendNextChunk = async () =>  {

                    // get next chunk
                    var chunk;
                    if(bufferReader.getRemainingBytesCount() >= chunkSize){
                        chunk = bufferReader.readBytes(chunkSize);
                    } else {
                        chunk = bufferReader.readRemainingBytes();
                    }

                    // send chunk
                    await this.sendCommandSignData(chunk);

                }

                // listen for ok to send next chunk
                const onOk = async (response) => {

                    // check if more chunks to send
                    if(bufferReader.getRemainingBytesCount() > 0){
                        await sendNextChunk();
                        return;
                    }

                    // no more chunks to send, tell device we are done
                    await this.sendCommandSignFinish();

                }

                // listen for sign start
                const onSignStart = async (response) => {

                    this.off(Constants.ResponseCodes.SignStart, onSignStart);

                    // check if data to sign is too long
                    if(bufferReader.getRemainingBytesCount() > response.maxSignDataLen){
                        this.off(Constants.ResponseCodes.ok, onOk);
                        this.off(Constants.ResponseCodes.err, onErr);
                        this.off(Constants.ResponseCodes.SignStart, onSignStart);
                        this.off(Constants.ResponseCodes.Signature, onSignature);
                        reject("data_too_long");
                        return;
                    }

                    // start first chunk of data
                    await sendNextChunk();

                }

                // resolve when we receive signature
                const onSignature = (response) => {
                    this.off(Constants.ResponseCodes.ok, onOk);
                    this.off(Constants.ResponseCodes.err, onErr);
                    this.off(Constants.ResponseCodes.SignStart, onSignStart);
                    this.off(Constants.ResponseCodes.Signature, onSignature);
                    resolve(response.signature);
                }

                // reject promise when we receive err
                const onErr = (response) => {
                    this.off(Constants.ResponseCodes.ok, onOk);
                    this.off(Constants.ResponseCodes.err, onErr);
                    this.off(Constants.ResponseCodes.SignStart, onSignStart);
                    this.off(Constants.ResponseCodes.Signature, onSignature);
                    reject(response);
                }

                // listen for events
                this.on(Constants.ResponseCodes.Ok, onOk);
                this.on(Constants.ResponseCodes.SignStart, onSignStart);
                this.on(Constants.ResponseCodes.Signature, onSignature);
                this.once(Constants.ResponseCodes.Err, onErr);

                // request device to start signing data
                await this.sendCommandSignStart();

            } catch(e) {
                reject(e);
            }
        });
    }

    tracePath(path, extraTimeoutMillis = 0) {
        return new Promise(async (resolve, reject) => {
            try {

                // generate a random tag for this trace, so we can listen for the correct response
                const tag = RandomUtils.getRandomInt(0, 4294967295);

                // listen for sent response so we can get estimated timeout
                var timeoutHandler = null;
                const onSent = (response) => {

                    // remove error listener since we received sent response
                    this.off(Constants.ResponseCodes.Err, onErr);

                    // reject trace request as timed out after estimated delay, plus a bit extra
                    const estTimeout = response.estTimeout + extraTimeoutMillis;
                    timeoutHandler = setTimeout(() => {
                        this.off(Constants.ResponseCodes.Sent, onSent);
                        this.off(Constants.PushCodes.TraceData, onTraceDataPush);
                        this.off(Constants.ResponseCodes.Err, onErr);
                        reject("timeout");
                    }, estTimeout);

                }

                // resolve promise when we receive trace data
                const onTraceDataPush = (response) => {

                    // make sure tag matches
                    if(response.tag !== tag){
                        console.log("ignoring trace data for a different trace request");
                        return;
                    }

                    // resolve
                    clearTimeout(timeoutHandler);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.TraceData, onTraceDataPush);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);

                }

                // reject promise when we receive err
                const onErr = () => {
                    clearTimeout(timeoutHandler);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.TraceData, onTraceDataPush);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Sent, onSent);
                this.on(Constants.PushCodes.TraceData, onTraceDataPush);
                this.once(Constants.ResponseCodes.Err, onErr);

                // trace path
                await this.sendCommandSendTracePath(tag, 0, path);

            } catch(e) {
                reject(e);
            }
        });
    }

    setOtherParams(manualAddContacts) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set other params
                await this.sendCommandSetOtherParams(manualAddContacts);

            } catch(e) {
                reject(e);
            }
        });
    }

    async setAutoAddContacts() {
        return await this.setOtherParams(false);
    }

    async setManualAddContacts() {
        return await this.setOtherParams(true);
    }

    // REQ_TYPE_GET_NEIGHBOURS from Repeater role
    // https://github.com/meshcore-dev/MeshCore/pull/833
    // Repeater must be running firmware v1.9.0+
    async getNeighbours(publicKey,
        count = 10,
        offset = 0,
        orderBy = 0, // 0=newest_to_oldest, 1=oldest_to_newest, 2=strongest_to_weakest, 3=weakest_to_strongest
        pubKeyPrefixLength = 8,
    ) {

        // get neighbours:
        // req_data[0] = REQ_TYPE_GET_NEIGHBOURS
        // req_data[1] = request_version=0
        // req_data[2] = count=10 how many neighbours to fetch
        // req_data[3..4] = offset=0 (uint16_t)
        // req_data[5] = order_by=0
        // req_data[6] = pubkey_prefix_len=8
        // req_data[7..10] = random blob (help hash)
        const bufferWriter = new BufferWriter();
        bufferWriter.writeByte(Constants.BinaryRequestTypes.GetNeighbours);
        bufferWriter.writeByte(0); // request_version=0
        bufferWriter.writeByte(count);
        bufferWriter.writeUInt16LE(offset);
        bufferWriter.writeByte(orderBy);
        bufferWriter.writeByte(pubKeyPrefixLength);
        bufferWriter.writeUInt32LE(RandomUtils.getRandomInt(0, 4294967295)); // 4 bytes random blob

        // send binary request
        const responseData = await this.sendBinaryRequest(publicKey, bufferWriter.toBytes());

        // parse response
        const bufferReader = new BufferReader(responseData);
        const totalNeighboursCount = bufferReader.readUInt16LE();
        const resultsCount = bufferReader.readUInt16LE();

        // parse neighbours list
        const neighbours = [];
        for(var i = 0; i < resultsCount; i++){

            // read info
            const publicKeyPrefix = bufferReader.readBytes(pubKeyPrefixLength);
            const heardSecondsAgo = bufferReader.readUInt32LE();
            const snr = bufferReader.readInt8() / 4;

            // add to list
            neighbours.push({
                publicKeyPrefix: publicKeyPrefix,
                heardSecondsAgo: heardSecondsAgo,
                snr: snr,
            });

        }

        return {
            totalNeighboursCount: totalNeighboursCount,
            neighbours: neighbours,
        };

    }

}

export default Connection;
