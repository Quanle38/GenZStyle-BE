"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/report.routes.ts
const express_1 = require("express");
const report_controller_1 = __importDefault(require("../controllers/report.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
// TODO: thêm adminMiddleware nếu bạn có middleware kiểm tra role admin
// import { adminMiddleware } from "../middleware/admin.middleware";
const reportRouter = (0, express_1.Router)();
// ─── Tất cả routes đều yêu cầu auth (+ admin nếu có) ────────────
/**
 * GET /api/admin/reports/overview?year=2024
 * ★ Endpoint chính — FE gọi 1 lần để lấy toàn bộ data Overview
 */
reportRouter.get("/overview", auth_middleware_1.authMiddleware, report_controller_1.default.getOverview);
/**
 * GET /api/admin/reports/summary?year=2024
 * Chỉ 4 stat cards (dùng khi FE cần refresh riêng phần summary)
 */
reportRouter.get("/summary", auth_middleware_1.authMiddleware, report_controller_1.default.getSummary);
/**
 * GET /api/admin/reports/revenue-by-month?year=2024
 */
reportRouter.get("/revenue-by-month", auth_middleware_1.authMiddleware, report_controller_1.default.getRevenueByMonth);
/**
 * GET /api/admin/reports/top-products?limit=5
 */
reportRouter.get("/top-products", auth_middleware_1.authMiddleware, report_controller_1.default.getTopProducts);
/**
 * GET /api/admin/reports/category-revenue
 */
reportRouter.get("/category-revenue", auth_middleware_1.authMiddleware, report_controller_1.default.getCategoryRevenue);
/**
 * GET /api/admin/reports/order-status
 */
reportRouter.get("/order-status", auth_middleware_1.authMiddleware, report_controller_1.default.getOrderStatusBreakdown);
/**
 * GET /api/admin/reports/new-users?months=6
 */
reportRouter.get("/new-users", auth_middleware_1.authMiddleware, report_controller_1.default.getNewUsersByMonth);
exports.default = reportRouter;
//# sourceMappingURL=report.route.js.map