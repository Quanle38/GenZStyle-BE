"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_1 = require("../services/report.service");
class ReportController {
    constructor() {
        /**
         * GET /api/admin/reports/overview?year=2024
         * Trả về toàn bộ data cho trang Overview — FE gọi 1 lần duy nhất
         */
        this.getOverview = async (req, res) => {
            try {
                const year = req.query.year ? parseInt(req.query.year) : undefined;
                if (year && (isNaN(year) || year < 2000 || year > 2100)) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid year parameter",
                    });
                    return;
                }
                const data = await this.reportService.getOverview(year);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch overview report",
                });
            }
        };
        /**
         * GET /api/admin/reports/summary?year=2024
         * Chỉ lấy 4 stat cards
         */
        this.getSummary = async (req, res) => {
            try {
                const year = req.query.year ? parseInt(req.query.year) : undefined;
                const data = await this.reportService.getSummary(year);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch summary",
                });
            }
        };
        /**
         * GET /api/admin/reports/revenue-by-month?year=2024
         */
        this.getRevenueByMonth = async (req, res) => {
            try {
                const year = req.query.year ? parseInt(req.query.year) : undefined;
                const data = await this.reportService.getRevenueByMonth(year);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch revenue by month",
                });
            }
        };
        /**
         * GET /api/admin/reports/top-products?limit=5
         */
        this.getTopProducts = async (req, res) => {
            try {
                const limit = req.query.limit ? parseInt(req.query.limit) : 5;
                const data = await this.reportService.getTopProducts(limit);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch top products",
                });
            }
        };
        /**
         * GET /api/admin/reports/category-revenue
         */
        this.getCategoryRevenue = async (req, res) => {
            try {
                const data = await this.reportService.getCategoryRevenue();
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch category revenue",
                });
            }
        };
        /**
         * GET /api/admin/reports/order-status
         */
        this.getOrderStatusBreakdown = async (req, res) => {
            try {
                const data = await this.reportService.getOrderStatusBreakdown();
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch order status breakdown",
                });
            }
        };
        /**
         * GET /api/admin/reports/new-users?months=6
         */
        this.getNewUsersByMonth = async (req, res) => {
            try {
                const months = req.query.months ? parseInt(req.query.months) : 6;
                const data = await this.reportService.getNewUsersByMonth(months);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch new users",
                });
            }
        };
        this.reportService = new report_service_1.ReportService();
    }
}
exports.ReportController = ReportController;
exports.default = new ReportController();
//# sourceMappingURL=report.controller.js.map