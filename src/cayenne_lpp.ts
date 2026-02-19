import BufferReader from "./buffer_reader.js";
import type { TelemetryEntry } from "./types.js";

class CayenneLpp {

    static LPP_DIGITAL_INPUT = 0;         // 1 byte
    static LPP_DIGITAL_OUTPUT = 1;        // 1 byte
    static LPP_ANALOG_INPUT = 2;          // 2 bytes, 0.01 signed
    static LPP_ANALOG_OUTPUT = 3;         // 2 bytes, 0.01 signed
    static LPP_GENERIC_SENSOR = 100;      // 4 bytes, unsigned
    static LPP_LUMINOSITY = 101;          // 2 bytes, 1 lux unsigned
    static LPP_PRESENCE = 102;            // 1 byte, bool
    static LPP_TEMPERATURE = 103;         // 2 bytes, 0.1°C signed
    static LPP_RELATIVE_HUMIDITY = 104;   // 1 byte, 0.5% unsigned
    static LPP_ACCELEROMETER = 113;       // 2 bytes per axis, 0.001G
    static LPP_BAROMETRIC_PRESSURE = 115; // 2 bytes 0.1hPa unsigned
    static LPP_VOLTAGE = 116;             // 2 bytes 0.01V unsigned
    static LPP_CURRENT = 117;             // 2 bytes 0.001A unsigned
    static LPP_FREQUENCY = 118;           // 4 bytes 1Hz unsigned
    static LPP_PERCENTAGE = 120;          // 1 byte 1-100% unsigned
    static LPP_ALTITUDE = 121;            // 2 byte 1m signed
    static LPP_CONCENTRATION = 125;       // 2 bytes, 1 ppm unsigned
    static LPP_POWER = 128;               // 2 byte, 1W, unsigned
    static LPP_DISTANCE = 130;            // 4 byte, 0.001m, unsigned
    static LPP_ENERGY = 131;              // 4 byte, 0.001kWh, unsigned
    static LPP_DIRECTION = 132;           // 2 bytes, 1deg, unsigned
    static LPP_UNIXTIME = 133;            // 4 bytes, unsigned
    static LPP_GYROMETER = 134;           // 2 bytes per axis, 0.01 °/s
    static LPP_COLOUR = 135;              // 1 byte per RGB Color
    static LPP_GPS = 136;                 // 3 byte lon/lat 0.0001 °, 3 bytes alt 0.01 meter
    static LPP_SWITCH = 142;              // 1 byte, 0/1
    static LPP_POLYLINE = 240;            // 1 byte size, 1 byte delta factor, 3 byte lon/lat 0.0001° * factor, n (size-8) bytes deltas

    static parse(bytes: Uint8Array): TelemetryEntry[] {

        const buffer = new BufferReader(bytes);
        const telemetry: TelemetryEntry[] = [];

        while(buffer.getRemainingBytesCount() >= 2){ // need at least 2 more bytes to get channel and type

            const channel = buffer.readUInt8();
            const type = buffer.readUInt8();

            // stop parsing if channel and type are zero, as there seems to be garbage bytes???
            if(channel === 0 && type === 0){
                break;
            }

            switch(type){
                case this.LPP_GENERIC_SENSOR: {
                    const value = buffer.readUInt32BE();
                    // console.log(`[CayenneLpp] parsed LPP_GENERIC_SENSOR=${value}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": value,
                    });
                    break;
                }
                case this.LPP_LUMINOSITY: {
                    const lux = buffer.readInt16BE();
                    // console.log(`[CayenneLpp] parsed LPP_LUMINOSITY=${lux}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": lux,
                    });
                    break;
                }
                case this.LPP_PRESENCE: {
                    const presence = buffer.readUInt8();
                    // console.log(`[CayenneLpp] parsed LPP_PRESENCE=${presence}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": presence,
                    });
                    break;
                }
                case this.LPP_TEMPERATURE: {
                    const temperature = buffer.readInt16BE() / 10;
                    // console.log(`[CayenneLpp] parsed LPP_TEMPERATURE=${temperature}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": temperature,
                    });
                    break;
                }
                case this.LPP_RELATIVE_HUMIDITY: {
                    const relativeHumidity = buffer.readUInt8() / 2;
                    // console.log(`[CayenneLpp] parsed LPP_RELATIVE_HUMIDITY=${relativeHumidity}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": relativeHumidity,
                    });
                    break;
                }
                case this.LPP_BAROMETRIC_PRESSURE: {
                    const barometricPressure = buffer.readUInt16BE() / 10;
                    // console.log(`[CayenneLpp] parsed LPP_BAROMETRIC_PRESSURE=${barometricPressure}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": barometricPressure,
                    });
                    break;
                }
                case this.LPP_VOLTAGE: {
                    // uint16: 0v to 655.35v
                    // int16: -327.67v to +327.67v
                    // should be readUInt16BE, but I'm using readInt16BE to allow for negative voltage
                    const voltage = buffer.readInt16BE() / 100;
                    // console.log(`[CayenneLpp] parsed LPP_VOLTAGE=${voltage}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": voltage,
                    });
                    break;
                }
                case this.LPP_CURRENT: {
                    // uint16: 0A to 655.35A
                    // int16: -327.67A to +327.67A
                    // should be readUInt16BE, but I'm using readInt16BE to allow for negative current
                    const current = buffer.readInt16BE() / 1000;
                    // console.log(`[CayenneLpp] parsed LPP_CURRENT=${current}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": current,
                    });
                    break;
                }
                case this.LPP_PERCENTAGE: {
                    const percentage = buffer.readUInt8();
                    // console.log(`[CayenneLpp] parsed LPP_PERCENTAGE=${percentage}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": percentage,
                    });
                    break;
                }
                case this.LPP_CONCENTRATION: {
                    const concentration = buffer.readUInt16BE();
                    // console.log(`[CayenneLpp] parsed LPP_CONCENTRATION=${concentration}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": concentration,
                    });
                    break;
                }
                case this.LPP_POWER: {
                    const power = buffer.readUInt16BE();
                    // console.log(`[CayenneLpp] parsed LPP_POWER=${power}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": power,
                    });
                    break;
                }
                case this.LPP_GPS: {
                    const latitude = buffer.readInt24BE() / 10000;
                    const longitude = buffer.readInt24BE() / 10000;
                    const altitude = buffer.readInt24BE() / 100;
                    // console.log(`[CayenneLpp] parsed LPP_GPS=${latitude},${longitude},${altitude}`);
                    telemetry.push({
                        "channel": channel,
                        "type": type,
                        "value": {
                            latitude: latitude,
                            longitude: longitude,
                            altitude: altitude,
                        },
                    });
                    break;
                }
                // todo support all telemetry types, otherwise if an unknown is given, we can't read other telemetry after it
                default: {
                    // console.log(`[CayenneLpp] unsupported type: ${type}`);
                    return telemetry;
                }
            }

        }

        return telemetry;

    }

}

export default CayenneLpp;
