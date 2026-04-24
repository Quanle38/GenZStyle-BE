"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItemRepository = void 0;
// repositories/cartItem.repository.ts
const baseRepository_1 = require("./baseRepository");
const cartItem_model_1 = require("../models/cartItem.model");
class CartItemRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = cartItem_model_1.CartItem;
        // Hàm findOneItemByCartAndVariant không cần thiết nếu Active và findOne là một
    }
    /**
     * Tìm một CartItem theo cartId và variantId.
     */
    async findActiveItemByCartAndVariant(cartId, variantId) {
        const options = {
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
    async deleteByCondition(where) {
        // Hàm xóa cứng nhiều bản ghi
        return this.model.destroy({
            where: where,
            ...this.getTransactionOption()
        });
    }
}
exports.CartItemRepository = CartItemRepository;
//# sourceMappingURL=cartItem.repository.js.map