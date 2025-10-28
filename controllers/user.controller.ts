import { Request, Response } from "express";
import baseModel from "../models/base.model";
import handleError from "../helpers/handleError.helper";
import userTable from "../models/schema/user.schema";
import parseId from "../helpers/checkId";
import { User } from "../types/tableType";
import { ROLE } from "../enums/role.enum";
import { RequestCreateUser } from "../dtos/user.dto";
import addressTable from "../models/schema/userAddress.schema";

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
      console.log("aaaa");
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
        userTable.columns.id,
        id,
        ["*"]
      );

      if (!existingUser) {
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
      console.log("acscscscscscscsc", id)
      const existingUser = await baseModel.findOne(
        userTable.name,
        userTable.columns.id,
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
        userTable.columns.id,
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
        userTable.columns.id,
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
        userTable.columns.id,
        id
      );

      return res.status(204).send();
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      let user: RequestCreateUser = req.body;
      if (!user.first_name || !user.email || !user.password || !user.address || !user.dob || !user.phone_number || !user.gender) {
        return handleError(res, 400, "Missing required fields");
      }
      const newAdressData = {
        full_address: user.address,
        is_default: false,
        label: "",
        is_deleted: false,
      };
      const createdAdress = await baseModel.create(addressTable.name, newAdressData)
      const idAddress = createdAdress.address_id;
      const {dob,address,...userNew} = user;
      const newUserData : Partial<User> = {
        ...userNew,
        role : "USER",
        dob : new Date(dob),
        address_id : idAddress,
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
