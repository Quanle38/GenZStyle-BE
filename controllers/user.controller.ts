import { Request, Response } from "express";
import baseModel from "../models/base.model";
import handleError from "../helpers/handleError.helper";
import userTable from "../models/schema/user.schema";
import parseId from "../helpers/checkId";
import { User } from "../types/tableType";
import { ROLE } from "../enums/role.enum";

const userController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const skip = req.query.skip ? Number(req.query.skip) : undefined;

      const users = await baseModel.findAll(
        userTable.name,
        ["*"],
        { limit, skip }
      );

      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },

  get: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam) return handleError(res, 404, "User not found");

      const id = parseId(idParam);

      const existingUser = await baseModel.findOne(
        userTable.name,
        userTable.columns.user_id,
        id,
        ["*"]
      );

      if (!existingUser || existingUser.length === 0) {
        return handleError(res, 404, "User not found");
      }

      return res.status(200).json({
        success: true,
        data: existingUser,
      });
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },

  update: async (req: Request<{ id: string }, {}, Partial<User>>, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam) return handleError(res, 404, "User not found");

      const id = parseId(idParam);

      const existingUser = await baseModel.findOne(
        userTable.name,
        userTable.columns.user_id,
        id,
        ["*"]
      );

      if (!existingUser || existingUser.length === 0) {
        return handleError(res, 404, "User not found");
      }

      const body = req.body;
      const arrayFieldKeys = Object.keys(body);
      const arrayFieldValues = Object.values(body);

      if (arrayFieldKeys.length === 0) {
        return handleError(res, 400, "No fields to update");
      }

      const updated = await baseModel.update(
        userTable.name,
        arrayFieldKeys,
        arrayFieldValues,
        userTable.columns.user_id,
        id
      );

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },

  deleteOne: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam) return handleError(res, 404, "User not found");

      const id = parseId(idParam);

      // ⚠️ Kiểm tra quyền (ở đây bạn đang check sai — vì bạn check trên `userTable.columns.role` chứ không phải user thực tế)
      const user = await baseModel.findOne(
        userTable.name,
        userTable.columns.user_id,
        id,
        ["*"]
      );

      if (!user || user.length === 0) {
        return handleError(res, 404, "User not found");
      }

      const userRole = user[0].role;
      if (userRole === ROLE.ADMIN || userRole === ROLE.SUPERADMIN) {
        return handleError(res, 401, "YOU DON'T HAVE PERMISSION");
      }

      await baseModel.deletedOne(
        userTable.name,
        userTable.columns.user_id,
        id
      );

      return res.status(204).send();
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const user: Partial<User> = req.body;

      if (!user.user_id || !user.first_name || !user.email || !user.password) {
        return handleError(res, 400, "Missing required fields");
      }

      const newUserData = {
        ...user,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const createdUser = await baseModel.create(userTable.name, newUserData);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: createdUser,
      });
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },
};

export default userController;
