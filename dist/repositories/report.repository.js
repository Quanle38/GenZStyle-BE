"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRepository = void 0;
// repositories/report.repository.ts
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
const order_model_1 = require("../models/order.model");
const user_model_1 = require("../models/user.model");
const payment_model_1 = require("../models/payment.model");
class ReportRepository {
    // ─── 1. SUMMARY STATS ────────────────────────────────────────
    async getAnnualSummary(year) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        const revenueResult = await payment_model_1.Payment.findOne({
            attributes: [[(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("amount")), "totalRevenue"]],
            include: [
                {
                    model: order_model_1.Order,
                    as: "order",
                    attributes: [],
                    where: {
                        status: { [sequelize_1.Op.in]: ["PAID", "COMPLETED"] },
                        created_at: { [sequelize_1.Op.between]: [startDate, endDate] },
                    },
                    required: true,
                },
            ],
            raw: true,
        });
        const totalOrders = await order_model_1.Order.count({
            where: {
                created_at: { [sequelize_1.Op.between]: [startDate, endDate] },
            },
        });
        return {
            totalRevenue: parseFloat(revenueResult?.totalRevenue ?? "0") || 0,
            totalOrders,
        };
    }
    // ✅ Fix: role = 'USER' (không phải 'customer')
    async getNewUsersCount(months = 6) {
        const since = new Date();
        since.setMonth(since.getMonth() - months);
        return user_model_1.User.count({
            where: {
                created_at: { [sequelize_1.Op.gte]: since },
                role: "USER",
                is_deleted: false,
            },
        });
    }
    async getReturnCancelRate(year) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        const [total, cancelled] = await Promise.all([
            order_model_1.Order.count({
                where: { created_at: { [sequelize_1.Op.between]: [startDate, endDate] } },
            }),
            order_model_1.Order.count({
                where: {
                    status: "CANCLED",
                    created_at: { [sequelize_1.Op.between]: [startDate, endDate] },
                },
            }),
        ]);
        if (total === 0)
            return 0;
        return Math.round((cancelled / total) * 100);
    }
    // ─── 2. REVENUE & ORDERS BY MONTH ────────────────────────────
    async getRevenueByMonth(year) {
        const rows = await connection_1.sequelize.query(`
            SELECT
                EXTRACT(MONTH FROM o.created_at)::int AS month,
                COALESCE(SUM(p.amount), 0)            AS revenue,
                COUNT(DISTINCT o.id)::int             AS orders
            FROM "Orders" o
            LEFT JOIN "Payments" p ON p.order_id = o.id
            WHERE EXTRACT(YEAR FROM o.created_at) = :year
              AND UPPER(o.status) IN ('PAID', 'COMPLETED')
            GROUP BY EXTRACT(MONTH FROM o.created_at)
            ORDER BY month ASC
            `, {
            replacements: { year },
            type: sequelize_1.QueryTypes.SELECT,
        });
        const map = new Map();
        rows.forEach((r) => {
            map.set(Number(r.month), {
                revenue: parseFloat(r.revenue) || 0,
                orders: Number(r.orders) || 0,
            });
        });
        return Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            revenue: map.get(i + 1)?.revenue ?? 0,
            orders: map.get(i + 1)?.orders ?? 0,
        }));
    }
    // ─── 3. TOP SELLING PRODUCTS ──────────────────────────────────
    async getTopProducts(limit = 5) {
        const rows = await connection_1.sequelize.query(`
            SELECT
                pr.name,
                SUM(oi.quantity)::int AS sold
            FROM "OrderItems" oi
            JOIN "Variants" v  ON v.id  = oi.variant_id
            JOIN "Products" pr ON pr.id = v.product_id
            JOIN "Orders"   o  ON o.id  = oi.order_id
            WHERE UPPER(o.status) IN ('PAID', 'COMPLETED')
              AND pr.is_deleted = false
            GROUP BY pr.id, pr.name
            ORDER BY sold DESC
            LIMIT :limit
            `, {
            replacements: { limit },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return rows.map((r) => ({
            name: r.name,
            sold: Number(r.sold) || 0,
        }));
    }
    // ─── 4. REVENUE BY CATEGORY ───────────────────────────────────
    async getRevenueByCategory() {
        const rows = await connection_1.sequelize.query(`
            SELECT
                pr.category                          AS name,
                SUM(oi.quantity * oi.price_per_unit) AS revenue
            FROM "OrderItems" oi
            JOIN "Variants" v  ON v.id  = oi.variant_id
            JOIN "Products" pr ON pr.id = v.product_id
            JOIN "Orders"   o  ON o.id  = oi.order_id
            WHERE UPPER(o.status) IN ('PAID', 'COMPLETED')
              AND pr.is_deleted = false
              AND pr.category IS NOT NULL
            GROUP BY pr.category
            ORDER BY revenue DESC
            `, { type: sequelize_1.QueryTypes.SELECT });
        const total = rows.reduce((s, r) => s + (parseFloat(r.revenue) || 0), 0);
        if (total === 0)
            return [];
        return rows.map((r) => ({
            name: r.name,
            value: Math.round((parseFloat(r.revenue) / total) * 100),
        }));
    }
    // ─── 5. ORDER STATUS BREAKDOWN ────────────────────────────────
    // ✅ Fix: UPPER(status) để normalize "pending" và "PENDING" về cùng 1 nhóm
    async getOrderStatusBreakdown() {
        const rows = await connection_1.sequelize.query(`
            SELECT
                UPPER(status)   AS name,
                COUNT(*)::int   AS total
            FROM "Orders"
            GROUP BY UPPER(status)
            `, { type: sequelize_1.QueryTypes.SELECT });
        const grandTotal = rows.reduce((s, r) => s + Number(r.total), 0);
        if (grandTotal === 0)
            return [];
        const labelMap = {
            COMPLETED: "Completed",
            PAID: "Processing",
            CANCLED: "Cancelled",
            PENDING: "Pending",
        };
        return rows.map((r) => ({
            name: labelMap[r.name] ?? r.name,
            value: Math.round((Number(r.total) / grandTotal) * 100),
        }));
    }
    // ─── 6. NEW USERS BY MONTH ────────────────────────────────────
    // ✅ Fix: role = 'USER' (không phải 'customer')
    async getNewUsersByMonth(months = 6) {
        const since = new Date();
        since.setMonth(since.getMonth() - months);
        const rows = await connection_1.sequelize.query(`
            SELECT
                EXTRACT(MONTH FROM created_at)::int AS month,
                EXTRACT(YEAR  FROM created_at)::int AS year,
                COUNT(*)::int                       AS users
            FROM "Users"
            WHERE created_at >= :since
              AND UPPER(role) = 'USER'
              AND is_deleted  = false
            GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
            ORDER BY year ASC, month ASC
            `, {
            replacements: { since },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return rows.map((r) => ({
            month: Number(r.month),
            users: Number(r.users) || 0,
        }));
    }
}
exports.ReportRepository = ReportRepository;
//# sourceMappingURL=report.repository.js.map