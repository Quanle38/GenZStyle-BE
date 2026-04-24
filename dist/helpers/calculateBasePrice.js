"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateBasePrice = void 0;
const CalculateBasePrice = async (prices) => {
    if (!prices || prices.length === 0) {
        return 0;
    }
    return Math.min(...prices);
};
exports.CalculateBasePrice = CalculateBasePrice;
//# sourceMappingURL=calculateBasePrice.js.map