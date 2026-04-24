"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteService = void 0;
class FavoriteService {
    /**
     * Lấy danh sách sản phẩm yêu thích của user
     */
    async getAllfavorite(uow, userId) {
        return uow.favorite.findByUserId(userId);
    }
    /**
     * Thêm sản phẩm vào danh sách yêu thích hoặc khôi phục nếu đã tồn tại và bị xóa.
     * Trả về true nếu thêm/khôi phục thành công, false nếu đã tồn tại.
     */
    async toggleFavorite(uow, userId, productId) {
        // 1. Kiểm tra mục yêu thích hiện tại (chưa bị xóa)
        const existingActiveFavorite = await uow.favorite.findOneByUserIdAndProductId(userId, productId);
        if (existingActiveFavorite) {
            // Đã tồn tại -> Thực hiện xóa (soft delete)
            const deleted = await uow.favorite.softDelete(existingActiveFavorite.favorite_id);
            if (!deleted)
                throw new Error("Failed to remove favorite.");
            return "REMOVED";
        }
        // 3. Tạo mới nếu chưa từng tồn tại
        const newFavoriteData = {
            user_id: userId,
            product_id: productId,
            is_deleted: false,
        };
        return uow.favorite.create(newFavoriteData);
    }
}
exports.FavoriteService = FavoriteService;
//# sourceMappingURL=favorite.service.js.map