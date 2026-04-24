"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItemRepository = void 0;
// repositories/orderItem.repository.ts
const baseRepository_1 = require("./baseRepository");
const orderItem_model_1 = require("../models/orderItem.model");
class OrderItemRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = orderItem_model_1.OrderItem;
    }
    /**
     * Tìm tất cả items của một đơn hàng.
     */
    async findByOrderId(orderId) {
        return this.findAll({
            where: {
                order_id: orderId
            },
            include: ['variant'] // Bao gồm thông tin variant
        });
    }
    /**
     * Tìm items theo variant_id.
     */
    async findByVariantId(variantId) {
        return this.findAll({
            where: {
                variant_id: variantId
            },
            include: ['order']
        });
    }
    /**
     * Tìm một item cụ thể trong đơn hàng.
     */
    async findByOrderIdAndVariantId(orderId, variantId) {
        return this.findOne({
            where: {
                order_id: orderId,
                variant_id: variantId
            }
        });
    }
    /**
     * Cập nhật số lượng của một item.
     */
    async updateQuantity(itemId, quantity) {
        const [affectedCount] = await this.updateByCondition({ id: itemId }, { quantity: quantity });
        return affectedCount > 0;
    }
    /**
     * Xóa tất cả items của một đơn hàng.
     */
    async deleteByOrderId(orderId) {
        return this.model.destroy({
            where: { order_id: orderId },
            ...this.getTransactionOption()
        });
    }
    /**
     * Đếm số lượng items trong đơn hàng.
     */
    async countByOrderId(orderId) {
        return this.count({
            where: {
                order_id: orderId
            }
        });
    }
    /**
     * Tính tổng giá trị của tất cả items trong đơn hàng.
     */
    async getTotalPriceByOrderId(orderId) {
        const items = await this.findByOrderId(orderId);
        return items.reduce((sum, item) => sum + (item.quantity * Number(item.price_per_unit)), 0);
    }
    /**
     * Lấy thống kê variant được mua nhiều nhất.
     */
    async getMostPurchasedVariants(limit = 10) {
        const sequelize = this.model.sequelize;
        if (!sequelize) {
            throw new Error('Sequelize instance is not available');
        }
        const results = await this.model.findAll({
            attributes: [
                'variant_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
                [sequelize.fn('COUNT', sequelize.col('order_id')), 'total_orders']
            ],
            group: ['variant_id'],
            order: [[sequelize.literal('total_quantity'), 'DESC']],
            limit: limit,
            raw: true,
            ...this.getTransactionOption()
        });
        return results;
    }
}
exports.OrderItemRepository = OrderItemRepository;
//# sourceMappingURL=orderItem.repositpry.js.map