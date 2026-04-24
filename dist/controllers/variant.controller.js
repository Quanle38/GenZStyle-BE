"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const checkId_1 = __importDefault(require("../helpers/checkId"));
const variant_service_1 = require("../services/variant.service");
const variantController = {
    getAll: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const { count, rows } = await variant_service_1.variantService.getAll(uow, page, limit);
            return res.status(200).json({
                currentPage: page,
                totalPage: Math.ceil(count / limit),
                totalVariant: count,
                data: rows,
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, "error");
        }
    },
    getById: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const id = (0, checkId_1.default)(req.params.id);
            const variant = await variant_service_1.variantService.getById(uow, id);
            if (!variant)
                return (0, handleError_helper_1.default)(res, 404, "Variant not found");
            return res.status(200).json({ data: variant });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, 'error');
        }
    },
    create: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const newVariant = await variant_service_1.variantService.create(uow, req.body);
            return res.status(201).json({ data: newVariant });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, "error");
        }
    },
    autoImportVariant: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const result = await variant_service_1.variantService.autoImportVariant(uow, req.body);
            return res.status(200).json({ data: result });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, "error");
        }
    },
    deleteOne: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const id = (0, checkId_1.default)(req.params.id);
            const result = await variant_service_1.variantService.deleteOne(uow, id);
            if (!result)
                return (0, handleError_helper_1.default)(res, 404, "Variant not found");
            return res.status(204).send();
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, "error");
        }
    },
    update: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const id = (0, checkId_1.default)(req.params.id);
            const result = await variant_service_1.variantService.update(uow, id, req.body);
            if (result === null)
                return (0, handleError_helper_1.default)(res, 404, "Variant not found");
            if (result === "NO_FIELDS")
                return (0, handleError_helper_1.default)(res, 400, "No fields to update");
            if (result === "FAILED")
                return (0, handleError_helper_1.default)(res, 400, "Update failed");
            return res.status(200).json({ data: result });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, "error");
        }
    },
};
exports.default = variantController;
//# sourceMappingURL=variant.controller.js.map