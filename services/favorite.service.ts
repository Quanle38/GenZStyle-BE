// services/favorite.service.ts
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { Favorite } from "../models/favorite.model";
import { FavoriteCreationAttributes } from "../models/favorite.model";

export class FavoriteService {

    /**
     * Lấy danh sách sản phẩm yêu thích của user
     */
    async getAllfavorite(uow: UnitOfWork, userId: string): Promise<Favorite[]> {
        return uow.favorite.findByUserId(userId);
    }

    /**
     * Thêm sản phẩm vào danh sách yêu thích hoặc khôi phục nếu đã tồn tại và bị xóa.
     * Trả về true nếu thêm/khôi phục thành công, false nếu đã tồn tại.
     */
    async toggleFavorite(uow: UnitOfWork, userId: string, productId: string): Promise<Favorite | "REMOVED"> {
        // 1. Kiểm tra mục yêu thích hiện tại (chưa bị xóa)
        const existingActiveFavorite = await uow.favorite.findOneByUserIdAndProductId(userId, productId);

        if (existingActiveFavorite) {
            // Đã tồn tại -> Thực hiện xóa (soft delete)
            const deleted = await uow.favorite.softDelete(existingActiveFavorite.favorite_id);
            if (!deleted) throw new Error("Failed to remove favorite.");
            return "REMOVED";
        }
        // 3. Tạo mới nếu chưa từng tồn tại
        const newFavoriteData: Partial<FavoriteCreationAttributes> = {
            user_id: userId,
            product_id: productId,
            is_deleted: false,
        };

        return uow.favorite.create(newFavoriteData);
    }
}