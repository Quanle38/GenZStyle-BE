"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_route_1 = __importDefault(require("./user.route"));
const product_route_1 = __importDefault(require("./product.route"));
const auth_route_1 = __importDefault(require("./auth.route"));
const variant_route_1 = __importDefault(require("./variant.route"));
const coupon_route_1 = __importDefault(require("./coupon.route"));
const favorite_route_1 = __importDefault(require("./favorite.route"));
const membership_route_1 = __importDefault(require("./membership.route"));
const cart_route_1 = __importDefault(require("./cart.route"));
const order_route_1 = __importDefault(require("./order.route"));
const payment_route_1 = __importDefault(require("./payment.route"));
const address_route_1 = __importDefault(require("./address.route"));
const conditionSet_route_1 = __importDefault(require("./conditionSet.route"));
const history_route_1 = __importDefault(require("./history.route"));
const webhook_route_1 = __importDefault(require("./webhook.route"));
const report_route_1 = __importDefault(require("./report.route"));
const routeAPI = (app) => {
    app.use("/api/v1/user", user_route_1.default);
    app.use("/api/v1/product", product_route_1.default);
    app.use("/api/v1/auth", auth_route_1.default);
    app.use("/api/v1/variant", variant_route_1.default);
    app.use("/api/v1/coupon", coupon_route_1.default);
    app.use("/api/v1/favorite", favorite_route_1.default);
    app.use("/api/v1/membership", membership_route_1.default);
    app.use("/api/v1/cart", cart_route_1.default);
    app.use("/api/v1/order", order_route_1.default);
    app.use("/api/v1/payment", payment_route_1.default);
    app.use("/api/v1/user-address", address_route_1.default);
    app.use("/api/v1/condition-set", conditionSet_route_1.default);
    app.use("/api/v1/history", history_route_1.default);
    app.use("/api/v1/webhook", webhook_route_1.default);
    app.use("/api/v1/report", report_route_1.default);
};
exports.default = routeAPI;
//# sourceMappingURL=index.route.js.map