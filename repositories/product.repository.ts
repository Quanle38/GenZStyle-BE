import { Product, ProductVariant } from "../models";
import { BaseRepository } from "./baseRepository";
import { Op } from "sequelize";

export class ProductRepository extends BaseRepository<Product> {
    protected model = Product;

    async findByIdWithVariants(id: string, excludeFields: string[] = []) {
        return this.model.findByPk(id, {
            attributes: { exclude: excludeFields },
            include: [{ model: ProductVariant, as: "variants", where: { is_deleted: false }, required: false }],
            transaction: this.transaction,
        });
    }

    async findAllWithPagination(page: number, limit: number) {
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
    async searchProductsAdvanced(
        filters: { name?: string; brand?: string; minPrice?: number; maxPrice?: number; size?: number; color?: string },
        page: number = 1,
        limit: number = 10
    ) {
        const offset = (page - 1) * limit;
        const where: any = { is_deleted: false };
        const variantWhere: any = { is_deleted: false };

        if (filters.name) where.name = { [Op.like]: `%${filters.name}%` };
        if (filters.brand) where.brand = { [Op.like]: `%${filters.brand}%` };
        if (filters.minPrice !== undefined && filters.maxPrice !== undefined) where.base_price = { [Op.between]: [filters.minPrice, filters.maxPrice] };
        else if (filters.minPrice !== undefined) where.base_price = { [Op.gte]: filters.minPrice };
        else if (filters.maxPrice !== undefined) where.base_price = { [Op.lte]: filters.maxPrice };

        if (filters.size !== undefined) variantWhere.size = filters.size;
        if (filters.color) variantWhere.color = filters.color;

        return this.model.findAndCountAll({
            where,
            include: [
                {
                    model: ProductVariant,
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
