"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/cartCoupon.route.ts
const express_1 = require("express");
const cartCoupon_controller_1 = __importDefault(require("../controllers/cartCoupon.controller"));
const router = (0, express_1.Router)();
// authMiddleware đã được apply từ cartRouter cha
router.get("/", cartCoupon_controller_1.default.getCoupons);
router.post("/", cartCoupon_controller_1.default.applyCoupon);
router.delete("/:couponId", cartCoupon_controller_1.default.removeCoupon);
exports.default = router;
//# sourceMappingURL=cartCoupon.route.js.map