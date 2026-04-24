"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookController = void 0;
const handleResponse_helper_1 = __importDefault(require("../helpers/handleResponse.helper"));
const order_service_1 = require("../services/order.service");
const payment_service_1 = require("../services/payment.service");
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const getOrderIDFromWebHook_1 = require("../helpers/getOrderIDFromWebHook");
const paymentService = new payment_service_1.PaymentService;
const orderService = new order_service_1.OrderService;
exports.webhookController = {
    webhook: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const payload = req.body;
            console.log("webhook nhan duoc giao dich");
            console.log("paylaod ,", JSON.stringify(payload, null, 2));
            console.log("transactionID : ", payload.id);
            console.log("referencecode : ", payload.referenceCode);
            console.log("Ordercode : ", payload.code);
            console.log("amount : ", payload.transferAmount.toLocaleString("vi-VN"));
            const code = payload.code;
            if (!code)
                return (0, handleResponse_helper_1.default)(res, 404, {
                    success: false,
                    message: "Ko tim thay OrderCode"
                });
            if (code) {
                // const order = orders[code];
                const order = await paymentService.getPaymentById(uow, Number((0, getOrderIDFromWebHook_1.getOrderIDFromWebHook)(code)));
                if (order?.status.toLowerCase() === "pending") {
                    if (Number(payload.transferAmount) >= Number(order.amount)) {
                        // orders[code].status = "success";
                        // orders[code].paidAt = new Date().toISOString();
                        // orders[code].transactionId = payload.id;
                        // orders[code].referenceCode = payload.referenceCode;
                        console.log(`payment success Order ${code} => Paid ${payload.transferAmount.toLocaleString("vi-VN")} `);
                        await paymentService.updatePaymentStatus(uow, Number((0, getOrderIDFromWebHook_1.getOrderIDFromWebHook)(code)), "Completed");
                        const content = order.content?.split("-")[1];
                        console.log(content);
                        if (!content) {
                            console.warn("sai roi");
                            return;
                        }
                        ;
                        await orderService.updateOrderStatus(uow, content, "Completed");
                    }
                    else {
                        console.warn(`payment warning Order ${code} - So tien ko khop. Can : ${order.amount}, Nhan : ${payload.transferAmount}`);
                    }
                }
                else {
                    // console.warn(`payment warning OrderCode ${code} da o trang thai ${order.status} `)
                }
            }
            else {
                console.warn("Webhook ko tim thay order voi code : ", code);
            }
            return (0, handleResponse_helper_1.default)(res, 200, {
                success: true,
                message: "Webhook Received"
            });
        }
        catch (error) {
            console.error("CartController: getCart failed", error);
        }
    }
};
//# sourceMappingURL=webhook.controller.js.map