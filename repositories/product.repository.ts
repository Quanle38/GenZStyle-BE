import { Product, ProductVariant } from "../models";
import { BaseRepository } from "./baseRepository";
import { FindOptions, Op } from "sequelize";

export class ProductRepository extends BaseRepository<Product> {
    protected model = Product;

    /**
     * Tìm product theo ID kèm variants
     */
    async findByIdWithDetails(id: string, excludeFields: string[] = []) {
        return this.model.findByPk(id, {
            attributes: { exclude: excludeFields },
            include: [
                {
                    model: ProductVariant,
                    as: 'variants',
                    where: { is_deleted: false },
                    required: false,
                    separate: true,
                    order: [['size', 'ASC']]
                }
            ],
            transaction: this.transaction
        });
    }

    /**
     * Lấy tất cả products với phân trang và filter
     */
    async findAllWithPagination(
        page: number, 
        limit: number, 
        filters?: {
            brand?: string;
            min_price?: number;
            max_price?: number;
            search?: string;
        }
    ) {
        const offset = (page - 1) * limit;
        const where: any = { is_deleted: false };

        if (filters) {
            if (filters.brand) {
                where.brand = filters.brand;
            }
            
            if (filters.min_price !== undefined) {
                where.base_price = { [Op.gte]: filters.min_price };
            }
            
            if (filters.max_price !== undefined) {
                where.base_price = where.base_price 
                    ? { ...where.base_price, [Op.lte]: filters.max_price }
                    : { [Op.lte]: filters.max_price };
            }
            
            if (filters.search) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${filters.search}%` } },
                    { description: { [Op.like]: `%${filters.search}%` } },
                    { brand: { [Op.like]: `%${filters.search}%` } }
                ];
            }
        }

        return this.model.findAndCountAll({
            where,
            limit,
            offset,
            order: [["created_at", "DESC"]],
            transaction: this.transaction
        });
    }

    /**
     * Tìm products theo brand
     */
    async findByBrand(brand: string, page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        return this.findAndCountAll({
            where: { 
                brand, 
                is_deleted: false
            },
            limit,
            offset,
            order: [["created_at", "DESC"]]
        });
    }

    /**
     * Tìm products theo khoảng giá
     */
    async findByPriceRange(minPrice: number, maxPrice: number, page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        return this.findAndCountAll({
            where: {
                base_price: {
                    [Op.between]: [minPrice, maxPrice]
                },
                is_deleted: false
            },
            limit,
            offset,
            order: [["base_price", "ASC"]]
        });
    }

    /**
     * Tìm kiếm products
     */
    async searchProducts(keyword: string, page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        
        return this.findAndCountAll({
            where: {
                is_deleted: false,
                [Op.or]: [
                    { name: { [Op.like]: `%${keyword}%` } },
                    { description: { [Op.like]: `%${keyword}%` } },
                    { brand: { [Op.like]: `%${keyword}%` } }
                ]
            },
            limit,
            offset,
            order: [["created_at", "DESC"]]
        });
    }

    /**
     * Lấy danh sách brands
     */
    async getAllBrands(): Promise<string[]> {
        const products = await this.findAll({
            attributes: ['brand'],
            where: { 
                is_deleted: false,
                brand: { [Op.ne]: null }
            },
            group: ['brand']
        });
        
        return products
            .map(p => p.brand)
            .filter((brand): brand is string => brand !== null);
    }

    /**
     * Cập nhật thumbnail
     */
    async updateThumbnail(id: string, thumbnailUrl: string): Promise<boolean> {
        const [affectedCount] = await this.update(id, { 
            thumbnail: thumbnailUrl,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }

    /**
     * Tính tổng stock của product (từ tất cả variants)
     */
    async getTotalStock(id: string): Promise<number> {
        const product = await this.model.findByPk(id, {
            include: [
                {
                    model: ProductVariant,
                    as: 'variants',
                    attributes: ['stock'],
                    where: { is_deleted: false },
                    required: false
                }
            ],
            transaction: this.transaction
        });

        if (!product || !product.variants) return 0;

        return product.variants.reduce((total, v) => total + v.stock, 0);
    }

    /**
     * Kiểm tra product có variant nào còn hàng không
     */
    async hasAvailableVariants(id: string): Promise<boolean> {
        const product = await this.model.findByPk(id, {
            include: [
                {
                    model: ProductVariant,
                    as: 'variants',
                    where: { 
                        is_deleted: false,
                        stock: { [Op.gt]: 0 }
                    },
                    required: false
                }
            ],
            transaction: this.transaction
        });

        return product?.variants !== undefined && product.variants.length > 0;
    }

    /**
     * Lấy products đã xóa
     */
    async findDeletedProducts(page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        return this.findAndCountAll({
            where: { is_deleted: true },
            limit,
            offset,
            order: [["updated_at", "DESC"]]
        });
    }

    /**
     * Khôi phục product
     */
    async restore(id: string): Promise<boolean> {
        const [affectedCount] = await this.update(id, { 
            is_deleted: false,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }
}
