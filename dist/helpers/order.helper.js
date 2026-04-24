"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOrderOwnership = checkOrderOwnership;
function checkOrderOwnership(order, userId) {
    if (!order) {
        throw new Error("Order not found");
    }
    if (order.user_id !== userId) {
        throw new Error("Access denied");
    }
}
//# sourceMappingURL=order.helper.js.map