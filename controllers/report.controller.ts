// controllers/report.controller.ts
import { Request, Response } from "express";
import { ReportService } from "../services/report.service";

export class ReportController {
    private reportService: ReportService;

    constructor() {
        this.reportService = new ReportService();
    }

    /**
     * GET /api/admin/reports/overview?year=2024
     * Trả về toàn bộ data cho trang Overview — FE gọi 1 lần duy nhất
     */
    getOverview = async (req: Request, res: Response): Promise<void> => {
        try {
            const year = req.query.year ? parseInt(req.query.year as string) : undefined;

            if (year && (isNaN(year) || year < 2000 || year > 2100)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid year parameter",
                });
                return;
            }

            const data = await this.reportService.getOverview(year);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
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
    getSummary = async (req: Request, res: Response): Promise<void> => {
        try {
            const year = req.query.year ? parseInt(req.query.year as string) : undefined;
            const data = await this.reportService.getSummary(year);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch summary",
            });
        }
    };

    /**
     * GET /api/admin/reports/revenue-by-month?year=2024
     */
    getRevenueByMonth = async (req: Request, res: Response): Promise<void> => {
        try {
            const year = req.query.year ? parseInt(req.query.year as string) : undefined;
            const data = await this.reportService.getRevenueByMonth(year);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch revenue by month",
            });
        }
    };

    /**
     * GET /api/admin/reports/top-products?limit=5
     */
    getTopProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
            const data = await this.reportService.getTopProducts(limit);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch top products",
            });
        }
    };

    /**
     * GET /api/admin/reports/category-revenue
     */
    getCategoryRevenue = async (req: Request, res: Response): Promise<void> => {
        try {
            const data = await this.reportService.getCategoryRevenue();
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch category revenue",
            });
        }
    };

    /**
     * GET /api/admin/reports/order-status
     */
    getOrderStatusBreakdown = async (req: Request, res: Response): Promise<void> => {
        try {
            const data = await this.reportService.getOrderStatusBreakdown();
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch order status breakdown",
            });
        }
    };

    /**
     * GET /api/admin/reports/new-users?months=6
     */
    getNewUsersByMonth = async (req: Request, res: Response): Promise<void> => {
        try {
            const months = req.query.months ? parseInt(req.query.months as string) : 6;
            const data = await this.reportService.getNewUsersByMonth(months);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch new users",
            });
        }
    };
}

export default new ReportController();