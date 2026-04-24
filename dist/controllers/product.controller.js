"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const checkId_1 = __importDefault(require("../helpers/checkId"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const product_service_1 = require("../services/product.service");
const productService = new product_service_1.ProductService();
const productController = {
    getAll: async (req, res) => {
        try {
            const uow = new unitOfWork_1.UnitOfWork();
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await productService.getAll(uow, page, limit);
            return res.status(200).json(result);
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
    getById: async (req, res) => {
        try {
            const uow = new unitOfWork_1.UnitOfWork();
            const id = (0, checkId_1.default)(req.params.id);
            const product = await productService.getById(uow, id);
            if (!product)
                return (0, handleError_helper_1.default)(res, 404, "Product not found");
            return res.status(200).json({ data: product });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
    create: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            const created = await productService.create(uow, req.body);
            await uow.commit();
            return res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
    update: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            const id = (0, checkId_1.default)(req.params.id);
            const updated = await productService.update(uow, id, req.body);
            await uow.commit();
            return res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
    deleteOne: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            await uow.start();
            const id = (0, checkId_1.default)(req.params.id);
            await productService.deleteOne(uow, id);
            await uow.commit();
            return res.status(204).send();
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
    search: async (req, res) => {
        try {
            const uow = new unitOfWork_1.UnitOfWork();
            const result = await productService.search(uow, req.query);
            return res.status(200).json(result);
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, error.status || 500, error.message || error);
        }
    },
};
exports.default = productController;
//# sourceMappingURL=product.controller.js.map