"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const favorite_service_1 = require("../services/favorite.service");
const email_service_1 = require("../services/email.service");
const checkId_1 = __importDefault(require("../helpers/checkId"));
const favoriteService = new favorite_service_1.FavoriteService();
const emailService = new email_service_1.EmailService();
const favoriteController = {
    /**
     * [GET] Lấy danh sách sản phẩm yêu thích của người dùng.
     */
    getAllByCurrentUser: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user) {
                return (0, handleError_helper_1.default)(res, 401, "User not authenticated.");
            }
            const favorites = await favoriteService.getAllfavorite(uow, user.id);
            return res.status(200).json({
                success: true,
                data: favorites,
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, error);
        }
    },
    getAllByUserId: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            // **GIẢ ĐỊNH**: userId được lấy từ req.user sau khi Auth Middleware chạy
            if (!req.query.id) {
                return (0, handleError_helper_1.default)(res, 400, "User Id missing.");
            }
            const userId = (0, checkId_1.default)(req.query.id);
            const existingUser = await uow.users.findById(userId);
            if (!existingUser) {
                return (0, handleError_helper_1.default)(res, 404, "User not found");
            }
            const favorites = await favoriteService.getAllfavorite(uow, userId);
            return res.status(200).json({
                success: true,
                data: favorites,
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, error);
        }
    },
    /**
     * [POST] Thêm/Xóa sản phẩm khỏi danh sách yêu thích (Toggle).
     * Yêu cầu: { productId: string }
     */
    toggleFavorite: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user) {
                return (0, handleError_helper_1.default)(res, 401, "User not authenticated.");
            }
            const { productId } = req.body;
            if (!productId) {
                return (0, handleError_helper_1.default)(res, 400, "Missing productId");
            }
            await uow.start();
            const result = await favoriteService.toggleFavorite(uow, user.id, productId);
            await uow.commit();
            if (result === "REMOVED") {
                return res.status(200).json({
                    success: true,
                    message: "Product removed from favorites",
                    is_favorited: false,
                });
            }
            return res.status(201).json({
                success: true,
                message: "Product added to favorites",
                is_favorited: true,
                data: result,
            });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, 500, error.message || error);
        }
    },
    sendEmail: async (req, res) => {
        try {
            await emailService.sendMail("leq85151@gmail.com", "Hello", "<h1>UUIIAA</h1>");
            return res.status(200).json({
                success: true,
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, error);
        }
    },
};
exports.default = favoriteController;
//# sourceMappingURL=favoriteController.js.map