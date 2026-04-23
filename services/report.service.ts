// services/report.service.ts
import { ReportRepository } from "../repositories/report.repository";

export interface OverviewReport {
    summary: {
        totalRevenue: number;
        totalOrders: number;
        newUsers: number;
        returnCancelRate: number;
    };
    revenueByMonth: Array<{ month: number; revenue: number; orders: number }>;
    topProducts: Array<{ name: string; sold: number }>;
    categoryRevenue: Array<{ name: string; value: number }>;
    orderStatusBreakdown: Array<{ name: string; value: number }>;
    newUsersByMonth: Array<{ month: number; users: number }>;
}

export class ReportService {
    private reportRepo: ReportRepository;

    constructor() {
        this.reportRepo = new ReportRepository();
    }

    /**
     * Lấy toàn bộ data cho trang Overview trong 1 lần gọi
     * FE chỉ cần gọi GET /api/admin/reports/overview?year=2024
     */
    async getOverview(year?: number): Promise<OverviewReport> {
        const targetYear = year ?? new Date().getFullYear();

        // Chạy song song tất cả queries để tối ưu performance
        const [
            summary,
            newUsers,
            returnCancelRate,
            revenueByMonth,
            topProducts,
            categoryRevenue,
            orderStatusBreakdown,
            newUsersByMonth,
        ] = await Promise.all([
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

    async getSummary(year?: number) {
        const targetYear = year ?? new Date().getFullYear();
        const [summary, newUsers, returnCancelRate] = await Promise.all([
            this.reportRepo.getAnnualSummary(targetYear),
            this.reportRepo.getNewUsersCount(6),
            this.reportRepo.getReturnCancelRate(targetYear),
        ]);
        return { ...summary, newUsers, returnCancelRate };
    }

    async getRevenueByMonth(year?: number) {
        return this.reportRepo.getRevenueByMonth(year ?? new Date().getFullYear());
    }

    async getTopProducts(limit?: number) {
        return this.reportRepo.getTopProducts(limit ?? 5);
    }

    async getCategoryRevenue() {
        return this.reportRepo.getRevenueByCategory();
    }

    async getOrderStatusBreakdown() {
        return this.reportRepo.getOrderStatusBreakdown();
    }

    async getNewUsersByMonth(months?: number) {
        return this.reportRepo.getNewUsersByMonth(months ?? 6);
    }
}