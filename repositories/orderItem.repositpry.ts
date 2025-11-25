// repositories/orderItem.repository.ts
import { BaseRepository } from "./baseRepository";
import { OrderItem } from "../models/orderItem.model";
import { Op } from "sequelize";

export class OrderItemRepository extends BaseRepository<OrderItem> {
    protected model = OrderItem;

    /**
     * Tìm tất cả items của một đơn hàng.
     */
    async findByOrderId(orderId: string): Promise<OrderItem[]> {
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
    async findByVariantId(variantId: string): Promise<OrderItem[]> {
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
    async findByOrderIdAndVariantId(orderId: string, variantId: string): Promise<OrderItem | null> {
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
    async updateQuantity(itemId: number, quantity: number): Promise<boolean> {
        const [affectedCount] = await this.updateByCondition(
            { id: itemId },
            { quantity: quantity }
        );
        return affectedCount > 0;
    }

    /**
     * Xóa tất cả items của một đơn hàng.
     */
    async deleteByOrderId(orderId: string): Promise<number> {
        return this.model.destroy({
            where: { order_id: orderId },
            ...this.getTransactionOption()
        });
    }

    /**
     * Đếm số lượng items trong đơn hàng.
     */
    async countByOrderId(orderId: string): Promise<number> {
        return this.count({
            where: {
                order_id: orderId
            }
        });
    }

    /**
     * Tính tổng giá trị của tất cả items trong đơn hàng.
     */
    async getTotalPriceByOrderId(orderId: string): Promise<number> {
        const items = await this.findByOrderId(orderId);
        return items.reduce((sum, item) => sum + (item.quantity * Number(item.price_per_unit)), 0);
    }

    /**
     * Lấy thống kê variant được mua nhiều nhất.
     */
    async getMostPurchasedVariants(limit: number = 10): Promise<Array<{
        variant_id: string;
        total_quantity: number;
        total_orders: number;
    }>> {
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
        }) as unknown as Array<{
            variant_id: string;
            total_quantity: number;
            total_orders: number;
        }>;

        return results;
    }
}