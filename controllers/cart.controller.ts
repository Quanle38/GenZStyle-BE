// controllers/cart.controller.ts
import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CartService } from "../services/cart.service";
import { User } from "../models";

const cartService = new CartService();

const cartController = {
    /**
     * [GET] Lấy giỏ hàng hiện tại của người dùng.
     * GET /api/v1/carts
     */
    getCart: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const user: User = req.user;
            if (!user || !user.id) {
                return handleError(res, 401, "User not authenticated.");
            }

            const cart = await cartService.getOrCreateCart(uow, user.id);

            return res.status(200).json({
                success: true,
                message: "Fetched cart successfully",
                data: cart
            });
        } catch (error: any) {
            console.error("CartController: getCart failed", error);
            return handleError(res, 500, error.message || "Failed to fetch cart");
        }
    },

    /**
     * [POST] Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng.
     * POST /api/v1/carts/items
     * Body: { variant_id: string, quantity: number }
     */
    addItem: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const user: User = req.user;
            if (!user || !user.id) {
                return handleError(res, 401, "User not authenticated.");
            }

            const { variant_id, quantity } = req.body;

            if (!variant_id || !quantity) {
                return handleError(res, 400, "Missing variant_id or quantity.");
            }

            const parsedQuantity = parseInt(quantity);
            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                return handleError(res, 400, "Quantity must be a positive integer.");
            }

            await uow.start();

            await cartService.addItemToCart(
                uow,
                user.id,
                variant_id as string,
                parsedQuantity
            );

            await uow.commit();

            // ✅ Tải lại Cart đầy đủ sau khi commit với UnitOfWork mới
            const freshUow = new UnitOfWork();
            const updatedCart = await cartService.getOrCreateCart(freshUow, user.id);

            return res.status(201).json({
                success: true,
                message: "Item added to cart successfully",
                data: updatedCart
            });
        } catch (error: any) {
            await uow.rollback();
            console.error("CartController: addItem failed", error);
            return handleError(res, 500, error.message || "Failed to add item to cart");
        }
    },

    /**
     * [DELETE] Xóa một sản phẩm khỏi giỏ hàng.
     * DELETE /api/v1/carts/items?cartItemId=123
     */
    removeItem: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const user: User = req.user;
            if (!user || !user.id) {
                return handleError(res, 401, "User not authenticated.");
            }

            const cartItemId = parseInt(req.query.cartItemId as string);

            if (isNaN(cartItemId)) {
                return handleError(res, 400, "Invalid Cart Item ID format.");
            }

            await uow.start();

            const removed = await cartService.removeItemFromCart(uow, cartItemId);

            await uow.commit();

            if (!removed) {
                return handleError(res, 404, "Cart item not found.");
            }

            return res.status(200).json({
                success: true,
                message: "Item removed from cart successfully"
            });
        } catch (error: any) {
            await uow.rollback();
            console.error("CartController: removeItem failed", error);
            return handleError(res, 500, error.message || "Failed to remove item from cart");
        }
    },

    /**
     * [DELETE] Xóa toàn bộ giỏ hàng.
     * DELETE /api/v1/carts
     */
    clearCart: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const user: User = req.user;
            if (!user || !user.id) {
                return handleError(res, 401, "User not authenticated.");
            }

            await uow.start();

            // Lấy cart hiện tại
            const cart = await cartService.getOrCreateCart(uow, user.id);

            if (!cart) {
                return handleError(res, 404, "Cart not found.");
            }

            await cartService.clearCart(uow, cart.id);

            await uow.commit();

            return res.status(200).json({
                success: true,
                message: "Cart cleared successfully"
            });
        } catch (error: any) {
            await uow.rollback();
            console.error("CartController: clearCart failed", error);
            return handleError(res, 500, error.message || "Failed to clear cart");
        }
    }
};

export default cartController;