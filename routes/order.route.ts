// routes/order.routes.ts
import { Router } from "express";
import orderController from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const orderRouter = Router();

// GET routes
orderRouter.get("/",authMiddleware,orderController.getAllOrders);
orderRouter.get("/statistics", authMiddleware,orderController.getOrderStatistics);
orderRouter.get("/date-range", authMiddleware,orderController.getOrdersByDateRange);
orderRouter.get("/status/:status", authMiddleware,orderController.getOrdersByStatus);
orderRouter.get("/:id", authMiddleware,orderController.getOrderById);
orderRouter.get("/:id/items", authMiddleware,orderController.getOrderItems);

// POST routes
orderRouter.post("/",authMiddleware,orderController.createOrder);

// PATCH routes
orderRouter.patch("/:id/status",authMiddleware, orderController.updateOrderStatus);
orderRouter.patch("/:id/cancel", authMiddleware,orderController.cancelOrder);

// DELETE routes
orderRouter.delete("/:id",authMiddleware,orderController.deleteOrder);

export default orderRouter;