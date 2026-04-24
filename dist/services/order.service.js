"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const order_1 = require("../enums/order");
class OrderService {
    /**
     * Lấy danh sách tất cả đơn hàng của user
     */
    async getAllOrders(uow, userId) {
        return uow.order.findByUserId(userId);
    }
    /**
     * Lấy chi tiết một đơn hàng
     */
    async getOrderById(uow, orderId) {
        return uow.order.findById(orderId);
    }
    /**
     * Lấy đơn hàng theo trạng thái
     */
    async getOrdersByStatus(uow, userId, status) {
        return uow.order.findByUserIdAndStatus(userId, status);
    }
    /**
     * Tạo đơn hàng mới từ giỏ hàng hoặc từ dữ liệu trực tiếp
     */
    async createOrder(uow, orderData) {
        // Tính tổng số lượng và tổng giá
        const totalQuantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = orderData.items.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);
        // Tạo đơn hàng
        const newOrder = {
            user_id: orderData.user_id,
            cart_id: orderData.cart_id || null,
            quantity: totalQuantity,
            total_price: totalPrice,
            method: orderData.method
        };
        const createdOrder = await uow.order.create(newOrder);
        // Tạo các order items
        const orderItems = orderData.items.map(item => ({
            order_id: createdOrder.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price_per_unit: item.price_per_unit
        }));
        await uow.orderItem.bulkCreate(orderItems);
        // Lấy lại order với đầy đủ thông tin
        const fullOrder = await uow.order.findById(createdOrder.id, {
            include: ['orderItems']
        });
        if (!fullOrder) {
            throw new Error("Failed to retrieve created order.");
        }
        return fullOrder;
    }
    /**
     * Cập nhật trạng thái đơn hàng
     */
    async updateOrderStatus(uow, orderId, newStatus) {
        // Kiểm tra đơn hàng tồn tại và thuộc về user
        const order = await uow.order.findById(orderId);
        if (!order) {
            throw new Error("Order not found or access denied.");
        }
        // Kiểm tra trạng thái hợp lệ
        const validStatuses = ["pending", "completed", "cancelled"];
        if (!validStatuses.includes(newStatus.toLocaleLowerCase())) {
            throw new Error("Invalid order status.");
        }
        // Cập nhật trạng thái
        const updated = await uow.order.updateStatus(orderId, newStatus);
        if (!updated) {
            throw new Error("Failed to update order status.");
        }
        // Lấy lại order đã cập nhật
        const updatedOrder = await uow.order.findById(orderId, {
            include: ['orderItems']
        });
        if (!updatedOrder) {
            throw new Error("Failed to retrieve updated order.");
        }
        return updatedOrder;
    }
    /**
     * Hủy đơn hàng (chỉ được phép khi status là "pending")
     */
    async cancelOrder(uow, orderId) {
        const order = await uow.order.findById(orderId);
        if (!order) {
            throw new Error("Order not found or access denied.");
        }
        if (order.status !== "pending") {
            throw new Error("Only pending orders can be cancelled.");
        }
        return this.updateOrderStatus(uow, orderId, order_1.OrderStatus.CANCELLED);
    }
    /**
     * Lấy thống kê đơn hàng của user
     */
    async getOrderStatistics(uow, userId) {
        const orders = await uow.order.findByUserId(userId);
        const totalOrders = orders.length;
        const totalSpent = orders
            .filter(o => ["completed", "delivered"].includes(o.status))
            .reduce((sum, order) => sum + order.total_price, 0);
        const ordersByStatus = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
        return {
            totalOrders,
            totalSpent,
            ordersByStatus
        };
    }
    /**
     * Lấy đơn hàng trong khoảng thời gian
     */
    async getOrdersByDateRange(uow, userId, startDate, endDate) {
        return uow.order.findByUserIdAndDateRange(userId, startDate, endDate);
    }
    /**
     * Lấy chi tiết các items trong đơn hàng
     */
    async getOrderItems(uow, orderId) {
        // Kiểm tra quyền truy cập
        const order = await uow.order.findById(orderId);
        if (!order) {
            throw new Error("Order not found or access denied.");
        }
        return uow.orderItem.findByOrderId(orderId);
    }
    /**
     * Xóa đơn hàng (chỉ admin hoặc khi status là "cancelled")
     */
    async deleteOrder(uow, orderId) {
        const order = await uow.order.findById(orderId);
        if (!order) {
            throw new Error("Order not found or access denied.");
        }
        if (order.status !== "cancelled") {
            throw new Error("Only cancelled orders can be deleted.");
        }
        // Xóa order items trước
        await uow.orderItem.deleteByOrderId(orderId);
        // Xóa order
        const deleted = await uow.order.delete(orderId);
        return deleted > 0;
    }
    // services/order.service.ts
    async getOrdersHistoryByUserId(uow, userId) {
        return uow.order.findHistoryByUserId(userId);
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map