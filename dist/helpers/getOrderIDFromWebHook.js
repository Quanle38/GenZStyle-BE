"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderIDFromWebHook = void 0;
const getOrderIDFromWebHook = (code) => {
    const match = code.match(/\d+$/);
    return match ? match[0] : "";
};
exports.getOrderIDFromWebHook = getOrderIDFromWebHook;
//# sourceMappingURL=getOrderIDFromWebHook.js.map