import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import parseId from "../helpers/checkId";
import { UnitOfWork } from "../unit-of-work/unitOfWork";

const ATTRIBUTES_TO_EXCLUDE = ["is_deleted"];

const productController = {
    getAll: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const { count, rows: products } = await uow.products.findAllWithPagination(page, limit);
            return res.status(200).json({ currentPage: page, totalPage: Math.ceil(count / limit), totalProduct: count, data: products });
        } catch (error: any) { return handleError(res, 500, error); }
    },

    getById: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const id = parseId(req.params.id);
            const product = await uow.products.findByIdWithVariants(id, ATTRIBUTES_TO_EXCLUDE);
            if (!product) return handleError(res, 404, "Product not found");
            return res.status(200).json({ data: product });
        } catch (error: any) { return handleError(res, 500, error); }
    },

    create: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();
            const { variants, ...productData  } = req.body;
            if (!productData.name || !productData.base_price || !productData.category ) {
                await uow.rollback();
                return handleError(res, 400, "Missing required fields: name, base_price, category");
            }
            const newProduct = await uow.products.create({ ...productData, is_deleted: false, created_at: new Date(), updated_at: new Date() });
            if (Array.isArray(variants) && variants.length > 0) {
                for (const v of variants) await uow.productVariants.create({ product_id: newProduct.id, ...v, is_deleted: false, created_at: new Date(), updated_at: new Date() });
            }
            const createdProduct = await uow.products.findByIdWithVariants(newProduct.id, ATTRIBUTES_TO_EXCLUDE);
            await uow.commit();
            return res.status(201).json({ success: true, message: "Product created successfully", data: createdProduct });
        } catch (error: any) { await uow.rollback(); return handleError(res, 500, error); }
    },

    update: async (req: Request<{ id: string }, {}, any>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();
            const id = parseId(req.params.id);
            const product = await uow.products.findById(id);
            if (!product) { await uow.rollback(); return handleError(res, 404, "Product not found"); }
            if (Object.keys(req.body).length === 0) { await uow.rollback(); return handleError(res, 400, "No fields to update"); }
            const [affected] = await uow.products.update(id, { ...req.body, updated_at: new Date() });
            if (affected === 0) { await uow.rollback(); return handleError(res, 400, "Update failed"); }
            const updatedProduct = await uow.products.findByIdWithVariants(id, ATTRIBUTES_TO_EXCLUDE);
            await uow.commit();
            return res.status(200).json({ success: true, data: updatedProduct });
        } catch (error: any) { await uow.rollback(); return handleError(res, 500, error); }
    },

    deleteOne: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();
            const id = parseId(req.params.id);
            const product = await uow.products.findById(id);
            if (!product) { await uow.rollback(); return handleError(res, 404, "Product not found"); }
            await uow.products.softDelete(id);
            await uow.commit();
            return res.status(204).send();
        } catch (error: any) { await uow.rollback(); return handleError(res, 500, error); }
    },

    // === SEARCH ADVANCED ===
    search: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const { name, brand, minPrice, maxPrice, size, color, page, limit } = req.query;
            const { count, rows } = await uow.products.searchProductsAdvanced(
                {
                    name: name as string,
                    brand: brand as string,
                    minPrice: minPrice ? Number(minPrice) : undefined,
                    maxPrice: maxPrice ? Number(maxPrice) : undefined,
                    size: size ? Number(size) : undefined,
                    color: color as string,
                },
                page ? Number(page) : 1,
                limit ? Number(limit) : 10
            );
            return res.status(200).json({
                currentPage: page ? Number(page) : 1,
                totalPage: Math.ceil(count / (limit ? Number(limit) : 10)),
                totalProduct: count,
                data: rows,
            });
        } catch (error: any) { return handleError(res, 500, error); }
    },
};

export default productController;
