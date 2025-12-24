// controllers/userAddress.controller.ts
import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import parseId from "../helpers/checkId";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { UserAddressService } from "../services/userAddress.services";
import { UserAddressAttributes } from "../models/userAddress.model";

// Import từ userAddress.model nếu cần type cho request body

const userAddressService = new UserAddressService();

const userAddressController = {
    /**
     * Tạo địa chỉ mới cho người dùng.
     * Cần thêm logic xác thực user (ví dụ: từ req.user.id sau khi qua middleware auth)
     */
    create: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // **GIẢ ĐỊNH**: user_id được lấy từ token (req.user) sau khi authenticated
            const userId = req.body.user_id; // Thay bằng req.user.id trong môi trường thực
            const addressData: Partial<UserAddressAttributes> = req.body;

            if (!userId) {
                 return handleError(res, 401, "User ID is missing or unauthorized");
            }

            if (!addressData.full_address || !addressData.label) {
                return handleError(res, 400, "Missing required fields: full_address and label");
            }
            
            await uow.start();
            const createdAddress = await userAddressService.create(uow, userId, addressData);
            await uow.commit();

            return res.status(201).json({
                success: true,
                message: "User address created successfully",
                data: createdAddress,
            });
        } catch (error: any) {
            await uow.rollback();
            // Xử lý lỗi nghiệp vụ từ service
            if (error.message.includes("Cannot have more than")) {
                 return handleError(res, 400, error.message);
            }
            return handleError(res, 500, error.message || error);
        }
    },

    /**
     * Lấy tất cả địa chỉ của một user.
     */
    getAllByUserId: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // **GIẢ ĐỊNH**: user_id được lấy từ token (req.user) sau khi authenticated
            const userId = req.params.userId; // Hoặc lấy từ req.user.id
             if (!userId) {
                 return handleError(res, 401, "User ID is missing or unauthorized");
            }

            const addresses = await userAddressService.getAllByUserId(uow, userId);

            return res.status(200).json({
                success: true,
                data: addresses,
            });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    /**
     * Lấy một địa chỉ cụ thể theo ID.
     */
    getById: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // **GIẢ ĐỊNH**: user_id được lấy từ token (req.user) sau khi authenticated
            const userId = req.body.user_id; // Hoặc lấy từ req.user.id
            const addressId = req.params.id;

            if (!userId) {
                 return handleError(res, 401, "User ID is missing or unauthorized");
            }

            const parsedAddressId = parseId(addressId);
            const address = await userAddressService.getById(uow, parsedAddressId, userId);

            if (!address) return handleError(res, 404, "Address not found or unauthorized access");

            return res.status(200).json({ success: true, data: address });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    /**
     * Cập nhật địa chỉ.
     */
    update: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // **GIẢ ĐỊNH**: user_id được lấy từ token (req.user) sau khi authenticated
            const userId = req.body.user_id; // Hoặc lấy từ req.user.id
            const addressId = req.params.id;
            const updateData: Partial<UserAddressAttributes> = req.body;

            if (!userId) {
                 return handleError(res, 401, "User ID is missing or unauthorized");
            }
            
            await uow.start();

            const parsedAddressId = parseId(addressId);
            const result = await userAddressService.update(uow, parsedAddressId, userId, updateData);

            if (!result) {
                await uow.rollback();
                return handleError(res, 404, "Update failed: Address not found or unauthorized");
            }

            await uow.commit();
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            await uow.rollback();
            return handleError(res, 500, error);
        }
    },

    /**
     * Xóa mềm (soft delete) một địa chỉ.
     */
    deleteOne: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // **GIẢ ĐỊNH**: user_id được lấy từ token (req.user) sau khi authenticated
            const userId = req.body.user_id; // Hoặc lấy từ req.user.id
            const addressId = req.params.id;

            if (!userId) {
                 return handleError(res, 401, "User ID is missing or unauthorized");
            }
            
            await uow.start();

            const parsedAddressId = parseId(addressId);
            const result = await userAddressService.deleteOne(uow, parsedAddressId, userId);

            if (result === "NOT_FOUND") {
                await uow.rollback();
                return handleError(res, 404, "Address not found or unauthorized");
            }
            
            await uow.commit();
            return res.status(204).send();
        } catch (error: any) {
            await uow.rollback();
            // Xử lý lỗi nghiệp vụ từ service
            if (error.message.includes("Cannot delete the only default address")) {
                 return handleError(res, 400, error.message);
            }
            return handleError(res, 500, error);
        }
    },
};

export default userAddressController;