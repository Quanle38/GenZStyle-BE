import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CreateConditionSetRequest } from "../dtos/conditionSet/request/create.request";
import { UpdateConditionSetRequest } from "../dtos/conditionSet/request/update.request";
import { conditionSetService } from "../services/conditionSet.service";
import parseId from "../helpers/checkId";

const conditionSetController = {

    // =====================
    // GET ALL
    // =====================
    getAll: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const { count, rows } = await conditionSetService.getAll(uow, page, limit);

            return res.status(200).json({
                success: true,
                message: "Get condition sets successfully",
                currentPage: page,
                totalPage: Math.ceil(count / limit),
                totalConditionSet: count,
                data: rows,
            });

        } catch (error) {
            return handleError(res, 500, "Error fetching condition sets");
        }
    },

    // =====================
    // GET BY ID
    // =====================
    getById: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const id = parseId(req.params.id);

            const result = await conditionSetService.getById(uow, id);

            if (!result) {
                return handleError(res, 404, "ConditionSet not found");
            }

            return res.status(200).json({
                success: true,
                message: "Get condition set successfully",
                data: result,
            });

        } catch (error) {
            return handleError(res, 500, "Error fetching condition set");
        }
    },

    // =====================
    // CREATE
    // =====================
    create: async (req: Request<{}, {}, CreateConditionSetRequest>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const result = await conditionSetService.create(uow, req.body);

            return res.status(201).json({
                success: true,
                message: "ConditionSet created successfully",
                data: result,
            });

        } catch (error: any) {
            return handleError(res, 400, error.message || "Create failed");
        }
    },

    // =====================
    // DELETE
    // =====================
    deleteOne: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const id = parseId(req.params.id);

            const deletedCount = await conditionSetService.deleteOne(uow, id);

            if (deletedCount === 0) {
                return handleError(res, 404, "ConditionSet not found");
            }

            return res.status(200).json({
                success: true,
                message: "ConditionSet deleted successfully",
            });

        } catch (error) {
            return handleError(res, 500, "Delete failed");
        }
    },

    // =====================
    // UPDATE
    // =====================
    update: async (
        req: Request<{ id: string }, {}, UpdateConditionSetRequest>,
        res: Response
    ) => {
        const uow = new UnitOfWork();
        try {
            const id = parseId(req.params.id);

            const result = await conditionSetService.update(uow, id, req.body);

            return res.status(200).json({
                success: true,
                message: "ConditionSet updated successfully",
                data: result,
            });

        } catch (error: any) {
            return handleError(res, 400, error.message || "Update failed");
        }
    },
};

export default conditionSetController;