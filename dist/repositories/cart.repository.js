"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRepository = void 0;
// repositories/cart.repository.ts
const baseRepository_1 = require("./baseRepository");
const cart_model_1 = require("../models/cart.model");
const models_1 = require("../models");
const cartCoupon_model_1 = require("../models/cartCoupon.model");
const coupon_model_1 = require("../models/coupon.model");
const sequelize_1 = require("sequelize");
class CartRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = cart_model_1.Cart;
    }
    async findActiveCartByUserId(userId) {
        return this.model.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: models_1.CartItem,
                    as: 'items',
                    required: false,
                    attributes: [
                        'id',
                        'quantity',
                        'total_price',
                        [
                            sequelize_1.Sequelize.literal(`"items->variant->product"."name"`),
                            'product_name'
                        ]
                    ],
                    include: [
                        {
                            model: models_1.ProductVariant,
                            as: 'variant',
                            attributes: ['id', 'product_id', 'size', 'color', 'price', 'stock', 'image'],
                            include: [
                                {
                                    model: models_1.Product,
                                    as: 'product',
                                    attributes: []
                                }
                            ]
                        }
                    ]
                },
                // ✅ THÊM MỚI: include CartCoupon kèm Coupon
                {
                    model: cartCoupon_model_1.CartCoupon,
                    as: 'cartCoupons',
                    required: false,
                    include: [
                        {
                            model: coupon_model_1.Coupon,
                            as: 'coupon',
                            attributes: [
                                'id', 'code', 'type', 'value',
                                'max_discount', 'start_time', 'end_time'
                            ]
                        }
                    ]
                }
            ],
            order: [[{ model: models_1.CartItem, as: 'items' }, 'id', 'ASC']],
            ...this.getTransactionOption()
        });
    }
    async createNewCart(userId) {
        return this.create({ user_id: userId });
    }
    async recalcCart(cartId) {
        const result = await models_1.CartItem.findOne({
            where: { cart_id: cartId },
            attributes: [
                [cart_model_1.Cart.sequelize.fn('SUM', cart_model_1.Cart.sequelize.col('quantity')), 'amount'],
                [cart_model_1.Cart.sequelize.fn('SUM', cart_model_1.Cart.sequelize.col('total_price')), 'total_price']
            ],
            raw: true
        });
        return {
            amount: Number(result?.amount ?? 0),
            total_price: Number(result?.total_price ?? 0)
        };
    }
}
exports.CartRepository = CartRepository;
//# sourceMappingURL=cart.repository.js.map