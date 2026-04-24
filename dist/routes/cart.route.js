"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/cart.route.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const cart_controller_1 = __importDefault(require("../controllers/cart.controller"));
const cartCoupon_route_1 = __importDefault(require("./cartCoupon.route"));
const cartRouter = (0, express_1.Router)();
cartRouter.use(auth_middleware_1.authMiddleware);
// Mount cartCoupon routes vào /coupons
// -> /api/v1/cart/coupons
cartRouter.use("/coupons", cartCoupon_route_1.default);
cartRouter.get("/", cart_controller_1.default.getCart);
cartRouter.post("/items", cart_controller_1.default.addItem);
cartRouter.delete("/items", cart_controller_1.default.removeItem);
cartRouter.put("/items/:cartItemId", cart_controller_1.default.updateItem);
exports.default = cartRouter;
//# sourceMappingURL=cart.route.js.map