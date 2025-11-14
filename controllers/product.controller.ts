import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import parseId from "../helpers/checkId";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

const productController = {
    getAll: async (req: Request, res: Response) => {
        try {
            const uow = new UnitOfWork();
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await productService.getAll(uow, page, limit);
            return res.status(200).json(result);
        } catch (error: any) { return handleError(res, error.status || 500, error.message || error); }
    },

    getById: async (req: Request<{ id: string }>, res: Response) => {
        try {
            const uow = new UnitOfWork();
            const id = parseId(req.params.id);
            const product = await productService.getById(uow, id);

            if (!product) return handleError(res, 404, "Product not found");
            return res.status(200).json({ data: product });
        } catch (error: any) { return handleError(res, error.status || 500, error.message || error); }
    },

    create: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();
            const created = await productService.create(uow, req.body);
            await uow.commit();
            return res.status(201).json({ success: true, data: created });
        } catch (error: any) { await uow.rollback(); return handleError(res, error.status || 500, error.message || error); }
    },

    update: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();
            const id = parseId(req.params.id);
            const updated = await productService.update(uow, id, req.body);
            await uow.commit();
            return res.status(200).json({ success: true, data: updated });
        } catch (error: any) { await uow.rollback(); return handleError(res, error.status || 500, error.message || error); }
    },

    deleteOne: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();
            const id = parseId(req.params.id);
            await productService.deleteOne(uow, id);
            await uow.commit();
            return res.status(204).send();
        } catch (error: any) { await uow.rollback(); return handleError(res, error.status || 500, error.message || error); }
    },

    search: async (req: Request, res: Response) => {
        try {
            const uow = new UnitOfWork();
            const result = await productService.search(uow, req.query);
            return res.status(200).json(result);
        } catch (error: any) { return handleError(res, error.status || 500, error.message || error); }
    }
};

export default productController;
