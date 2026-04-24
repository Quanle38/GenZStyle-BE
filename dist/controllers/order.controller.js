"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const order_service_1 = require("../services/order.service");
class OrderController {
    constructor() {
        /**
         * GET /orders
         * Lấy tất cả đơn hàng của user
         */
        this.getAllOrders = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                console.log("user", req.user);
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const orders = await this.orderService.getAllOrders(uow, userId);
                res.status(200).json({
                    success: true,
                    data: orders
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch orders"
                });
            }
        };
        this.getAllOrderByUserId = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                console.log("user", req.user);
                const userId = req.body?.user_id;
                if (!userId) {
                    res.status(404).json({ message: "User not exist" });
                    return;
                }
                const orders = await this.orderService.getAllOrders(uow, userId);
                res.status(200).json({
                    success: true,
                    data: orders
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch orders"
                });
            }
        };
        /**
         * GET /orders/:id
         * Lấy chi tiết một đơn hàng
         */
        this.getOrderById = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const { id } = req.params;
                const order = await this.orderService.getOrderById(uow, id);
                if (!order) {
                    res.status(404).json({
                        success: false,
                        message: "Order not found"
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: order
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch order"
                });
            }
        };
        /**
         * GET /orders/status/:status
         * Lấy đơn hàng theo trạng thái
         */
        this.getOrdersByStatus = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const { status } = req.params;
                const orders = await this.orderService.getOrdersByStatus(uow, userId, status);
                res.status(200).json({
                    success: true,
                    data: orders
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch orders by status"
                });
            }
        };
        /**
         * POST /orders
         * Tạo đơn hàng mới
         */
        this.createOrder = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                await uow.start();
                const orderData = {
                    user_id: userId,
                    cart_id: req.body.cart_id || null,
                    items: req.body.items,
                    method: req.body.method
                };
                if (!orderData.items || orderData.items.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: "Order must have at least one item"
                    });
                    return;
                }
                const order = await this.orderService.createOrder(uow, orderData);
                await uow.commit();
                res.status(201).json({
                    success: true,
                    message: "Order created successfully",
                    data: order
                });
            }
            catch (error) {
                await uow.rollback();
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to create order"
                });
            }
        };
        /**
         * PATCH /orders/:id/status
         * Cập nhật trạng thái đơn hàng
         */
        this.updateOrderStatus = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                await uow.start();
                const { id } = req.params;
                var status = req.body.status;
                if (!status) {
                    res.status(400).json({
                        success: false,
                        message: "Status is required"
                    });
                    return;
                }
                const order = await this.orderService.updateOrderStatus(uow, id, status);
                await uow.commit();
                res.status(200).json({
                    success: true,
                    message: "Order status updated successfully",
                    data: order
                });
            }
            catch (error) {
                await uow.rollback();
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to update order status"
                });
            }
        };
        /**
         * PATCH /orders/:id/cancel
         * Hủy đơn hàng
         */
        this.cancelOrder = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                await uow.start();
                const { id } = req.params;
                const order = await this.orderService.cancelOrder(uow, id);
                await uow.commit();
                res.status(200).json({
                    success: true,
                    message: "Order cancelled successfully",
                    data: order
                });
            }
            catch (error) {
                await uow.rollback();
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to cancel order"
                });
            }
        };
        /**
         * GET /orders/statistics
         * Lấy thống kê đơn hàng
         */
        this.getOrderStatistics = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const statistics = await this.orderService.getOrderStatistics(uow, userId);
                res.status(200).json({
                    success: true,
                    data: statistics
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch order statistics"
                });
            }
        };
        /**
         * GET /orders/date-range
         * Lấy đơn hàng trong khoảng thời gian
         */
        this.getOrdersByDateRange = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const { startDate, endDate } = req.query;
                if (!startDate || !endDate) {
                    res.status(400).json({
                        success: false,
                        message: "startDate and endDate are required"
                    });
                    return;
                }
                const orders = await this.orderService.getOrdersByDateRange(uow, userId, new Date(startDate), new Date(endDate));
                res.status(200).json({
                    success: true,
                    data: orders
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch orders by date range"
                });
            }
        };
        /**
         * GET /orders/:id/items
         * Lấy chi tiết items trong đơn hàng
         */
        this.getOrderItems = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const { id } = req.params;
                const items = await this.orderService.getOrderItems(uow, id);
                res.status(200).json({
                    success: true,
                    data: items
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch order items"
                });
            }
        };
        /**
         * DELETE /orders/:id
         * Xóa đơn hàng (chỉ cancelled orders)
         */
        this.deleteOrder = async (req, res) => {
            const uow = new unitOfWork_1.UnitOfWork();
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                await uow.start();
                const { id } = req.params;
                const deleted = await this.orderService.deleteOrder(uow, id);
                await uow.commit();
                if (!deleted) {
                    res.status(404).json({
                        success: false,
                        message: "Order not found or cannot be deleted"
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Order deleted successfully"
                });
            }
            catch (error) {
                await uow.rollback();
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to delete order"
                });
            }
        };
        this.orderService = new order_service_1.OrderService();
    }
}
exports.OrderController = OrderController;
exports.default = new OrderController();
//# sourceMappingURL=order.controller.js.map