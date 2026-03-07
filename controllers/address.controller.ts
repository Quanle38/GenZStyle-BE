import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import parseId from "../helpers/checkId";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { UserAddressService } from "../services/userAddress.services";
import { UserAddressAttributes } from "../models/userAddress.model";

const userAddressService = new UserAddressService();

const userAddressController = {
  /**
   * Tạo địa chỉ mới cho user đang đăng nhập
   */
  create: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    try {
      const user = req.user;
      if (!user) {
        return handleError(res, 401, "Unauthorized");
      }

      const addressData: Partial<UserAddressAttributes> = req.body;

      if (!addressData.full_address || !addressData.label) {
        return handleError(
          res,
          400,
          "Missing required fields: full_address and label"
        );
      }

      await uow.start();
      const createdAddress = await userAddressService.create(
        uow,
        user.id,
        addressData
      );
      await uow.commit();

      return res.status(201).json({
        success: true,
        message: "User address created successfully",
        data: createdAddress,
      });
    } catch (error: any) {
      await uow.rollback();
      if (error.message?.includes("Cannot have more than")) {
        return handleError(res, 400, error.message);
      }
      return handleError(res, 500, error.message || "Internal server error");
    }
  },

  /**
   * Lấy tất cả địa chỉ của user đang đăng nhập
   */
  getAllByUserId: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    try {
      const user = req.user;
      if (!user) {
        return handleError(res, 401, "Unauthorized");
      }

      const addresses = await userAddressService.getAllByUserId(
        uow,
        user.id
      );

      return res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch {
      return handleError(res, 500, "Internal server error");
    }
  },

  /**
   * Lấy một địa chỉ theo ID (chỉ của user hiện tại)
   */
  getById: async (req: Request<{ id: string }>, res: Response) => {
    const uow = new UnitOfWork();
    try {
      const user = req.user;
      if (!user) {
        return handleError(res, 401, "Unauthorized");
      }

      const addressId = parseId(req.params.id);

      const address = await userAddressService.getById(
        uow,
        addressId,
        user.id
      );

      if (!address) {
        return handleError(
          res,
          404,
          "Address not found or unauthorized access"
        );
      }

      return res.status(200).json({
        success: true,
        data: address,
      });
    } catch {
      return handleError(res, 500, "Internal server error");
    }
  },

  /**
   * Cập nhật địa chỉ (chỉ của user hiện tại)
   */
  update: async (req: Request<{ id: string }>, res: Response) => {
    const uow = new UnitOfWork();
    try {
      const user = req.user;
      if (!user) {
        return handleError(res, 401, "Unauthorized");
      }

      const addressId = parseId(req.params.id);
      const updateData: Partial<UserAddressAttributes> = req.body;

      await uow.start();
      const result = await userAddressService.update(
        uow,
        addressId,
        user.id,
        updateData
      );

      if (!result) {
        await uow.rollback();
        return handleError(
          res,
          404,
          "Update failed: Address not found or unauthorized"
        );
      }

      await uow.commit();
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch {
      await uow.rollback();
      return handleError(res, 500, "Internal server error");
    }
  },

  /**
   * Xóa mềm địa chỉ (chỉ của user hiện tại)
   */
  deleteOne: async (req: Request<{ id: string }>, res: Response) => {
    const uow = new UnitOfWork();
    try {
      const user = req.user;
      if (!user) {
        return handleError(res, 401, "Unauthorized");
      }

      const addressId = parseId(req.params.id);

      await uow.start();
      const result = await userAddressService.deleteOne(
        uow,
        addressId,
        user.id
      );

      if (result === "NOT_FOUND") {
        await uow.rollback();
        return handleError(
          res,
          404,
          "Address not found or unauthorized"
        );
      }

      await uow.commit();
      return res.status(204).send();
    } catch (error: any) {
      await uow.rollback();
      if (
        error.message?.includes("Cannot delete the only default address")
      ) {
        return handleError(res, 400, error.message);
      }
      return handleError(res, 500, "Internal server error");
    }
  },
};

export default userAddressController;
