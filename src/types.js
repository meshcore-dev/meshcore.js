/**
 * @typedef {number} EpochSeconds Unix timestamp in seconds
 */

/**
 * @typedef {number} Milliseconds Duration in milliseconds
 */

/**
 * @typedef {number} MilliVolts Voltage in millivolts
 */

/**
 * @typedef {number} TxtType Text message type: 0=Plain, 1=CliData, 2=SignedPlain
 */

/**
 * @typedef {object} SelfInfo
 * @property {number} type
 * @property {number} txPower
 * @property {number} maxTxPower
 * @property {Uint8Array} publicKey
 * @property {number} advLat
 * @property {number} advLon
 * @property {Uint8Array} reserved
 * @property {number} manualAddContacts
 * @property {number} radioFreq
 * @property {number} radioBw
 * @property {number} radioSf
 * @property {number} radioCr
 * @property {string} name
 */

/**
 * @typedef {object} Contact
 * @property {Uint8Array} publicKey
 * @property {number} type
 * @property {number} flags
 * @property {number} outPathLen
 * @property {Uint8Array} outPath
 * @property {string} advName
 * @property {EpochSeconds} lastAdvert
 * @property {number} advLat
 * @property {number} advLon
 * @property {EpochSeconds} lastMod
 */

/**
 * @typedef {object} ContactMessage
 * @property {Uint8Array} pubKeyPrefix
 * @property {number} pathLen
 * @property {TxtType} txtType
 * @property {EpochSeconds} senderTimestamp
 * @property {string} text
 */

/**
 * @typedef {object} ChannelMessage
 * @property {number} channelIdx
 * @property {number} pathLen
 * @property {TxtType} txtType
 * @property {EpochSeconds} senderTimestamp
 * @property {string} text
 */

/**
 * @typedef {object} ChannelInfo
 * @property {number} channelIdx
 * @property {string} name
 * @property {Uint8Array} secret
 */

/**
 * @typedef {object} SentResponse
 * @property {number} result
 * @property {number} expectedAckCrc
 * @property {Milliseconds} estTimeout
 */

/**
 * @typedef {object} DeviceInfo
 * @property {number} firmwareVer
 * @property {Uint8Array} reserved
 * @property {string} firmware_build_date
 * @property {string} manufacturerModel
 */

/**
 * @typedef {object} BatteryVoltageResponse
 * @property {MilliVolts} batteryMilliVolts
 */

/**
 * @typedef {object} ExportContactResponse
 * @property {Uint8Array} advertPacketBytes
 */

/**
 * @typedef {object} PrivateKeyResponse
 * @property {Uint8Array} privateKey
 */

/**
 * @typedef {object} RepeaterStats
 * @property {MilliVolts} batt_milli_volts
 * @property {number} curr_tx_queue_len
 * @property {number} noise_floor
 * @property {number} last_rssi
 * @property {number} n_packets_recv
 * @property {number} n_packets_sent
 * @property {number} total_air_time_secs
 * @property {number} total_up_time_secs
 * @property {number} n_sent_flood
 * @property {number} n_sent_direct
 * @property {number} n_recv_flood
 * @property {number} n_recv_direct
 * @property {number} err_events
 * @property {number} last_snr
 * @property {number} n_direct_dups
 * @property {number} n_flood_dups
 */

/**
 * @typedef {object} SyncMessageResult
 * @property {ContactMessage} [contactMessage]
 * @property {ChannelMessage} [channelMessage]
 */

/**
 * @typedef {object} Neighbour
 * @property {Uint8Array} publicKeyPrefix
 * @property {number} heardSecondsAgo
 * @property {number} snr
 */

/**
 * @typedef {object} NeighboursResult
 * @property {number} totalNeighboursCount
 * @property {Neighbour[]} neighbours
 */

/**
 * @typedef {object} TraceDataResult
 * @property {number} reserved
 * @property {number} pathLen
 * @property {number} flags
 * @property {number} tag
 * @property {number} authCode
 * @property {Uint8Array} pathHashes
 * @property {Uint8Array} pathSnrs
 * @property {number} lastSnr
 */

/**
 * @typedef {object} AdvertParsedData
 * @property {"NONE" | "CHAT" | "REPEATER" | "ROOM" | null} type
 * @property {number | null} lat
 * @property {number | null} lon
 * @property {string | null} name
 * @property {number | null} feat1
 * @property {number | null} feat2
 */

/**
 * @typedef {object} CayenneTelemetryEntry
 * @property {number} channel
 * @property {number} type
 * @property {number | {latitude: number, longitude: number, altitude: number}} value
 */

/**
 * @typedef {object} LoginSuccessPush
 * @property {number} reserved
 * @property {Uint8Array} pubKeyPrefix
 */

/**
 * @typedef {object} StatusResponsePush
 * @property {number} reserved
 * @property {Uint8Array} pubKeyPrefix
 * @property {Uint8Array} statusData
 */

/**
 * @typedef {object} RawDataPush
 * @property {number} lastSnr
 * @property {number} lastRssi
 * @property {number} reserved
 * @property {Uint8Array} payload
 */

/**
 * @typedef {object} SendConfirmedPush
 * @property {number} ackCode
 * @property {Milliseconds} roundTrip
 */

/**
 * @typedef {object} LogRxDataPush
 * @property {number} lastSnr
 * @property {number} lastRssi
 * @property {Uint8Array} raw
 */

/**
 * @typedef {object} TelemetryResponsePush
 * @property {number} reserved
 * @property {Uint8Array} pubKeyPrefix
 * @property {Uint8Array} lppSensorData
 */

/**
 * @typedef {object} BinaryResponsePush
 * @property {number} reserved
 * @property {number} tag
 * @property {Uint8Array} responseData
 */

/**
 * @typedef {object} NewAdvertPush
 * @property {Uint8Array} publicKey
 * @property {number} type
 * @property {number} flags
 * @property {number} outPathLen
 * @property {Uint8Array} outPath
 * @property {string} advName
 * @property {EpochSeconds} lastAdvert
 * @property {number} advLat
 * @property {number} advLon
 * @property {EpochSeconds} lastMod
 */

export {};
