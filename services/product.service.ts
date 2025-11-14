import { ProductCreateRequestBody } from "../dtos/product/request/productCreateRequestBody.dto";
import { ProductUpdateRequestBody } from "../dtos/product/request/productUpdateRequestBody.dto";
import { CalculateBasePrice } from "../helpers/calculateBasePrice";
import { UnitOfWork } from "../unit-of-work/unitOfWork";

const ATTRIBUTES_TO_EXCLUDE = ["is_deleted"];

export class ProductService {
    async getAll(uow: UnitOfWork, page: number, limit: number) {
        const { count, rows: products } = await uow.products.findAllWithPagination(page, limit);
        return {
            currentPage: page,
            totalPage: Math.ceil(count / limit),
            totalProduct: count,
            data: products
        };
    }

    async getById(uow: UnitOfWork, id: string) {
        return await uow.products.findByIdWithVariants(id, ATTRIBUTES_TO_EXCLUDE);
    }

    async create(uow: UnitOfWork, body: ProductCreateRequestBody) {
        const { variants, ...productData } = body;

        if (!productData.name || !productData.category) {
            throw { status: 400, message: "Missing required fields: name, category" };
        }
        if (!variants) {
            throw { status: 400, message: "Missing variant" };
        }

        let arrayPrice: number[] = [];
        variants.forEach(element => {
            arrayPrice.push(element.price);
        });
        const basePrice = await CalculateBasePrice(arrayPrice)
        const newProduct = await uow.products.create({
            ...productData,
            base_price: basePrice,
            is_deleted: false,
        });
        for (const v of variants) {
            await uow.productVariants.create({
                product_id: newProduct.id,
                ...v,
            });
        }
        return await uow.products.findByIdWithVariants(newProduct.id, ATTRIBUTES_TO_EXCLUDE);
    }

    async update(uow: UnitOfWork, id: string, body: ProductUpdateRequestBody) {
        const product = await uow.products.findById(id);
        if (!product) throw { status: 404, message: "Product not found" };
        const { variants, ...productData } = body;

        if (Object.keys(body).length === 0) {
            throw { status: 400, message: "No fields to update" };
        }
        if (Array.isArray(variants) && variants !== undefined && variants.length > 0) {
            for (const v of variants) {
                await uow.productVariants.create({
                    product_id: id,
                    ...v,
                });
            }
        }
        const [affected] = await uow.products.update(id, { ...body, updated_at: new Date() });
        if (affected === 0) throw { status: 400, message: "Update failed" };

        return await uow.products.findByIdWithVariants(id, ATTRIBUTES_TO_EXCLUDE);
    }

    async deleteOne(uow: UnitOfWork, id: string) {
        const product = await uow.products.findById(id);
        if (!product) throw { status: 404, message: "Product not found" };

        await uow.products.softDelete(id);
    }

    async search(uow: UnitOfWork, query: any) {
        const { name, brand, minPrice, maxPrice, size, color, page, limit } = query;

        const { count, rows } = await uow.products.searchProductsAdvanced(
            {
                name,
                brand,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                size: size ? Number(size) : undefined,
                color,
            },
            page ? Number(page) : 1,
            limit ? Number(limit) : 10
        );

        return {
            currentPage: page ? Number(page) : 1,
            totalPage: Math.ceil(count / (limit ? Number(limit) : 10)),
            totalProduct: count,
            data: rows,
        };
    }
}
