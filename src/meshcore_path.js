import BufferReader from "./buffer_reader.js";
import HexUtil from "./hex_util.js";
import Packet from "./packet.js";

class MeshCorePath {

    constructor(pathHashSize, pathHashCount, pathItems) {
        this.pathHashSize = pathHashSize;
        this.pathHashCount = pathHashCount;
        this.pathItems = pathItems;
    }

    static fromPathAndLength(path, pathLen) {

        // make sure path is valid
        if(pathLen === 0xFF){
            return null;
        }

        const pathHashSize = Packet.extractPathHashSize(pathLen);
        const pathHashCount = Packet.extractPathHashCount(pathLen);
        const pathByteLength = pathHashCount * pathHashSize;
        const pathBytes = path.subarray(0, pathByteLength);
        if(pathBytes.length < pathByteLength){
            return null;
        }

        // convert path to comma delimited hex string
        const pathItems = [];
        const pathBuffer = new BufferReader(pathBytes);
        for(var i = 0; i < pathHashCount; i++){
            pathItems.push(pathBuffer.readBytes(pathHashSize));
        }

        return new MeshCorePath(pathHashSize, pathHashCount, pathItems);

    }

    toHexPathString() {
        return this.pathItems.map((pathItem) => {
            return HexUtil.bytesToHex(pathItem);
        }).join(",");
    }

}

export default MeshCorePath;
