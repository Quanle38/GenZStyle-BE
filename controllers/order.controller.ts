// controllers/order.controller.ts
import { Request, Response } from "express";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { OrderService, CreateOrderData } from "../services/order.service";

export class OrderController {
    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
    }

    /**
     * GET /orders
     * Lấy tất cả đơn hàng của user
     */
    getAllOrders = async (req: Request, res: Response): Promise<void> => {
        const uow = new UnitOfWork();
        try {
            console.log("user",req.user)
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
        } catch (error: any) {
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
    getOrderById = async (req: Request, res: Response): Promise<void> => {
        const uow = new UnitOfWork();
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const { id } = req.params;
            const order = await this.orderService.getOrderById(uow, id, userId);

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
        } catch (error: any) {
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
    getOrdersByStatus = async (req: Request, res: Response): Promise<void> => {
        const uow = new UnitOfWork();
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
        } catch (error: any) {
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
    createOrder = async (req: Request, res: Response): Promise<void> => {
        const uow = new UnitOfWork();
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            await uow.start();

            const orderData: CreateOrderData = {
                user_id: userId,
                cart_id: req.body.cart_id || null,
                items: req.body.items
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
        } catch (error: any) {
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
    updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
        const uow = new UnitOfWork();
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            await uow.start();

            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                res.status(400).json({
                    success: false,
                    message: "Status is required"
                });
                return;
            }

            const order = await this.orderService.updateOrderStatus(uow, id, userId, status);
            await uow.commit();

            res.status(200).json({
                success: true,
                message: "Order status updated successfully",
                data: order
            });
        } catch (error: any) {
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
    cancelOrder = async (req: Request, res: Response): Promise<void> => {
        const uow = new UnitOfWork();
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            await uow.start();

            const { id } = req.params;
            const order = await this.orderService.cancelOrder(uow, id, userId);
            await uow.commit();

            res.status(200).json({
                success: true,
                message: "Order cancelled successfully",
                data: order
            });
        } catch (error: any) {
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
    getOrderStatistics = async (req: Request, res: Response): Promise<void> => {
        const uow = new UnitOfWork();
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
        } catch (error: any) {
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
    getOrdersByDateRange = async (req: Request, res: Response): Promise<void> => {
        const uow = new UnitOfWork();
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

            const orders = await this.orderService.getOrdersByDateRange(
                uow,
                userId,
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.status(200).json({
                success: true,
                data: orders
            });
        } catch (error: any) {
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
    getOrderItems = async (req: Request, res: Response): Promise<void> => {
        const uow = new UnitOfWork();
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const { id } = req.params;
            const items = await this.orderService.getOrderItems(uow, id, userId);

            res.status(200).json({
                success: true,
                data: items
            });
        } catch (error: any) {
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
    deleteOrder = async (req: Request, res: Response): Promise<void> => {
        const uow = new UnitOfWork();
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            await uow.start();

            const { id } = req.params;
            const deleted = await this.orderService.deleteOrder(uow, id, userId);
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
        } catch (error: any) {
            await uow.rollback();
            res.status(500).json({
                success: false,
                message: error.message || "Failed to delete order"
            });
        }
    };
}

export default new OrderController();