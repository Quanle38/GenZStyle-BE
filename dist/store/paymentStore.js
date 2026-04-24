"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orders = exports.orderTimeoutMap = exports.timeouts = void 0;
exports.startPaymentTimeout = startPaymentTimeout;
const generateId_1 = require("../helpers/generateId");
exports.timeouts = {};
exports.orderTimeoutMap = {}; // map orderCode → timeoutId
exports.orders = {};
/**
 * Tạo timeout huỷ thanh toán kèm id sinh bằng generateIdByFormat
 */
function startPaymentTimeout(orderCode) {
    // Nếu order đã có timeout trước đó → clear
    if (exports.orderTimeoutMap[orderCode]) {
        const oldTimeoutId = exports.orderTimeoutMap[orderCode];
        clearTimeout(exports.timeouts[oldTimeoutId]);
        delete exports.timeouts[oldTimeoutId];
    }
    // Sinh id timeout theo format
    const timeoutId = (0, generateId_1.generateIdByFormat)("TO", 6, Object.keys(exports.timeouts).length + 1);
    // Ghi lại map orderCode -> timeoutId
    exports.orderTimeoutMap[orderCode] = timeoutId;
    // Tạo timeout
    exports.timeouts[timeoutId] = setTimeout(() => {
        const order = exports.orders[orderCode];
        if (order && order.status === "pending") {
            order.status = "failed";
            order.failedAt = new Date().toISOString();
            console.log(`\n[TIMEOUT] ${orderCode} => status: failed (THIS PAYMENT CANCELLED AFTER 10 minutes)`);
        }
        // Xoá timeout khi hoàn tất
        delete exports.timeouts[timeoutId];
        delete exports.orderTimeoutMap[orderCode];
    }, 600 * 1000);
}
//# sourceMappingURL=paymentStore.js.map