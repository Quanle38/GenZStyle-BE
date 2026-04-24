"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteRepository = void 0;
// repositories/favorite.repository.ts
const baseRepository_1 = require("./baseRepository");
const favorite_model_1 = require("../models/favorite.model"); // Giả định đã export models/index.ts
class FavoriteRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = favorite_model_1.Favorite;
    }
    /**
     * Tìm tất cả sản phẩm yêu thích của một user.
     */
    async findByUserId(userId) {
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
    async findOneByUserIdAndProductId(userId, productId) {
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
    async softDeleteByCondition(userId, productId) {
        const [affectedCount] = await this.updateByCondition({ user_id: userId, product_id: productId, is_deleted: false }, { is_deleted: true });
        return affectedCount > 0;
    }
    /**
     * Khôi phục (restore) một mục yêu thích đã xóa mềm.
     */
    async restoreByCondition(userId, productId) {
        const [affectedCount] = await this.updateByCondition({ user_id: userId, product_id: productId, is_deleted: true }, { is_deleted: false });
        return affectedCount > 0;
    }
}
exports.FavoriteRepository = FavoriteRepository;
//# sourceMappingURL=favorite.repository.js.map