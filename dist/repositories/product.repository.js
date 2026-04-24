"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const models_1 = require("../models");
const baseRepository_1 = require("./baseRepository");
const sequelize_1 = require("sequelize");
class ProductRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = models_1.Product;
    }
    async findByIdWithVariants(id, excludeFields = []) {
        return this.model.findByPk(id, {
            attributes: { exclude: excludeFields },
            include: [{ model: models_1.ProductVariant, as: "variants", where: { is_deleted: false }, required: false }],
            transaction: this.transaction,
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
    // === HÀM TÌM KIẾM TỔNG HỢP ===
    async searchProductsAdvanced(filters, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const where = { is_deleted: false };
        const variantWhere = { is_deleted: false };
        if (filters.name)
            where.name = { [sequelize_1.Op.like]: `%${filters.name}%` };
        if (filters.brand)
            where.brand = { [sequelize_1.Op.like]: `%${filters.brand}%` };
        if (filters.minPrice !== undefined && filters.maxPrice !== undefined)
            where.base_price = { [sequelize_1.Op.between]: [filters.minPrice, filters.maxPrice] };
        else if (filters.minPrice !== undefined)
            where.base_price = { [sequelize_1.Op.gte]: filters.minPrice };
        else if (filters.maxPrice !== undefined)
            where.base_price = { [sequelize_1.Op.lte]: filters.maxPrice };
        if (filters.size !== undefined)
            variantWhere.size = filters.size;
        if (filters.color)
            variantWhere.color = filters.color;
        return this.model.findAndCountAll({
            where,
            include: [
                {
                    model: models_1.ProductVariant,
                    as: "variants",
                    where: Object.keys(variantWhere).length > 1 ? variantWhere : undefined,
                    required: Object.keys(variantWhere).length > 1,
                },
            ],
            limit,
            offset,
            order: [["created_at", "DESC"]],
            transaction: this.transaction,
        });
    }
}
exports.ProductRepository = ProductRepository;
//# sourceMappingURL=product.repository.js.map