"use strict";
// File: enums/order.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderMethod = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    // 1. Trạng thái Ban đầu (Đang chờ)
    OrderStatus["PENDING"] = "Pending";
    // 2. Trạng thái Hoạt động (Đang diễn ra)
    OrderStatus["PROCESSING"] = "Processing";
    // ✨ TRẠNG THÁI VẬN CHUYỂN MỚI
    OrderStatus["SHIPPING"] = "Shipping";
    OrderStatus["DELIVERED"] = "Delivered";
    // 3. Trạng thái Hoàn tất Thành công
    OrderStatus["COMPLETED"] = "Completed";
    // 4. Trạng thái Hoàn tất Thất bại/Ngưng
    OrderStatus["CANCELLED"] = "Cancelled";
    OrderStatus["FAILED"] = "Failed"; // Thất bại (ví dụ: lỗi thanh toán, giao hàng không thành công, bị từ chối)
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
// Enum OrderMethod giữ nguyên
var OrderMethod;
(function (OrderMethod) {
    OrderMethod["CAST"] = "Cast";
    OrderMethod["BANK"] = "Bank"; // Thanh toán qua ngân hàng, thẻ, hoặc ví điện tử
})(OrderMethod || (exports.OrderMethod = OrderMethod = {}));
//# sourceMappingURL=order.js.map