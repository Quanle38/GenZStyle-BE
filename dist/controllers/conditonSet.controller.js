"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const conditionSet_service_1 = require("../services/conditionSet.service");
const checkId_1 = __importDefault(require("../helpers/checkId"));
const conditionSetController = {
    // =====================
    // GET ALL
    // =====================
    getAll: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const { count, rows } = await conditionSet_service_1.conditionSetService.getAll(uow, page, limit);
            return res.status(200).json({
                success: true,
                message: "Get condition sets successfully",
                currentPage: page,
                totalPage: Math.ceil(count / limit),
                totalConditionSet: count,
                data: rows,
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, "Error fetching condition sets");
        }
    },
    // =====================
    // GET BY ID
    // =====================
    getById: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const id = (0, checkId_1.default)(req.params.id);
            const result = await conditionSet_service_1.conditionSetService.getById(uow, id);
            if (!result) {
                return (0, handleError_helper_1.default)(res, 404, "ConditionSet not found");
            }
            return res.status(200).json({
                success: true,
                message: "Get condition set successfully",
                data: result,
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, "Error fetching condition set");
        }
    },
    // =====================
    // CREATE
    // =====================
    create: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const result = await conditionSet_service_1.conditionSetService.create(uow, req.body);
            return res.status(201).json({
                success: true,
                message: "ConditionSet created successfully",
                data: result,
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 400, error.message || "Create failed");
        }
    },
    // =====================
    // DELETE
    // =====================
    deleteOne: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const id = (0, checkId_1.default)(req.params.id);
            const deletedCount = await conditionSet_service_1.conditionSetService.deleteOne(uow, id);
            if (deletedCount === 0) {
                return (0, handleError_helper_1.default)(res, 404, "ConditionSet not found");
            }
            return res.status(200).json({
                success: true,
                message: "ConditionSet deleted successfully",
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, "Delete failed");
        }
    },
    // =====================
    // UPDATE
    // =====================
    update: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const id = (0, checkId_1.default)(req.params.id);
            const result = await conditionSet_service_1.conditionSetService.update(uow, id, req.body);
            return res.status(200).json({
                success: true,
                message: "ConditionSet updated successfully",
                data: result,
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 400, error.message || "Update failed");
        }
    },
};
exports.default = conditionSetController;
//# sourceMappingURL=conditonSet.controller.js.map