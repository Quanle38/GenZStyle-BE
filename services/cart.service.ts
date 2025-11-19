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
    async getOrCreateCart(uow: UnitOfWork, userId: string): Promise<Cart> {
        let cart = await uow.cart.findActiveCartByUserId(userId);

        if (!cart) {
            // 1. Tạo giỏ hàng mới (ghi vào DB)
            await uow.cart.createNewCart(userId); 
            
            // 2. ✅ TẢI LẠI giỏ hàng bằng findActiveCartByUserId
            // Điều này đảm bảo đối tượng Cart có đầy đủ các quan hệ (items: [])
            const loadedCart = await uow.cart.findActiveCartByUserId(userId); 
            
            if (!loadedCart) {
                 // Lỗi nghiêm trọng: vừa tạo xong lại không tìm thấy
                 throw new Error("Failed to load newly created cart.");
            }
            cart = loadedCart;
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
    async removeItemFromCart(uow: UnitOfWork, cartItemId: number): Promise<boolean> {
        const deletedCount = await uow.cartItem.delete(cartItemId);
        return deletedCount > 0; 
    }
    
    /**
     * Xóa toàn bộ giỏ hàng (XÓA CỨNG Cart và tất cả CartItems).
     */
    async clearCart(uow: UnitOfWork, cartId: string): Promise<void> {
        await uow.cartItem.deleteByCondition({ cart_id: cartId });
        await uow.cart.delete(cartId);
    }
}