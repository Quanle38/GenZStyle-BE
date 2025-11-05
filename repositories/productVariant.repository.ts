import { ProductVariant } from "../models";
import { BaseRepository } from "./baseRepository";

export class ProductVariantRepository extends BaseRepository<ProductVariant> {
    protected model = ProductVariant;

    async findByProduct(productId: string) {
        return this.findAll(
            {
                where: { product_id: productId, is_deleted: false },
                order: [["created_at", "DESC"]],
            },
            this.transaction
        );

    }
    async softDeleteVariant(id: string): Promise<boolean> {
        const [affectedCount] = await this.update(id, {
            is_deleted: true,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }

    async restoreVariant(id: string): Promise<boolean> {
        const [affectedCount] = await this.update(id, {
            is_deleted: false,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }
    async findByCompositeKey({price,color,size} : {price : number, color : string, size : number}) {
        return this.findOne(
            {
                where: { price : price,color : color,size : size, is_deleted: false }
            },
        );

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
}
