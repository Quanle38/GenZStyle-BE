// repositories/cart.repository.ts
import { BaseRepository } from "./baseRepository"
import { Cart } from "../models/cart.model";
import { CartItem, Product, ProductVariant } from "../models";
import { CartCoupon } from "../models/cartCoupon.model";
import { Coupon } from "../models/coupon.model";
import { Op, Sequelize } from "sequelize";

export class CartRepository extends BaseRepository<Cart> {
    protected model = Cart;

    async findActiveCartByUserId(userId: string): Promise<Cart | null> {
        return this.model.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    required: false,
                    attributes: [
                        'id',
                        'quantity',
                        'total_price',
                        [
                            Sequelize.literal(`"items->variant->product"."name"`),
                            'product_name'
                        ]
                    ],
                    include: [
                        {
                            model: ProductVariant,
                            as: 'variant',
                            attributes: ['id', 'product_id', 'size', 'color', 'price', 'stock', 'image'],
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
                                    attributes: []
                                }
                            ]
                        }
                    ]
                },
                // ✅ THÊM MỚI: include CartCoupon kèm Coupon
                {
                    model: CartCoupon,
                    as: 'cartCoupons',
                    required: false,
                    include: [
                        {
                            model: Coupon,
                            as: 'coupon',
                            attributes: [
                                'id', 'code', 'type', 'value',
                                'max_discount', 'start_time', 'end_time'
                            ]
                        }
                    ]
                }
            ],
            order: [[{ model: CartItem, as: 'items' }, 'id', 'ASC']],
            ...this.getTransactionOption()
        });
    }

    async createNewCart(userId: string): Promise<Cart> {
        return this.create({ user_id: userId });
    }

    async recalcCart(cartId: string) {
        const result = await CartItem.findOne({
            where: { cart_id: cartId },
            attributes: [
                [Cart.sequelize!.fn('SUM', Cart.sequelize!.col('quantity')), 'amount'],
                [Cart.sequelize!.fn('SUM', Cart.sequelize!.col('total_price')), 'total_price']
            ],
            raw: true
        }) as unknown as {
            amount: string | number | null;
            total_price: string | number | null;
        };

        return {
            amount: Number(result?.amount ?? 0),
            total_price: Number(result?.total_price ?? 0)
        };
    }
}