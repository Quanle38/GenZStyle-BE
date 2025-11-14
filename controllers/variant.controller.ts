import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import parseId from "../helpers/checkId";
import { variantService } from "../services/variant.service";

const variantController = {

    getAll: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const { count, rows } = await variantService.getAll(uow, page, limit);

            return res.status(200).json({
                currentPage: page,
                totalPage: Math.ceil(count / limit),
                totalVariant: count,
                data: rows,
            });
        } catch (error) { return handleError(res, 500, error); }
    },

    getById: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const id = parseId(req.params.id);
            const variant = await variantService.getById(uow, id);
            if (!variant) return handleError(res, 404, "Variant not found");
            return res.status(200).json({ data: variant });
        } catch (error) { return handleError(res, 500, error); }
    },

    create: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const newVariant = await variantService.create(uow, req.body);
            return res.status(201).json({ data: newVariant });
        } catch (error) { return handleError(res, 500, error); }
    },

    autoImportVariant: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const result = await variantService.autoImportVariant(uow, req.body);
            return res.status(200).json({ data: result });
        } catch (error) { return handleError(res, 500, error); }
    },

    deleteOne: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const id = parseId(req.params.id);
            const result = await variantService.deleteOne(uow, id);
            if (!result) return handleError(res, 404, "Variant not found");
            return res.status(204).send();
        } catch (error) { return handleError(res, 500, error); }
    },

    update: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const id = parseId(req.params.id);
            const result = await variantService.update(uow, id, req.body);

            if (result === null) return handleError(res, 404, "Variant not found");
            if (result === "NO_FIELDS") return handleError(res, 400, "No fields to update");
            if (result === "FAILED") return handleError(res, 400, "Update failed");

            return res.status(200).json({ data: result });
        } catch (error) { return handleError(res, 500, error); }
    },
};

export default variantController;
