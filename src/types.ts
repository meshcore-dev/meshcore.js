/** Information about the connected MeshCore device/node. */
export interface SelfInfo {
    type: number;
    txPower: number;
    maxTxPower: number;
    publicKey: Uint8Array;
    advLat: number;
    advLon: number;
    reserved: Uint8Array;
    manualAddContacts: number;
    radioFreq: number;
    radioBw: number;
    radioSf: number;
    radioCr: number;
    name: string;
}

/** A contact stored on the device. */
export interface Contact {
    publicKey: Uint8Array;
    type: number;
    flags: number;
    outPathLen: number;
    outPath: Uint8Array;
    advName: string;
    lastAdvert: number;
    advLat: number;
    advLon: number;
    lastMod: number;
}

/** A channel stored on the device. */
export interface ChannelInfo {
    channelIdx: number;
    name: string;
    secret: Uint8Array;
}

/** Device info returned from a device query. */
export interface DeviceInfo {
    firmwareVer: number;
    reserved: Uint8Array;
    firmware_build_date: string;
    manufacturerModel: string;
}

/** Battery voltage response. */
export interface BatteryVoltage {
    batteryMilliVolts: number;
}

/** Current time response. */
export interface CurrTime {
    epochSecs: number;
}

/** Sent response from the device. */
export interface SentResponse {
    result: number;
    expectedAckCrc: number;
    estTimeout: number;
}

/** A contact message received from the device. */
export interface ContactMessage {
    pubKeyPrefix: Uint8Array;
    pathLen: number;
    txtType: number;
    senderTimestamp: number;
    text: string;
}

/** A channel message received from the device. */
export interface ChannelMessage {
    channelIdx: number;
    pathLen: number;
    txtType: number;
    senderTimestamp: number;
    text: string;
}

/** Exported contact response. */
export interface ExportContactResponse {
    advertPacketBytes: Uint8Array;
}

/** Private key response. */
export interface PrivateKeyResponse {
    privateKey: Uint8Array;
}

/** Sign start response. */
export interface SignStartResponse {
    reserved: number;
    maxSignDataLen: number;
}

/** Signature response. */
export interface SignatureResponse {
    signature: Uint8Array;
}

/** Error response. */
export interface ErrResponse {
    errCode: number | null;
}

/** Contacts start response. */
export interface ContactsStartResponse {
    count: number;
}

/** End of contacts response. */
export interface EndOfContactsResponse {
    mostRecentLastmod: number;
}

/** Advert push data. */
export interface AdvertPush {
    publicKey: Uint8Array;
}

/** Path updated push data. */
export interface PathUpdatedPush {
    publicKey: Uint8Array;
}

/** Send confirmed push data. */
export interface SendConfirmedPush {
    ackCode: number;
    roundTrip: number;
}

/** Raw data push. */
export interface RawDataPush {
    lastSnr: number;
    lastRssi: number;
    reserved: number;
    payload: Uint8Array;
}

/** Login success push. */
export interface LoginSuccessPush {
    reserved: number;
    pubKeyPrefix: Uint8Array;
}

/** Status response push. */
export interface StatusResponsePush {
    reserved: number;
    pubKeyPrefix: Uint8Array;
    statusData: Uint8Array;
}

/** Log RX data push. */
export interface LogRxDataPush {
    lastSnr: number;
    lastRssi: number;
    raw: Uint8Array;
}

/** Telemetry response push. */
export interface TelemetryResponsePush {
    reserved: number;
    pubKeyPrefix: Uint8Array;
    lppSensorData: Uint8Array;
}

/** Binary response push. */
export interface BinaryResponsePush {
    reserved: number;
    tag: number;
    responseData: Uint8Array;
}

/** Trace data push. */
export interface TraceDataPush {
    reserved: number;
    pathLen: number;
    flags: number;
    tag: number;
    authCode: number;
    pathHashes: Uint8Array;
    pathSnrs: Uint8Array;
    lastSnr: number;
}

/** New advert push data. */
export interface NewAdvertPush {
    publicKey: Uint8Array;
    type: number;
    flags: number;
    outPathLen: number;
    outPath: Uint8Array;
    advName: string;
    lastAdvert: number;
    advLat: number;
    advLon: number;
    lastMod: number;
}

/** Repeater stats from status response. */
export interface RepeaterStats {
    batt_milli_volts: number;
    curr_tx_queue_len: number;
    noise_floor: number;
    last_rssi: number;
    n_packets_recv: number;
    n_packets_sent: number;
    total_air_time_secs: number;
    total_up_time_secs: number;
    n_sent_flood: number;
    n_sent_direct: number;
    n_recv_flood: number;
    n_recv_direct: number;
    err_events: number;
    last_snr: number;
    n_direct_dups: number;
    n_flood_dups: number;
}

/** Synced message result. */
export interface SyncedMessage {
    contactMessage?: ContactMessage;
    channelMessage?: ChannelMessage;
}

/** Ping result. */
export interface PingResult {
    rtt: number;
    snr: number;
    rssi: number;
}

/** Neighbour info. */
export interface Neighbour {
    publicKeyPrefix: Uint8Array;
    heardSecondsAgo: number;
    snr: number;
}

/** Get neighbours result. */
export interface GetNeighboursResult {
    totalNeighboursCount: number;
    neighbours: Neighbour[];
}

/** Parsed advert app data. */
export interface ParsedAdvertAppData {
    type: string | null;
    lat: number | null;
    lon: number | null;
    name: string | null;
    feat1: number | null;
    feat2: number | null;
}

/** CayenneLPP telemetry entry. */
export interface TelemetryEntry {
    channel: number;
    type: number;
    value: number | { latitude: number; longitude: number; altitude: number };
}
