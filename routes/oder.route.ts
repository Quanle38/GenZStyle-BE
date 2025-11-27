// routes/order.routes.ts
import { Router } from "express";
import orderController from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const orderRouter = Router();

// GET routes
orderRouter.get("/",authMiddleware,orderController.getAllOrders);
orderRouter.get("/statistics", orderController.getOrderStatistics);
orderRouter.get("/date-range", orderController.getOrdersByDateRange);
orderRouter.get("/status/:status", orderController.getOrdersByStatus);
orderRouter.get("/:id", orderController.getOrderById);
orderRouter.get("/:id/items", orderController.getOrderItems);

// POST routes
orderRouter.post("/",authMiddleware,orderController.createOrder);

// PATCH routes
orderRouter.patch("/:id/status", orderController.updateOrderStatus);
orderRouter.patch("/:id/cancel", orderController.cancelOrder);

// DELETE routes
orderRouter.delete("/:id", orderController.deleteOrder);

export default orderRouter;