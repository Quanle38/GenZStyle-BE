// routes/report.routes.ts
import { Router } from "express";
import reportController from "../controllers/report.controller";
import { authMiddleware } from "../middleware/auth.middleware";

// TODO: thêm adminMiddleware nếu bạn có middleware kiểm tra role admin
// import { adminMiddleware } from "../middleware/admin.middleware";

const reportRouter = Router();

// ─── Tất cả routes đều yêu cầu auth (+ admin nếu có) ────────────

/**
 * GET /api/admin/reports/overview?year=2024
 * ★ Endpoint chính — FE gọi 1 lần để lấy toàn bộ data Overview
 */
reportRouter.get("/overview", authMiddleware, reportController.getOverview);

/**
 * GET /api/admin/reports/summary?year=2024
 * Chỉ 4 stat cards (dùng khi FE cần refresh riêng phần summary)
 */
reportRouter.get("/summary", authMiddleware, reportController.getSummary);

/**
 * GET /api/admin/reports/revenue-by-month?year=2024
 */
reportRouter.get("/revenue-by-month", authMiddleware, reportController.getRevenueByMonth);

/**
 * GET /api/admin/reports/top-products?limit=5
 */
reportRouter.get("/top-products", authMiddleware, reportController.getTopProducts);

/**
 * GET /api/admin/reports/category-revenue
 */
reportRouter.get("/category-revenue", authMiddleware, reportController.getCategoryRevenue);

/**
 * GET /api/admin/reports/order-status
 */
reportRouter.get("/order-status", authMiddleware, reportController.getOrderStatusBreakdown);

/**
 * GET /api/admin/reports/new-users?months=6
 */
reportRouter.get("/new-users", authMiddleware, reportController.getNewUsersByMonth);

export default reportRouter;