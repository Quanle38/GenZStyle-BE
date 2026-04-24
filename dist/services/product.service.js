"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const calculateBasePrice_1 = require("../helpers/calculateBasePrice");
const ATTRIBUTES_TO_EXCLUDE = ["is_deleted"];
class ProductService {
    async getAll(uow, page, limit) {
        const { count, rows: products } = await uow.products.findAllWithPagination(page, limit);
        return {
            currentPage: page,
            totalPage: Math.ceil(count / limit),
            totalProduct: count,
            data: products
        };
    }
    async getById(uow, id) {
        return await uow.products.findByIdWithVariants(id, ATTRIBUTES_TO_EXCLUDE);
    }
    async create(uow, body) {
        const { variants, ...productData } = body;
        if (!productData.name || !productData.category) {
            throw { status: 400, message: "Missing required fields: name, category" };
        }
        if (!variants) {
            throw { status: 400, message: "Missing variant" };
        }
        let arrayPrice = [];
        variants.forEach(element => {
            arrayPrice.push(element.price);
        });
        const basePrice = await (0, calculateBasePrice_1.CalculateBasePrice)(arrayPrice);
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
    async update(uow, id, body) {
        const product = await uow.products.findById(id);
        if (!product)
            throw { status: 404, message: "Product not found" };
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
        if (affected === 0)
            throw { status: 400, message: "Update failed" };
        return await uow.products.findByIdWithVariants(id, ATTRIBUTES_TO_EXCLUDE);
    }
    async deleteOne(uow, id) {
        const product = await uow.products.findById(id);
        if (!product)
            throw { status: 404, message: "Product not found" };
        await uow.products.softDelete(id);
    }
    async search(uow, query) {
        const { name, brand, minPrice, maxPrice, size, color, page, limit } = query;
        const { count, rows } = await uow.products.searchProductsAdvanced({
            name,
            brand,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            size: size ? Number(size) : undefined,
            color,
        }, page ? Number(page) : 1, limit ? Number(limit) : 10);
        return {
            currentPage: page ? Number(page) : 1,
            totalPage: Math.ceil(count / (limit ? Number(limit) : 10)),
            totalProduct: count,
            data: rows,
        };
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map