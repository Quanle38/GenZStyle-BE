import { Router } from "express";
import couponController from "../controllers/coupon.controller";

const couponRouter = Router();
couponRouter.get("/",couponController.getAllCoupons);
couponRouter.get("/get-all-by-user-id",couponController.getAllCouponByUserId);
couponRouter.get("/get-by-code",couponController.getCouponByCode);
couponRouter.post("/create",couponController.createCoupon);
couponRouter.post("/apply-coupon",couponController.applyCoupon);
export default couponRouter;
