"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIdByFormat = void 0;
const generateIdByFormat = (prefixCode, length, numberToStart) => {
    if (prefixCode.length >= length)
        return "Error";
    let count = 1;
    let code = prefixCode;
    let countCharSubstract = 0;
    if (length <= 0)
        length = 2;
    if (numberToStart)
        count = numberToStart;
    if (prefixCode.length > 1) {
        countCharSubstract = prefixCode.length - 1;
    }
    const numberPart = count.toString().padStart(length - 1 - countCharSubstract, "0");
    return code + numberPart;
};
exports.generateIdByFormat = generateIdByFormat;
//# sourceMappingURL=generateId.js.map