// routes/cart.route.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import cartController from "../controllers/cart.controller";
import cartCouponRouter from "./cartCoupon.route";

const cartRouter = Router();

cartRouter.use(authMiddleware);

// Mount cartCoupon routes vào /coupons
// -> /api/v1/cart/coupons
cartRouter.use("/coupons", cartCouponRouter);

cartRouter.get("/", cartController.getCart);
cartRouter.post("/items", cartController.addItem);
cartRouter.delete("/items", cartController.removeItem);
cartRouter.put("/items/:cartItemId", cartController.updateItem);

export default cartRouter;