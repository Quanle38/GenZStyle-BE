// repositories/cartItem.repository.ts
import { BaseRepository } from "./baseRepository";
import { CartItem } from "../models/cartItem.model";
import { FindOptions } from "sequelize";

export class CartItemRepository extends BaseRepository<CartItem> {
    protected model = CartItem;

    /**
     * Tìm một CartItem theo cartId và variantId.
     */
    async findActiveItemByCartAndVariant(cartId: string, variantId: string): Promise<CartItem | null> {
        const options: FindOptions<CartItem> = {
            where: {
                cart_id: cartId,
                variant_id: variantId,
                // KHÔNG CÓ is_deleted: false
            },
            // ✅ SỬ DỤNG TRANSACTION CÓ ĐIỀU KIỆN
            ...this.getTransactionOption()
        };
        return this.model.findOne(options);
    }
    
    /**
     * Xóa các items theo điều kiện (Xóa cứng). (Dùng cho clearCart)
     * @param where Điều kiện xóa
     * @returns Số lượng hàng bị xóa
     */
    async deleteByCondition(where: any): Promise<number> {
        // Hàm xóa cứng nhiều bản ghi
        return this.model.destroy({
            where: where,
            ...this.getTransactionOption()
        });
    }

    // Hàm findOneItemByCartAndVariant không cần thiết nếu Active và findOne là một
}