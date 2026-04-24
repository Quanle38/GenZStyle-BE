"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const auth_service_1 = require("../services/auth.service");
const authController = {
    login: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            const result = await auth_service_1.authService.login(uow, req.body);
            await uow.commit();
            return res.status(200).json({ message: "Login successfully", data: result });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
    register: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const body = req.body;
            await uow.start();
            if (req.file) {
                body.avatar = req.file.path; // ✅ URL Cloudinary
            }
            const result = await auth_service_1.authService.register(uow, body);
            await uow.commit();
            return res.status(201).json({ message: "Register successfully", data: result });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
    refreshToken: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            const token = req.headers["authorization"]?.split(" ")[1];
            console.log(token);
            const result = await auth_service_1.authService.refreshToken(uow, token);
            await uow.commit();
            return res.status(200).json({ message: "Token refreshed successfully", data: result });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
    logout: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            const token = req.headers["authorization"]?.split(" ")[1];
            await auth_service_1.authService.logout(uow, token);
            await uow.commit();
            return res.status(200).json({ message: "Logout successfully" });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
    me: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const token = req.headers["authorization"]?.split(" ")[1];
            const result = await auth_service_1.authService.me(uow, token);
            return res.status(200).json({ message: "Fetch user successfully", data: { user: result } });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
};
exports.default = authController;
//# sourceMappingURL=auth.controller.js.map