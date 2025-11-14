// =====================================
// File: membershipTier.controller.ts (FINAL)
// =====================================

import { Request, Response } from "express";
import membershipTierService from "../services/membership.service";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import handleError from "../helpers/handleError.helper";

const membershipTierController = {

    // 1. Lấy tất cả các hạng (getAll) - Dùng GET /
    getAll: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const tiers = await membershipTierService.getAll(uow);
            return res.status(200).json({ data: tiers });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    // 2. Lấy hạng thành viên theo User ID (getByUserId) - Dùng GET /user-rank?userId=...
    getByUserId: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const userId = req.query.userId as string;

            if (!userId) return handleError(res, 400, "Missing User ID in query parameters.");

            const tier = await membershipTierService.getByUserId(uow, userId);

            return res.status(200).json({ data: tier });
        } catch (error) {
            return handleError(res, 404, error);
        }
    },

    // 3. Tạo hạng thành viên mới (create) - Dùng POST /
    create: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();
            const data = await membershipTierService.create(uow, req.body);
            await uow.commit();
            return res.status(201).json({
                success: true,
                message: "Membership Tier created successfully",
                data
            });
        } catch (error) {
            if (uow.isTransactionActive()) await uow.rollback();
            return handleError(res, 400, error);
        }
    },

    // 4. Cập nhật hạng thành viên (update) - Dùng PUT /update?id=...
    update: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();

            // >> Lấy ID từ Query Parameters theo yêu cầu <<
            const id = req.query.id as string;

            if (!id) return handleError(res, 400, "Missing Tier ID in query parameters.");

            const result = await membershipTierService.update(uow, id, req.body);

            await uow.commit();
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            if (uow.isTransactionActive()) await uow.rollback();
            return handleError(res, 400, error);
        }
    },

    // 5. Xóa mềm hạng thành viên (delete) - Dùng DELETE /delete?id=...
    delete: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();

            // >> Lấy ID từ Query Parameters theo yêu cầu <<
            const id = req.query.id as string;

            if (!id) return handleError(res, 400, "Missing Tier ID in query parameters.");

            await membershipTierService.delete(uow, id);

            await uow.commit();
            return res.status(204).send();
        } catch (error) {
            if (uow.isTransactionActive()) await uow.rollback();
            return handleError(res, 404, error);
        }
    }
};

export default membershipTierController;