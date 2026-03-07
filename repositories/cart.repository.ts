// repositories/cart.repository.ts
import { BaseRepository } from "./baseRepository"
import { Cart } from "../models/cart.model";
import { CartItem, Product, ProductVariant } from "../models";
import { Op, Sequelize } from "sequelize";

export class CartRepository extends BaseRepository<Cart> {
    protected model = Cart;

    /**
     * Tìm giỏ hàng (hiện tại) của người dùng, bao gồm cả các mặt hàng.
     */
    // repositories/cart.repository.ts
    async findActiveCartByUserId(userId: string): Promise<Cart | null> {
        return this.model.findOne({
            where: {
                user_id: userId
            },
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
                            attributes: [
                                'id',
                                'product_id',
                                'size',
                                'color',
                                'price',
                                'stock',
                                'image'
                            ],
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
                                    attributes: []
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [[{ model: CartItem, as: 'items' }, 'id', 'ASC']],
            ...this.getTransactionOption()
        });
    }


    /**
     * Tạo một giỏ hàng mới cho người dùng.
     */
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


    // Giả định BaseRepository có hàm delete(id: string | number)
}