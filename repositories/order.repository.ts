// repositories/order.repository.ts
import { BaseRepository } from "./baseRepository";

import { Op } from "sequelize";
import { OrderItem, Product, ProductVariant, Order } from "../models";

export class OrderRepository extends BaseRepository<Order> {
    // Ép kiểu chắc chắn dùng Model đã được bind associations
    protected model = Order;

    /**
     * Tìm tất cả đơn hàng của một user.
     */
    async findByUserId(userId: string): Promise<Order[]> {
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
    async findByStatus(status: string): Promise<Order[]> {
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
    async findByUserIdAndStatus(userId: string, status: string): Promise<Order[]> {
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
    async updateStatus(orderId: string, status: string): Promise<boolean> {
        const [affectedCount] = await this.updateByCondition(
            { id: orderId },
            { status: status }
        );
        return affectedCount > 0;
    }

    /**
     * Tìm đơn hàng theo cart_id.
     */
    async findByCartId(cartId: string): Promise<Order | null> {
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
    async countByUserId(userId: string): Promise<number> {
        return this.count({
            where: {
                user_id: userId
            }
        });
    }

    /**
     * Lấy tổng giá trị đơn hàng của user.
     */
    async getTotalPriceByUserId(userId: string): Promise<number> {
        const orders = await this.findAll({
            where: {
                user_id: userId,
                status: {
                    [Op.in]: ['completed', 'delivered'] // Chỉ tính đơn hàng hoàn thành
                }
            },
            attributes: ['total_price']
        });
        
        return orders.reduce((sum, order) => sum + order.total_price, 0);
    }

    /**
     * Tìm đơn hàng trong khoảng thời gian.
     */
    async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
        return this.findAll({
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: ['orderItems'],
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Tìm đơn hàng của user trong khoảng thời gian.
     */
    async findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Order[]> {
        return this.findAll({
            where: {
                user_id: userId,
                created_at: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: ['orderItems'],
            order: [['created_at', 'DESC']]
        });
    }


// repositories/order.repository.ts

async findHistoryByUserId(userId: string): Promise<Order[]> {
        return Order.findAll({ // Dùng trực tiếp Class Order từ import trên
            where: { user_id: userId },
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [
                        {
                            model: ProductVariant,
                            as: 'variant',
                            include: [
                                {
                                    model: Product,
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