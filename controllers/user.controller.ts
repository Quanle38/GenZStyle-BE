import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import parseId from "../helpers/checkId";
import { UserService } from "../services/user.services";
import { UnitOfWork } from "../unit-of-work/unitOfWork";

const userService = new UserService();

const userController = {
    getAll: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const page = Number(req.query.page) || 1;
            const limit = req.query.limit ? Number(req.query.limit) : 10;

            const data = await userService.getAll(uow, page, limit);

            return res.status(200).json({
                currentPage: page,
                totalPage: Math.ceil(data.count / limit),
                totalUser: data.count,
                data: data.users
            });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    getById: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const id = parseId(req.params.id);
            const user = await userService.getById(uow, id);

            if (!user) return handleError(res, 404, "User not found");

            return res.status(200).json({ data: user });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    update: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();

            const id = parseId(req.params.id);
            const result = await userService.update(uow, id, req.body);

            if (!result) {
                await uow.rollback();
                return handleError(res, 400, "Update failed or User not found");
            }

            await uow.commit();
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            await uow.rollback();
            return handleError(res, 500, error);
        }
    },

    deleteOne: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();

            const id = parseId(req.params.id);
            const result = await userService.deleteOne(uow, id);

            if (result === "NOT_FOUND") {
                await uow.rollback();
                return handleError(res, 404, "User not found");
            }

            if (result === "FORBIDDEN") {
                await uow.rollback();
                return handleError(res, 403, "YOU DON'T HAVE PERMISSION");
            }

            await uow.commit();
            return res.status(204).send();
        } catch (error) {
            await uow.rollback();
            return handleError(res, 500, error);
        }
    },

    create: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            await uow.start();

            const data = await userService.create(uow, req.body);

            await uow.commit();
            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data
            });
        } catch (error) {
            await uow.rollback();
            return handleError(res, 500, error);
        }
    }
};

export default userController;
