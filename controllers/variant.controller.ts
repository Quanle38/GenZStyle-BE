import { Request, response, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import parseId from "../helpers/checkId";
import { VariantCreateRequestBody } from "../dtos/variant/request/variantCreateRequestBody.dto";
import { VariantResponseBody } from "../dtos/variant/response/variantResponseBody.dto";
import { VariantUpdateRequestBody } from "../dtos/variant/request/variantUpdateRequestBody";


const ATTRIBUTES_TO_EXCLUDE = ["is_deleted"];

const variantController = {
    getAll: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const { count, rows: variant } = await uow.productVariants.findAllWithPagination(page, limit);
            const response: VariantResponseBody[] = variant;
            return res.status(200).json({ currentPage: page, totalPage: Math.ceil(count / limit), totalProduct: count, data: response });
        } catch (error: any) { return handleError(res, 500, error); }
    },
    getById: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const id = parseId(req.params.id);
            const variant = await uow.productVariants.findById(id);
            if (!variant) {
                return handleError(res, 404, "Variants not found :")
            }
            return res.status(200).json({
                data: variant as VariantResponseBody
            });
        } catch (error: any) { return handleError(res, 500, error); }
    },

    create: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();

        } catch (error: any) { await uow.rollback(); return handleError(res, 500, error); }
    },
    autoImportVariant: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const body: VariantCreateRequestBody = req.body;
            if (!body) {
                return handleError(res, 400, "Missing body ");
            }
            const variant = await uow.productVariants.findByCompositeKey({ price: body.price, color: body.color, size: body.size });
            let response;
            if (!variant) {
                const newVariant = await uow.productVariants.create(body);
                response = newVariant;
            } else {
                const newStock = variant.stock + body.stock;
                await uow.productVariants.updateByCondition({ id: variant.id }, { stock: newStock });
                const checkVariant = await uow.productVariants.findById(variant.id);
                response = checkVariant;
            }
            return res.status(200).json({
                data: response as VariantResponseBody
            })
        } catch (error: any) { await uow.rollback(); return handleError(res, 500, error); }
    },

    deleteOne: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();
            const id = parseId(req.params.id);
            const variant = await uow.productVariants.findById(id);
            if (!variant) { await uow.rollback(); return handleError(res, 404, "variant not found"); }
            await uow.productVariants.softDelete(id);
            await uow.commit();
            return res.status(204).send();
        } catch (error: any) { await uow.rollback(); return handleError(res, 500, error); }
    },

    update: async (
        req: Request<{ id: string }, {}, VariantUpdateRequestBody>,
        res: Response
    ) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();
            const id = parseId(req.params.id);
            const body = req.body;
            const variant = await uow.productVariants.findById(id);
            if (!variant) {
                await uow.rollback();
                return handleError(res, 404, "Variant not found");
            }
            // Lọc những trường thực sự có giá trị để update
            const updateData: Record<string, any> = {};
            // Duyệt qua tất cả các key trong body
             console.log("body",req.body);
            for (const key of Object.keys(req.body) as (keyof VariantUpdateRequestBody)[]) {
                const value = req.body[key];           
                // Chỉ thêm vào updateData nếu giá trị khác undefined
                if (value !== undefined) {
                    updateData[key] = value;
                }
            }
            if (Object.keys(updateData).length === 0) {
                await uow.rollback();
                return handleError(res, 400, "No fields to update");
            }
            const [affected] = await uow.productVariants.update(id, updateData);
            if (affected === 0) {
                await uow.rollback();
                return handleError(res, 400, "Update failed or no changes");
            }
            const updatedVariant = await uow.productVariants.findById(id);
            await uow.commit();
            return res.status(200).json({ data: updatedVariant as VariantResponseBody });
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 500, error.message || error);
        }
    }
};
export default variantController;
