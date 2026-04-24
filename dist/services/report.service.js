"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
// services/report.service.ts
const report_repository_1 = require("../repositories/report.repository");
class ReportService {
    constructor() {
        this.reportRepo = new report_repository_1.ReportRepository();
    }
    /**
     * Lấy toàn bộ data cho trang Overview trong 1 lần gọi
     * FE chỉ cần gọi GET /api/admin/reports/overview?year=2024
     */
    async getOverview(year) {
        const targetYear = year ?? new Date().getFullYear();
        // Chạy song song tất cả queries để tối ưu performance
        const [summary, newUsers, returnCancelRate, revenueByMonth, topProducts, categoryRevenue, orderStatusBreakdown, newUsersByMonth,] = await Promise.all([
            this.reportRepo.getAnnualSummary(targetYear),
            this.reportRepo.getNewUsersCount(6),
            this.reportRepo.getReturnCancelRate(targetYear),
            this.reportRepo.getRevenueByMonth(targetYear),
            this.reportRepo.getTopProducts(5),
            this.reportRepo.getRevenueByCategory(),
            this.reportRepo.getOrderStatusBreakdown(),
            this.reportRepo.getNewUsersByMonth(6),
        ]);
        return {
            summary: {
                totalRevenue: summary.totalRevenue,
                totalOrders: summary.totalOrders,
                newUsers,
                returnCancelRate,
            },
            revenueByMonth,
            topProducts,
            categoryRevenue,
            orderStatusBreakdown,
            newUsersByMonth,
        };
    }
    // ─── Các endpoint riêng lẻ nếu FE cần refresh từng section ───
    async getSummary(year) {
        const targetYear = year ?? new Date().getFullYear();
        const [summary, newUsers, returnCancelRate] = await Promise.all([
            this.reportRepo.getAnnualSummary(targetYear),
            this.reportRepo.getNewUsersCount(6),
            this.reportRepo.getReturnCancelRate(targetYear),
        ]);
        return { ...summary, newUsers, returnCancelRate };
    }
    async getRevenueByMonth(year) {
        return this.reportRepo.getRevenueByMonth(year ?? new Date().getFullYear());
    }
    async getTopProducts(limit) {
        return this.reportRepo.getTopProducts(limit ?? 5);
    }
    async getCategoryRevenue() {
        return this.reportRepo.getRevenueByCategory();
    }
    async getOrderStatusBreakdown() {
        return this.reportRepo.getOrderStatusBreakdown();
    }
    async getNewUsersByMonth(months) {
        return this.reportRepo.getNewUsersByMonth(months ?? 6);
    }
}
exports.ReportService = ReportService;
//# sourceMappingURL=report.service.js.map