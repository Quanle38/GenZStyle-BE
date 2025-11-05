import { ProductVariant, Product } from "../models";
import { BaseRepository } from "./baseRepository";
import { Op } from "sequelize";

export class ProductVariantRepository extends BaseRepository<ProductVariant> {
    protected model = ProductVariant;

    /**
     * Tìm tất cả variants của 1 product
     */
    async findByProductId(productId: string): Promise<ProductVariant[]> {
        return this.findAll({
            where: { 
                product_id: productId,
                is_deleted: false 
            },
            order: [['size', 'ASC'], ['color', 'ASC']]
        });
    }

    /**
     * Tìm variant theo product_id, size, color
     */
    async findByProductAndAttributes(
        productId: string, 
        size: number, 
        color: string
    ): Promise<ProductVariant | null> {
        return this.findOne({
            where: { 
                product_id: productId,
                size,
                color,
                is_deleted: false 
            }
        });
    }

    /**
     * Kiểm tra variant có tồn tại không
     */
    async existsByAttributes(
        productId: string, 
        size: number, 
        color: string,
        excludeId?: string
    ): Promise<boolean> {
        const where: any = { 
            product_id: productId,
            size,
            color,
            is_deleted: false 
        };

        if (excludeId) {
            where.id = { [Op.ne]: excludeId };
        }

        const variant = await this.findOne({ where });
        return variant !== null;
    }

    /**
     * Lấy các màu sắc available cho product
     */
    async getAvailableColors(productId: string): Promise<string[]> {
        const variants = await this.findAll({
            attributes: ['color'],
            where: { 
                product_id: productId,
                is_deleted: false,
                stock: { [Op.gt]: 0 }
            },
            group: ['color']
        });
        
        return variants.map(v => v.color);
    }

    /**
     * Lấy các sizes available cho product
     */
    async getAvailableSizes(productId: string): Promise<number[]> {
        const variants = await this.findAll({
            attributes: ['size'],
            where: { 
                product_id: productId,
                is_deleted: false,
                stock: { [Op.gt]: 0 }
            },
            group: ['size'],
            order: [['size', 'ASC']]
        });
        
        return variants.map(v => v.size);
    }

    /**
     * Lấy tất cả options (sizes và colors) của product
     */
    async getProductOptions(productId: string): Promise<{
        sizes: number[];
        colors: string[];
    }> {
        const [sizes, colors] = await Promise.all([
            this.getAvailableSizes(productId),
            this.getAvailableColors(productId)
        ]);

        return { sizes, colors };
    }

    /**
     * Cập nhật stock
     */
    async updateStock(id: string, stock: number): Promise<boolean> {
        const [affectedCount] = await this.update(id, { 
            stock,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }

    /**
     * Giảm stock (khi có đơn hàng)
     */
    async decrementStock(id: string, quantity: number): Promise<boolean> {
        const variant = await this.findById(id);
        if (!variant || variant.stock < quantity) {
            return false;
        }

        const [affectedCount] = await this.update(id, {
            stock: variant.stock - quantity,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }

    /**
     * Tăng stock (khi hoàn trả/hủy đơn)
     */
    async incrementStock(id: string, quantity: number): Promise<boolean> {
        const variant = await this.findById(id);
        if (!variant) return false;

        const [affectedCount] = await this.update(id, {
            stock: variant.stock + quantity,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }

    /**
     * Kiểm tra variant còn hàng
     */
    async isInStock(id: string, quantity: number = 1): Promise<boolean> {
        const variant = await this.findById(id);
        if (!variant) return false;
        return variant.stock >= quantity && !variant.is_deleted;
    }

    /**
     * Tìm variants có stock thấp
     */
    async findLowStock(threshold: number = 10): Promise<ProductVariant[]> {
        return this.findAll({
            where: {
                stock: { [Op.lte]: threshold },
                is_deleted: false
            },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'thumbnail']
                }
            ],
            order: [['stock', 'ASC']]
        });
    }

    /**
     * Tổng stock của product
     */
    async getTotalStockByProduct(productId: string): Promise<number> {
        const variants = await this.findAll({
            attributes: ['stock'],
            where: { 
                product_id: productId,
                is_deleted: false 
            }
        });
        
        return variants.reduce((total, v) => total + v.stock, 0);
    }

    /**
     * Xóa mềm tất cả variants của product
     */
    async softDeleteByProductId(productId: string): Promise<number> {
        const variants = await this.findByProductId(productId);
        
        if (variants.length === 0) return 0;

        let deletedCount = 0;
        for (const variant of variants) {
            const success = await this.softDelete(variant.id);
            if (success) deletedCount++;
        }

        return deletedCount;
    }

    /**
     * Xóa cứng tất cả variants của product
     */
    async deleteByProductId(productId: string): Promise<number> {
        const variants = await this.findAll({
            where: { product_id: productId }
        });
        const variantIds = variants.map(v => v.id);
        
        if (variantIds.length === 0) return 0;
        
        return this.bulkDelete(variantIds);
    }

    /**
     * Bulk update stock cho nhiều variants
     */
    async bulkUpdateStock(updates: { id: string; stock: number }[]): Promise<number> {
        let successCount = 0;

        for (const update of updates) {
            const success = await this.updateStock(update.id, update.stock);
            if (success) successCount++;
        }

        return successCount;
    }
}
