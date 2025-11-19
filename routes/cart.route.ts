// routes/cart.router.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import cartController from "../controllers/cart.controller";


const cartRouter = Router();


// Áp dụng authMiddleware cho tất cả các route giỏ hàng
cartRouter.use(authMiddleware);

/**
 * @route GET /api/v1/carts
 * @desc Lấy giỏ hàng (tạo mới nếu chưa có)
 * @access Private (Auth)
 */
cartRouter.get("/", cartController.getCart);

/**
 * @route POST /api/v1/carts/items
 * @desc Thêm/Cập nhật item vào giỏ hàng
 * @access Private (Auth)
 */
cartRouter.post("/items", cartController.addItem);

/**
 * @route DELETE /api/v1/carts/items/:cartItemId
 * @desc Xóa mềm một item khỏi giỏ hàng
 * @access Private (Auth)
 */
cartRouter.delete("/items", cartController.removeItem);


export default cartRouter;

// --- Lưu ý: Bạn cần thêm cartRouter vào main app/index.ts của bạn ---
// app.use("/api/v1/carts", cartRouter);