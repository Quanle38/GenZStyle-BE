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
      // Lấy query param từ request
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const skip = req.query.skip ? Number(req.query.skip) : undefined;

      // Gọi baseModel.findAll
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
  get: async (req: Request, res: Response) => {
    try {
      let id = "";
      if (req.query.id) {
        //check id != number 
        id = parseId(req.query.id as string);
      } else {
        return handleError(res, 404, "User not found");
      }
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

      let id = "";
      if (req.query.id) {
        id = parseId(req.query.id as string);
      } else {
        return handleError(res, 404, "User not found");
      }

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

      const update = await baseModel.update(
        userTable.name,
        arrayFieldKeys,
        arrayFieldValues,
        userTable.columns.user_id,
        id
      )
      return res.status(200).json({
        success: true,
        data: update
      })

    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },
  deleteOne: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.query.id as string;
      if (id === null || id === undefined) {
        return handleError(res, 404, "User not found");
      }
      if (userTable.columns.role === ROLE.ADMIN || userTable.columns.role === ROLE.SUPERADMIN) {
        return handleError(res, 401, "YOU DONT HAVE PERMISSION")
      }
      await baseModel.deletedOne(
        userTable.name,
        userTable.columns.user_id,
        id,
      )
      return res.status(204);
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const user: Partial<User> = req.body;

      // Validate cơ bản
      if (!user.user_id || !user.first_name || !user.email || !user.password) {
        return handleError(res, 400, "Missing required fields");
      }

      // Thêm cờ is_deleted mặc định = false
      const newUserData = {
        ...user,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Gọi baseModel.create
      const createdUser = await baseModel.create(userTable.name, newUserData);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: createdUser
      });
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },



};

export default userController;
