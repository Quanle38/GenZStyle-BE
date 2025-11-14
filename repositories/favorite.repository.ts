// repositories/favorite.repository.ts
import { BaseRepository } from "./baseRepository";
import { Favorite } from "../models/favorite.model"; // Giả định đã export models/index.ts
import { Op } from "sequelize";

export class FavoriteRepository extends BaseRepository<Favorite> {
    protected model = Favorite;

    /**
     * Tìm tất cả sản phẩm yêu thích của một user.
     */
    async findByUserId(userId: string): Promise<Favorite[]> {
        return this.findAll({
            where: {
                user_id: userId,
                is_deleted: false
            },
            include: ['product'], // Bao gồm thông tin sản phẩm
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Kiểm tra xem một sản phẩm đã được user đó thêm vào yêu thích chưa (chưa bị xóa).
     */
    async findOneByUserIdAndProductId(userId: string, productId: string): Promise<Favorite | null> {
        return this.findOne({
            where: {
                user_id: userId,
                product_id: productId,
                is_deleted: false
            }
        });
    }

    /**
     * Xóa mềm (soft delete) một mục yêu thích.
     */
    async softDeleteByCondition(userId: string, productId: string): Promise<boolean> {
        const [affectedCount] = await this.updateByCondition(
            { user_id: userId, product_id: productId, is_deleted: false },
            { is_deleted: true }
        );
        return affectedCount > 0;
    }

    /**
     * Khôi phục (restore) một mục yêu thích đã xóa mềm.
     */
    async restoreByCondition(userId: string, productId: string): Promise<boolean> {
        const [affectedCount] = await this.updateByCondition(
            { user_id: userId, product_id: productId, is_deleted: true },
            { is_deleted: false }
        );
        return affectedCount > 0;
    }
}