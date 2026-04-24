"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantRepository = void 0;
const models_1 = require("../models");
const baseRepository_1 = require("./baseRepository");
class ProductVariantRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = models_1.ProductVariant;
    }
    async findByProduct(productId) {
        return this.findAll({
            where: { product_id: productId, is_deleted: false },
            order: [["created_at", "DESC"]],
        }, this.transaction);
    }
    async softDeleteVariant(id) {
        const [affectedCount] = await this.update(id, {
            is_deleted: true,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }
    async restoreVariant(id) {
        const [affectedCount] = await this.update(id, {
            is_deleted: false,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }
    async findByCompositeKey({ price, color, size }) {
        return this.findOne({
            where: { price: price, color: color, size: size, is_deleted: false }
        });
    }
    async findAllWithPagination(page, limit) {
        const offset = (page - 1) * limit;
        return this.model.findAndCountAll({
            where: { is_deleted: false },
            limit,
            offset,
            order: [["created_at", "DESC"]],
            transaction: this.transaction,
        });
    }
}
exports.ProductVariantRepository = ProductVariantRepository;
//# sourceMappingURL=productVariant.repository.js.map