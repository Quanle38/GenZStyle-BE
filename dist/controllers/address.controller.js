"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const checkId_1 = __importDefault(require("../helpers/checkId"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const userAddress_services_1 = require("../services/userAddress.services");
const userAddressService = new userAddress_services_1.UserAddressService();
const userAddressController = {
    /**
     * Tạo địa chỉ mới cho user đang đăng nhập
     */
    create: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user) {
                return (0, handleError_helper_1.default)(res, 401, "Unauthorized");
            }
            const addressData = req.body;
            if (!addressData.full_address || !addressData.label) {
                return (0, handleError_helper_1.default)(res, 400, "Missing required fields: full_address and label");
            }
            await uow.start();
            const createdAddress = await userAddressService.create(uow, user.id, addressData);
            await uow.commit();
            return res.status(201).json({
                success: true,
                message: "User address created successfully",
                data: createdAddress,
            });
        }
        catch (error) {
            await uow.rollback();
            if (error.message?.includes("Cannot have more than")) {
                return (0, handleError_helper_1.default)(res, 400, error.message);
            }
            return (0, handleError_helper_1.default)(res, 500, error.message || "Internal server error");
        }
    },
    /**
     * Lấy tất cả địa chỉ của user đang đăng nhập
     */
    getAllByUserId: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user) {
                return (0, handleError_helper_1.default)(res, 401, "Unauthorized");
            }
            const addresses = await userAddressService.getAllByUserId(uow, user.id);
            return res.status(200).json({
                success: true,
                data: addresses,
            });
        }
        catch {
            return (0, handleError_helper_1.default)(res, 500, "Internal server error");
        }
    },
    /**
     * Lấy một địa chỉ theo ID (chỉ của user hiện tại)
     */
    getById: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user) {
                return (0, handleError_helper_1.default)(res, 401, "Unauthorized");
            }
            const addressId = (0, checkId_1.default)(req.params.id);
            const address = await userAddressService.getById(uow, addressId, user.id);
            if (!address) {
                return (0, handleError_helper_1.default)(res, 404, "Address not found or unauthorized access");
            }
            return res.status(200).json({
                success: true,
                data: address,
            });
        }
        catch {
            return (0, handleError_helper_1.default)(res, 500, "Internal server error");
        }
    },
    /**
     * Cập nhật địa chỉ (chỉ của user hiện tại)
     */
    update: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user) {
                return (0, handleError_helper_1.default)(res, 401, "Unauthorized");
            }
            const addressId = (0, checkId_1.default)(req.params.id);
            const updateData = req.body;
            await uow.start();
            const result = await userAddressService.update(uow, addressId, user.id, updateData);
            if (!result) {
                await uow.rollback();
                return (0, handleError_helper_1.default)(res, 404, "Update failed: Address not found or unauthorized");
            }
            await uow.commit();
            return res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, 500, "Internal server error");
        }
    },
    /**
     * Xóa mềm địa chỉ (chỉ của user hiện tại)
     */
    deleteOne: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user) {
                return (0, handleError_helper_1.default)(res, 401, "Unauthorized");
            }
            const addressId = (0, checkId_1.default)(req.params.id);
            await uow.start();
            const result = await userAddressService.deleteOne(uow, addressId, user.id);
            if (result === "NOT_FOUND") {
                await uow.rollback();
                return (0, handleError_helper_1.default)(res, 404, "Address not found or unauthorized");
            }
            await uow.commit();
            return res.status(204).send();
        }
        catch (error) {
            await uow.rollback();
            if (error.message?.includes("Cannot delete the only default address")) {
                return (0, handleError_helper_1.default)(res, 400, error.message);
            }
            return (0, handleError_helper_1.default)(res, 500, "Internal server error");
        }
    },
};
exports.default = userAddressController;
//# sourceMappingURL=address.controller.js.map