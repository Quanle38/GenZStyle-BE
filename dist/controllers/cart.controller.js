"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const cart_service_1 = require("../services/cart.service");
const cartService = new cart_service_1.CartService();
const cartController = {
    /**
     * [GET] Lấy giỏ hàng hiện tại của người dùng.
     * GET /api/v1/carts
     */
    getCart: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user || !user.id) {
                return (0, handleError_helper_1.default)(res, 401, "User not authenticated.");
            }
            const cart = await cartService.getOrCreateCart(uow, user.id);
            return res.status(200).json({
                success: true,
                message: "Fetched cart successfully",
                data: cart
            });
        }
        catch (error) {
            console.error("CartController: getCart failed", error);
            return (0, handleError_helper_1.default)(res, 500, error.message || "Failed to fetch cart");
        }
    },
    /**
     * [POST] Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng.
     * POST /api/v1/carts/items
     * Body: { variant_id: string, quantity: number }
     */
    addItem: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user || !user.id) {
                return (0, handleError_helper_1.default)(res, 401, "User not authenticated.");
            }
            const { variant_id, quantity } = req.body;
            if (!variant_id || !quantity) {
                return (0, handleError_helper_1.default)(res, 400, "Missing variant_id or quantity.");
            }
            const parsedQuantity = parseInt(quantity);
            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                return (0, handleError_helper_1.default)(res, 400, "Quantity must be a positive integer.");
            }
            await uow.start();
            await cartService.addItemToCart(uow, user.id, variant_id, parsedQuantity);
            await uow.commit();
            // ✅ Tải lại Cart đầy đủ sau khi commit với UnitOfWork mới
            const freshUow = new unitOfWork_1.UnitOfWork();
            const updatedCart = await cartService.getOrCreateCart(freshUow, user.id);
            return res.status(201).json({
                success: true,
                message: "Item added to cart successfully",
                data: updatedCart
            });
        }
        catch (error) {
            await uow.rollback();
            console.error("CartController: addItem failed", error);
            return (0, handleError_helper_1.default)(res, 500, error.message || "Failed to add item to cart");
        }
    },
    /**
     * [DELETE] Xóa một sản phẩm khỏi giỏ hàng.
     * DELETE /api/v1/carts/items?cartItemId=123
     */
    removeItem: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user || !user.id) {
                return (0, handleError_helper_1.default)(res, 401, "User not authenticated.");
            }
            const cartItemId = parseInt(req.query.cartItemId);
            if (isNaN(cartItemId)) {
                return (0, handleError_helper_1.default)(res, 400, "Invalid Cart Item ID format.");
            }
            await uow.start();
            const removed = await cartService.removeItemFromCart(uow, cartItemId);
            await uow.commit();
            if (!removed) {
                return (0, handleError_helper_1.default)(res, 404, "Cart item not found.");
            }
            return res.status(200).json({
                success: true,
                message: "Item removed from cart successfully"
            });
        }
        catch (error) {
            await uow.rollback();
            console.error("CartController: removeItem failed", error);
            return (0, handleError_helper_1.default)(res, 500, error.message || "Failed to remove item from cart");
        }
    },
    /**
     * [DELETE] Xóa toàn bộ giỏ hàng.
     * DELETE /api/v1/carts
     */
    clearCart: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user || !user.id) {
                return (0, handleError_helper_1.default)(res, 401, "User not authenticated.");
            }
            await uow.start();
            // Lấy cart hiện tại
            const cart = await cartService.getOrCreateCart(uow, user.id);
            if (!cart) {
                return (0, handleError_helper_1.default)(res, 404, "Cart not found.");
            }
            await cartService.clearCart(uow, cart.id);
            await uow.commit();
            return res.status(200).json({
                success: true,
                message: "Cart cleared successfully"
            });
        }
        catch (error) {
            await uow.rollback();
            console.error("CartController: clearCart failed", error);
            return (0, handleError_helper_1.default)(res, 500, error.message || "Failed to clear cart");
        }
    },
    async updateItem(req, res) {
        const uow = new unitOfWork_1.UnitOfWork();
        const cartService = new cart_service_1.CartService();
        const cartItemId = Number(req.params.cartItemId);
        const { quantity, variantId } = req.body;
        try {
            await uow.start();
            const updatedItem = await cartService.updateCartItem(uow, cartItemId, { quantity, variantId });
            await uow.commit();
            res.json({
                success: true,
                data: updatedItem
            });
        }
        catch (err) {
            await uow.rollback();
            throw err;
        }
    }
};
exports.default = cartController;
//# sourceMappingURL=cart.controller.js.map