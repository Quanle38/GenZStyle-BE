// controllers/favorite.controller.ts
import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { FavoriteService } from "../services/favorite.service";
import { User } from "../models";
import parseId from "../helpers/checkId";


const favoriteService = new FavoriteService();

const favoriteController = {
    /**
     * [GET] Lấy danh sách sản phẩm yêu thích của người dùng.
     */
    getAllByCurrentUser: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // **GIẢ ĐỊNH**: userId được lấy từ req.user sau khi Auth Middleware chạy
            const user: User = req.user;

            if (!user) {
                return handleError(res, 401, "User not authenticated.");
            }
            const favorites = await favoriteService.getAllfavorite(uow, user.id);

            return res.status(200).json({
                success: true,
                data: favorites,
            });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },
    getAllByUserId: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // **GIẢ ĐỊNH**: userId được lấy từ req.user sau khi Auth Middleware chạy
            if (!req.query.id) {
                return handleError(res, 400, "User Id missing.");
            }
            const userId = parseId(req.query.id as string);
            const existingUser = await uow.users.findById(userId)
            if (!existingUser) {
                return handleError(res, 404, "User not found");
            }
            const favorites = await favoriteService.getAllfavorite(uow, userId);

            return res.status(200).json({
                success: true,
                data: favorites,
            });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },
    /**
     * [POST] Thêm/Xóa sản phẩm khỏi danh sách yêu thích (Toggle).
     * Yêu cầu: { productId: string }
     */
    toggleFavorite: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // **GIẢ ĐỊNH**: userId được lấy từ req.user sau khi Auth Middleware chạy
            const user: User = req.user;

            if (!user) {
                return handleError(res, 401, "User not authenticated.");
            } // Thay bằng req.user.id trong thực tế
            const { productId } = req.body;

            if (!user.id || !productId) {
                return handleError(res, 400, "Missing required fields: userId and productId");
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
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 500, error.message || error);
        }
    },
};

export default favoriteController;