"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
// repositories/order.repository.ts
const baseRepository_1 = require("./baseRepository");
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
class OrderRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        // Ép kiểu chắc chắn dùng Model đã được bind associations
        this.model = models_1.Order;
    }
    /**
     * Tìm tất cả đơn hàng của một user.
     */
    async findByUserId(userId) {
        return this.findAll({
            where: {
                user_id: userId
            },
            include: ['orderItems'], // Bao gồm thông tin các sản phẩm trong đơn hàng
            order: [['created_at', 'DESC']]
        });
    }
    /**
     * Tìm đơn hàng theo trạng thái.
     */
    async findByStatus(status) {
        return this.findAll({
            where: {
                status: status
            },
            include: ['orderItems'],
            order: [['created_at', 'DESC']]
        });
    }
    /**
     * Tìm đơn hàng của user theo trạng thái.
     */
    async findByUserIdAndStatus(userId, status) {
        return this.findAll({
            where: {
                user_id: userId,
                status: status
            },
            include: ['orderItems'],
            order: [['created_at', 'DESC']]
        });
    }
    /**
     * Cập nhật trạng thái đơn hàng.
     */
    async updateStatus(orderId, status) {
        const [affectedCount] = await this.updateByCondition({ id: orderId }, { status: status });
        return affectedCount > 0;
    }
    /**
     * Tìm đơn hàng theo cart_id.
     */
    async findByCartId(cartId) {
        return this.findOne({
            where: {
                cart_id: cartId
            },
            include: ['orderItems']
        });
    }
    /**
     * Lấy tổng số đơn hàng của user.
     */
    async countByUserId(userId) {
        return this.count({
            where: {
                user_id: userId
            }
        });
    }
    /**
     * Lấy tổng giá trị đơn hàng của user.
     */
    async getTotalPriceByUserId(userId) {
        const orders = await this.findAll({
            where: {
                user_id: userId,
                status: {
                    [sequelize_1.Op.in]: ['completed', 'delivered'] // Chỉ tính đơn hàng hoàn thành
                }
            },
            attributes: ['total_price']
        });
        return orders.reduce((sum, order) => sum + order.total_price, 0);
    }
    /**
     * Tìm đơn hàng trong khoảng thời gian.
     */
    async findByDateRange(startDate, endDate) {
        return this.findAll({
            where: {
                created_at: {
                    [sequelize_1.Op.between]: [startDate, endDate]
                }
            },
            include: ['orderItems'],
            order: [['created_at', 'DESC']]
        });
    }
    /**
     * Tìm đơn hàng của user trong khoảng thời gian.
     */
    async findByUserIdAndDateRange(userId, startDate, endDate) {
        return this.findAll({
            where: {
                user_id: userId,
                created_at: {
                    [sequelize_1.Op.between]: [startDate, endDate]
                }
            },
            include: ['orderItems'],
            order: [['created_at', 'DESC']]
        });
    }
    // repositories/order.repository.ts
    async findHistoryByUserId(userId) {
        return models_1.Order.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: models_1.OrderItem,
                    as: 'orderItems',
                    include: [
                        {
                            model: models_1.ProductVariant,
                            as: 'variant',
                            include: [
                                {
                                    model: models_1.Product,
                                    as: 'product',
                                    attributes: ['name', 'category', 'brand']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });
    }
}
exports.OrderRepository = OrderRepository;
//# sourceMappingURL=order.repository.js.map