"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const handleResponse_helper_1 = __importDefault(require("../helpers/handleResponse.helper"));
const checkId_1 = __importDefault(require("../helpers/checkId"));
const user_services_1 = require("../services/user.services");
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const userService = new user_services_1.UserService();
const userController = {
    // ===== LIST (CÓ PAGINATION) =====
    getAll: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const page = Number(req.query.page) || 1;
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const result = await userService.getAll(uow, page, limit);
            return (0, handleResponse_helper_1.default)(res, 200, {
                currentPage: page,
                totalPage: Math.ceil(result.count / limit),
                totalUser: result.count,
                data: result.users
            });
        }
        catch {
            return (0, handleError_helper_1.default)(res, 500, "Internal server error");
        }
    },
    // ===== GET BY ID =====
    getById: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const id = (0, checkId_1.default)(req.params.id);
            console.log("id", id);
            const user = await userService.getById(uow, id);
            if (!user) {
                return (0, handleError_helper_1.default)(res, 404, "User not found");
            }
            return (0, handleResponse_helper_1.default)(res, 200, {
                message: "Get user successfully",
                data: user
            });
        }
        catch {
            return (0, handleError_helper_1.default)(res, 500, "Internal server error");
        }
    },
    // ===== CREATE =====
    create: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            const user = await userService.create(uow, req.body);
            await uow.commit();
            return (0, handleResponse_helper_1.default)(res, 201, {
                message: "User created successfully",
                data: user
            });
        }
        catch (error) {
            await uow.rollback();
            console.error("Create user error:", error);
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || "Create user failed");
        }
    },
    // ===== UPDATE =====
    update: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            const body = { ...req.body };
            console.log(body);
            console.log(req.file);
            if (req.file) {
                body.avatar = req.file.path; // ✅ URL Cloudinary
            }
            const id = (0, checkId_1.default)(req.params.id);
            const user = await userService.update(uow, id, body);
            if (!user) {
                await uow.rollback();
                return (0, handleError_helper_1.default)(res, 400, "Update failed or User not found");
            }
            await uow.commit();
            return (0, handleResponse_helper_1.default)(res, 200, {
                message: "User updated successfully",
                data: user,
            });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, 500, "Update user failed");
        }
    },
    // ===== DELETE =====
    deleteOne: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            const id = (0, checkId_1.default)(req.params.id);
            const result = await userService.deleteOne(uow, id);
            if (result === "NOT_FOUND") {
                await uow.rollback();
                return (0, handleError_helper_1.default)(res, 404, "User not found");
            }
            if (result === "FORBIDDEN") {
                await uow.rollback();
                return (0, handleError_helper_1.default)(res, 403, "YOU DON'T HAVE PERMISSION");
            }
            await uow.commit();
            return (0, handleResponse_helper_1.default)(res, 200, {
                message: "User deleted successfully",
                data: null
            });
        }
        catch (error) {
            await uow.rollback();
            console.error("Delete user error:", error);
            return (0, handleError_helper_1.default)(res, 500, "Delete user failed");
        }
    }
};
exports.default = userController;
//# sourceMappingURL=user.controller.js.map