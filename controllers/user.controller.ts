import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import handleResponse from "../helpers/handleResponse.helper";
import parseId from "../helpers/checkId";
import { UserService } from "../services/user.services";
import { UnitOfWork } from "../unit-of-work/unitOfWork";

const userService = new UserService();

const userController = {
  // ===== LIST (CÓ PAGINATION) =====
  getAll: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    try {
      const page = Number(req.query.page) || 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const result = await userService.getAll(uow, page, limit);

      return handleResponse(res, 200, {
        currentPage: page,
        totalPage: Math.ceil(result.count / limit),
        totalUser: result.count,
        data: result.users
      });
    } catch {
      return handleError(res, 500, "Internal server error");
    }
  },

  // ===== GET BY ID =====
  getById: async (req: Request<{ id: string }>, res: Response) => {
    const uow = new UnitOfWork();
    try {
      const id = parseId(req.params.id);
      console.log("id",id)
      const user = await userService.getById(uow, id);

      if (!user) {
        return handleError(res, 404, "User not found");
      }

      return handleResponse(res, 200, {
        message: "Get user successfully",
        data: user
      });
    } catch {
      return handleError(res, 500, "Internal server error");
    }
  },

  // ===== CREATE =====
  create: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    try {
      await uow.start();

      const user = await userService.create(uow, req.body);

      await uow.commit();
      return handleResponse(res, 201, {
        message: "User created successfully",
        data: user
      });
    } catch {
      await uow.rollback();
      return handleError(res, 500, "Create user failed");
    }
  },

  // ===== UPDATE =====
  update: async (req: Request<{ id: string }>, res: Response) => {
    const uow = new UnitOfWork();
    try {
      await uow.start();

      const id = parseId(req.params.id);
      const user = await userService.update(uow, id, req.body);

      if (!user) {
        await uow.rollback();
        return handleError(res, 400, "Update failed or User not found");
      }

      await uow.commit();
      return handleResponse(res, 200, {
        message: "User updated successfully",
        data: user
      });
    } catch {
      await uow.rollback();
      return handleError(res, 500, "Update user failed");
    }
  },

  // ===== DELETE =====
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
      return handleResponse(res, 200, {
        message: "User deleted successfully",
        data: null
      });
    } catch {
      await uow.rollback();
      return handleError(res, 500, "Delete user failed");
    }
  }
};

export default userController;
