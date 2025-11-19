// repositories/cart.repository.ts
import { BaseRepository } from "./baseRepository"
import { Cart } from "../models/cart.model";
import { CartItem, ProductVariant } from "../models"; 
import { Op } from "sequelize";

export class CartRepository extends BaseRepository<Cart> {
    protected model = Cart;

    /**
     * Tìm giỏ hàng (hiện tại) của người dùng, bao gồm cả các mặt hàng.
     */
    async findActiveCartByUserId(userId: string): Promise<Cart | null> {
        return this.model.findOne({
            where: {
                user_id: userId
                // KHÔNG CÓ is_deleted
            },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    required: false,
                    // KHÔNG CÓ where: { is_deleted: false }
                    include: [
                        {
                            model: ProductVariant,
                            as: 'variant',
                            attributes: ['id', 'product_id', 'size', 'color','price','stock']
                        }
                    ]
                }
            ],
            order: [[{ model: CartItem, as: 'items' }, 'id', 'ASC']],
            // ✅ SỬ DỤNG TRANSACTION CÓ ĐIỀU KIỆN
            ...this.getTransactionOption()
        });
    }

    /**
     * Tạo một giỏ hàng mới cho người dùng.
     */
    async createNewCart(userId: string): Promise<Cart> {
        return this.create({ user_id: userId });
    }
    
    // Giả định BaseRepository có hàm delete(id: string | number)
}