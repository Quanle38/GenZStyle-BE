"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = __importDefault(require("../controllers/payment.controller"));
const paymentRouter = (0, express_1.Router)();
paymentRouter.post("/create", payment_controller_1.default.createPayment);
paymentRouter.get("/:id/status", payment_controller_1.default.status);
exports.default = paymentRouter;
//# sourceMappingURL=payment.route.js.map