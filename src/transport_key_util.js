class TransportKeyUtil {

    static async getHashtagRegionKey(regionName) {

        // public hashtag regions must start with #
        if(!regionName.startsWith("#")){
            regionName = `#${regionName}`;
        }

        // Hash the message using SHA-256
        const bytes = new TextEncoder().encode(regionName);
        const hash = await crypto.subtle.digest("SHA-256", bytes);
        return new Uint8Array(hash);

    }

}

export default TransportKeyUtil;
