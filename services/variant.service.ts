// src/services/variant.service.ts
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { VariantCreateRequestBody } from "../dtos/variant/request/variantCreateRequestBody.dto";
import { VariantUpdateRequestBody } from "../dtos/variant/request/variantUpdateRequestBody.dto";

export class VariantService {

    async getAll(uow: UnitOfWork, page: number, limit: number) {
        return await uow.productVariants.findAllWithPagination(page, limit);
    }

    async getById(uow: UnitOfWork, id: string) {
        return await uow.productVariants.findById(id);
    }

    async create(uow: UnitOfWork, body: VariantCreateRequestBody) {
        await uow.start();
        try {
            const newVariant = await uow.productVariants.create(body);
            await uow.commit();
            return newVariant;
        } catch (err) {
            await uow.rollback();
            throw err;
        }
    }

    async autoImportVariant(uow: UnitOfWork, body: VariantCreateRequestBody) {
        await uow.start();
        try {
            const variant = await uow.productVariants.findByCompositeKey({
                price: body.price,
                color: body.color,
                size: body.size,
            });

            let result;
            if (!variant) {
                result = await uow.productVariants.create(body);
            } else {
                const newStock = variant.stock + body.stock;
                await uow.productVariants.updateByCondition({ id: variant.id }, { stock: newStock });
                result = await uow.productVariants.findById(variant.id);
            }

            await uow.commit();
            return result;
        } catch (err) {
            await uow.rollback();
            throw err;
        }
    }

    async deleteOne(uow: UnitOfWork, id: string) {
        await uow.start();
        try {
            const variant = await uow.productVariants.findById(id);
            if (!variant) {
                await uow.rollback();
                return null;
            }

            await uow.productVariants.softDelete(id);
            await uow.commit();
            return true;
        } catch (err) {
            await uow.rollback();
            throw err;
        }
    }

    async update(uow: UnitOfWork, id: string, data: VariantUpdateRequestBody) {
        await uow.start();
        try {
            const variant = await uow.productVariants.findById(id);
            if (!variant) {
                await uow.rollback();
                return null;
            }

            const updateData: Record<string, any> = {};
            for (const key of Object.keys(data) as (keyof VariantUpdateRequestBody)[]) {
                if (data[key] !== undefined) updateData[key] = data[key];
            }

            if (!Object.keys(updateData).length) {
                await uow.rollback();
                return "NO_FIELDS";
            }

            const [affected] = await uow.productVariants.update(id, updateData);
            if (!affected) {
                await uow.rollback();
                return "FAILED";
            }

            const updatedVariant = await uow.productVariants.findById(id);
            await uow.commit();
            return updatedVariant;
        } catch (err) {
            await uow.rollback();
            throw err;
        }
    }
}

export const variantService = new VariantService();
