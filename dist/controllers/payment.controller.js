"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const order_service_1 = require("../services/order.service");
const payment_service_1 = require("../services/payment.service");
const paymentStore_1 = require("../store/paymentStore");
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const getOrderIDFromWebHook_1 = require("../helpers/getOrderIDFromWebHook");
const paymentService = new payment_service_1.PaymentService;
const orderService = new order_service_1.OrderService;
const paymentController = {
    status: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const { id } = req.params;
            console.log(id);
            const orderCode = (0, getOrderIDFromWebHook_1.getOrderIDFromWebHook)(id);
            const payment = await paymentService.getPaymentById(uow, parseInt(orderCode));
            if (!payment)
                return (0, handleError_helper_1.default)(res, 404, "Payment not found");
            return res.status(200).json({
                status: payment.status
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, error);
        }
    },
    createPayment: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const body = req.body;
            console.log("body", body);
            const create = await paymentService.createPayment(uow, body);
            console.log("create", create);
            // ⬇️ Gắn timeout ngay khi tạo xong payment
            if (create?.orderCode) {
                (0, paymentStore_1.startPaymentTimeout)(create.orderCode);
                console.log("create order Code", create.orderCode);
            }
            return res.status(200).json(create);
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, error);
        }
    }
};
exports.default = paymentController;
//# sourceMappingURL=payment.controller.js.map