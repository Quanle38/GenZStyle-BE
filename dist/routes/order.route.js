"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/order.routes.ts
const express_1 = require("express");
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const orderRouter = (0, express_1.Router)();
// GET routes
orderRouter.get("/", auth_middleware_1.authMiddleware, order_controller_1.default.getAllOrders);
orderRouter.get("/statistics", auth_middleware_1.authMiddleware, order_controller_1.default.getOrderStatistics);
orderRouter.get("/date-range", auth_middleware_1.authMiddleware, order_controller_1.default.getOrdersByDateRange);
orderRouter.get("/status/:status", auth_middleware_1.authMiddleware, order_controller_1.default.getOrdersByStatus);
orderRouter.get("/:id", auth_middleware_1.authMiddleware, order_controller_1.default.getOrderById);
orderRouter.get("/:id/items", auth_middleware_1.authMiddleware, order_controller_1.default.getOrderItems);
// POST routes
orderRouter.post("/", auth_middleware_1.authMiddleware, order_controller_1.default.createOrder);
// PATCH routes
orderRouter.patch("/:id/status", auth_middleware_1.authMiddleware, order_controller_1.default.updateOrderStatus);
orderRouter.patch("/:id/cancel", auth_middleware_1.authMiddleware, order_controller_1.default.cancelOrder);
// DELETE routes
orderRouter.delete("/:id", auth_middleware_1.authMiddleware, order_controller_1.default.deleteOrder);
exports.default = orderRouter;
//# sourceMappingURL=order.route.js.map