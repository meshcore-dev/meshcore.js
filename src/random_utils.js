class RandomUtils {

    /**
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

export default RandomUtils;
