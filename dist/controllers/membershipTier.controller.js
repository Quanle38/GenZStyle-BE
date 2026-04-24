"use strict";
// =====================================
// File: membershipTier.controller.ts (FINAL)
// =====================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const membership_service_1 = __importDefault(require("../services/membership.service"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const membershipTierController = {
    // 1. Lấy tất cả các hạng (getAll) - Dùng GET /
    getAll: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const tiers = await membership_service_1.default.getAll(uow);
            return res.status(200).json({ data: tiers });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, error);
        }
    },
    // 2. Lấy hạng thành viên theo User ID (getByUserId) - Dùng GET /user-rank?userId=...
    getByUserId: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const userId = req.query.userId;
            if (!userId)
                return (0, handleError_helper_1.default)(res, 400, "Missing User ID in query parameters.");
            const tier = await membership_service_1.default.getByUserId(uow, userId);
            return res.status(200).json({ data: tier });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 404, error);
        }
    },
    // 3. Tạo hạng thành viên mới (create) - Dùng POST /
    create: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            const data = await membership_service_1.default.create(uow, req.body);
            await uow.commit();
            return res.status(201).json({
                success: true,
                message: "Membership Tier created successfully",
                data
            });
        }
        catch (error) {
            if (uow.isTransactionActive())
                await uow.rollback();
            return (0, handleError_helper_1.default)(res, 400, error);
        }
    },
    // 4. Cập nhật hạng thành viên (update) - Dùng PUT /update?id=...
    update: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            // >> Lấy ID từ Query Parameters theo yêu cầu <<
            const id = req.query.id;
            if (!id)
                return (0, handleError_helper_1.default)(res, 400, "Missing Tier ID in query parameters.");
            const result = await membership_service_1.default.update(uow, id, req.body);
            await uow.commit();
            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            if (uow.isTransactionActive())
                await uow.rollback();
            return (0, handleError_helper_1.default)(res, 400, error);
        }
    },
    // 5. Xóa mềm hạng thành viên (delete) - Dùng DELETE /delete?id=...
    delete: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            // >> Lấy ID từ Query Parameters theo yêu cầu <<
            const id = req.query.id;
            if (!id)
                return (0, handleError_helper_1.default)(res, 400, "Missing Tier ID in query parameters.");
            await membership_service_1.default.delete(uow, id);
            await uow.commit();
            return res.status(204).send();
        }
        catch (error) {
            if (uow.isTransactionActive())
                await uow.rollback();
            return (0, handleError_helper_1.default)(res, 404, error);
        }
    }
};
exports.default = membershipTierController;
//# sourceMappingURL=membershipTier.controller.js.map