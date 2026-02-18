/** Constants used by the MeshCore companion protocol. */
class Constants {

    static SupportedCompanionProtocolVersion = 1;

    static SerialFrameTypes = {
        Incoming: 0x3e, // ">"
        Outgoing: 0x3c, // "<"
    }

    static Ble = {
        ServiceUuid: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
        CharacteristicUuidRx: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
        CharacteristicUuidTx: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
    }

    static CommandCodes = {
        AppStart: 1,
        SendTxtMsg: 2,
        SendChannelTxtMsg: 3,
        GetContacts: 4,
        GetDeviceTime: 5,
        SetDeviceTime: 6,
        SendSelfAdvert: 7,
        SetAdvertName: 8,
        AddUpdateContact: 9,
        SyncNextMessage: 10,
        SetRadioParams: 11,
        SetTxPower: 12,
        ResetPath: 13,
        SetAdvertLatLon: 14,
        RemoveContact: 15,
        ShareContact: 16,
        ExportContact: 17,
        ImportContact: 18,
        Reboot: 19,
        GetBatteryVoltage: 20,
        SetTuningParams: 21, // todo
        DeviceQuery: 22,
        ExportPrivateKey: 23,
        ImportPrivateKey: 24,
        SendRawData: 25,
        SendLogin: 26, // todo
        SendStatusReq: 27, // todo
        GetChannel: 31,
        SetChannel: 32,
        SignStart: 33,
        SignData: 34,
        SignFinish: 35,
        SendTracePath: 36,
        // todo set device pin command
        SetOtherParams: 38,
        SendTelemetryReq: 39,

        SendBinaryReq: 50,
    }

    static ResponseCodes = {
        Ok: 0, // todo
        Err: 1, // todo
        ContactsStart: 2,
        Contact: 3,
        EndOfContacts: 4,
        SelfInfo: 5,
        Sent: 6,
        ContactMsgRecv: 7,
        ChannelMsgRecv: 8,
        CurrTime: 9,
        NoMoreMessages: 10,
        ExportContact: 11,
        BatteryVoltage: 12,
        DeviceInfo: 13,
        PrivateKey: 14,
        Disabled: 15,
        ChannelInfo: 18,
        SignStart: 19,
        Signature: 20,
    }

    static PushCodes = {
        Advert: 0x80, // when companion is set to auto add contacts
        PathUpdated: 0x81,
        SendConfirmed: 0x82,
        MsgWaiting: 0x83,
        RawData: 0x84,
        LoginSuccess: 0x85,
        LoginFail: 0x86, // not usable yet
        StatusResponse: 0x87,
        LogRxData: 0x88,
        TraceData: 0x89,
        NewAdvert: 0x8A, // when companion is set to manually add contacts
        TelemetryResponse: 0x8B,
        BinaryResponse: 0x8C,
    }

    static ErrorCodes = {
        UnsupportedCmd: 1,
        NotFound: 2,
        TableFull: 3,
        BadState: 4,
        FileIoError: 5,
        IllegalArg: 6,
    }

    static AdvType = {
        None: 0,
        Chat: 1,
        Repeater: 2,
        Room: 3,
    }

    static SelfAdvertTypes = {
        ZeroHop: 0,
        Flood: 1,
    }

    static TxtTypes = {
        Plain: 0,
        CliData: 1,
        SignedPlain: 2,
    }

    static BinaryRequestTypes = {
        GetTelemetryData: 0x03, // #define REQ_TYPE_GET_TELEMETRY_DATA 0x03
        GetAvgMinMax: 0x04, // #define REQ_TYPE_GET_AVG_MIN_MAX 0x04
        GetAccessList: 0x05, // #define REQ_TYPE_GET_ACCESS_LIST 0x05
        GetNeighbours: 0x06, // #define REQ_TYPE_GET_NEIGHBOURS 0x06
    }

}

export default Constants;
