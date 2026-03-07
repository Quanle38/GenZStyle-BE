// services/cart.service.ts
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { Cart } from "../models/cart.model";
import { CartItem } from "../models/cartItem.model";
import { ProductVariant } from "../models/productVariant.model";


export class CartService {

    /**
     * Lấy giỏ hàng hiện tại của người dùng, nếu chưa có thì tạo mới.
     * Đảm bảo đối tượng Cart trả về LUÔN CÓ quan hệ 'items'.
     * @param uow UnitOfWork
     * @param userId ID người dùng
     * @returns Giỏ hàng (Cart)
     */
    // services/cart.service.ts
    async getOrCreateCart(uow: UnitOfWork, userId: string): Promise<Cart> {
        let cart = await uow.cart.findActiveCartByUserId(userId);

        if (!cart) {
            await uow.cart.createNewCart(userId);

            const loadedCart = await uow.cart.findActiveCartByUserId(userId);
            if (!loadedCart) {
                throw new Error("Failed to load newly created cart.");
            }
            cart = loadedCart;
        }

        // 🔥 SYNC SUMMARY (QUAN TRỌNG)
        const summary = await this.syncCartSummary(uow, cart.id);
        cart.amount = summary.amount;
        cart.total_price = summary.total_price;

        // ===== attach variants như bạn đang làm =====
        if (cart.items && cart.items.length > 0) {
            const productIds = [...new Set(cart.items.map(i => i.variant!.product_id))];

            const allVariants = await uow.productVariants.findAll({
                where: { product_id: productIds },
                attributes: ['id', 'product_id', 'size', 'color', 'stock', 'price', 'image']
            });

            const variantMap = new Map<string, ProductVariant[]>();
            for (const v of allVariants) {
                if (!variantMap.has(v.product_id)) {
                    variantMap.set(v.product_id, []);
                }
                variantMap.get(v.product_id)!.push(v);
            }

            for (const item of cart.items) {
                item.setDataValue(
                    'variants',
                    variantMap.get(item.variant!.product_id) || []
                );
            }
        }

        return cart;
    }



    /**
     * Thêm một sản phẩm vào giỏ hàng hoặc cập nhật số lượng nếu đã tồn tại.
     * @param uow UnitOfWork
     * @param userId ID người dùng
     * @param variantId ID của ProductVariant
     * @param quantity Số lượng cần thêm
     * @returns CartItem đã được tạo/cập nhật (chỉ đối tượng CartItem, không phải Cart đầy đủ)
     */
    async addItemToCart(uow: UnitOfWork, userId: string, variantId: string, quantity: number): Promise<CartItem> {
        // 1. Đảm bảo giỏ hàng tồn tại
        // Lệnh này KHÔNG cần transaction, nhưng nếu gọi bên trong transaction, nó sẽ dùng transaction đó.
        const cart = await this.getOrCreateCart(uow, userId);

        // 2. LẤY GIÁ BÁN HIỆN TẠI
        const variant = await uow.productVariants.findById(variantId);
        if (!variant) {
            throw new Error("Product variant not found.");
        }
        const pricePerUnit = variant.price;

        // 3. Kiểm tra item đã tồn tại
        const existingItem = await uow.cartItem.findActiveItemByCartAndVariant(cart.id, variantId);

        if (existingItem) {
            // Cập nhật
            const newQuantity = existingItem.quantity + quantity;
            const newTotalPrice = pricePerUnit * newQuantity;

            await uow.cartItem.update(
                existingItem.id,
                {
                    quantity: newQuantity,
                    total_price: newTotalPrice
                }
            );

            // ✅ KHẮC PHỤC LỖI TRANSACTION: Cập nhật đối tượng trong bộ nhớ
            existingItem.quantity = newQuantity;
            existingItem.total_price = newTotalPrice;
            const summary = await uow.cart.recalcCart(cart.id);

            await uow.cart.update(cart.id, {
                amount: summary.amount,
                total_price: summary.total_price
            });
            return existingItem;

        } else {
            // Tạo mới
            const totalPrice = pricePerUnit * quantity;
            const newCartItem = await uow.cartItem.create({
                cart_id: cart.id,
                variant_id: variantId,
                quantity: quantity,
                total_price: totalPrice,
            });
            return newCartItem;
        }
    }

    /**
     * Xóa một mặt hàng khỏi giỏ hàng (XÓA CỨNG).
     */
    async removeItemFromCart(
        uow: UnitOfWork,
        cartItemId: number
    ): Promise<boolean> {

        // 1. Lấy item trước khi xóa
        const item = await uow.cartItem.findById(cartItemId);
        if (!item) return false;

        // 2. Xóa item
        const deletedCount = await uow.cartItem.delete(cartItemId);
        if (deletedCount === 0) return false;

        // 3. Recalc + update cart
        await this.syncCartSummary(uow, item.cart_id);

        return true;
    }


    /**
     * Xóa toàn bộ giỏ hàng (XÓA CỨNG Cart và tất cả CartItems).
     */
    async clearCart(uow: UnitOfWork, cartId: string): Promise<void> {
        await uow.cartItem.deleteByCondition({ cart_id: cartId });
        await uow.cart.delete(cartId);
    }

    async updateCartItem(
        uow: UnitOfWork,
        cartItemId: number,
        payload: {
            quantity?: number;
            variantId?: string;
        }
    ): Promise<CartItem> {

        // 1. Lấy CartItem
        const item = await uow.cartItem.findById(cartItemId);
        if (!item) {
            throw new Error("Cart item not found");
        }

        let variant = await uow.productVariants.findById(item.variant_id);
        if (!variant) {
            throw new Error("Product variant not found");
        }

        // 2. Nếu đổi variant (size / color)
        if (payload.variantId && payload.variantId !== item.variant_id) {
            const newVariant = await uow.productVariants.findById(payload.variantId);
            if (!newVariant) {
                throw new Error("New variant not found");
            }

            variant = newVariant;
            item.variant_id = newVariant.id;
        }

        // 3. Quantity
        const quantity =
            payload.quantity !== undefined
                ? payload.quantity
                : item.quantity;

        if (quantity < 1) {
            throw new Error("Quantity must be >= 1");
        }

        if (quantity > variant.stock) {
            throw new Error("Quantity exceeds stock");
        }

        // 4. Tính lại total_price
        const totalPrice = quantity * Number(variant.price);

        // 5. Update DB
        await uow.cartItem.update(cartItemId, {
            variant_id: item.variant_id,
            quantity,
            total_price: totalPrice
        });

        // 6. Sync cart summary
        await this.syncCartSummary(uow, item.cart_id);

        // 7. Update object trong memory
        item.quantity = quantity;
        item.total_price = totalPrice;

        return item;
    }


    private async syncCartSummary(uow: UnitOfWork, cartId: string) {
        const summary = await uow.cart.recalcCart(cartId);

        await uow.cart.update(cartId, {
            amount: summary.amount,
            total_price: summary.total_price
        });

        return summary;
    }

}