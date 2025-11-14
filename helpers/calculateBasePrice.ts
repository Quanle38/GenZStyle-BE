export const CalculateBasePrice = async (prices: number[]): Promise<number> => {
    if (!prices || prices.length === 0) {
        return 0;
    }

    return Math.min(...prices);
};
