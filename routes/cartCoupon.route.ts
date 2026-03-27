// routes/cartCoupon.route.ts
import { Router } from "express";
import cartCouponController from "../controllers/cartCoupon.controller";

const router = Router();

// authMiddleware đã được apply từ cartRouter cha
router.get("/", cartCouponController.getCoupons);
router.post("/", cartCouponController.applyCoupon);
router.delete("/:couponId", cartCouponController.removeCoupon);

export default router;