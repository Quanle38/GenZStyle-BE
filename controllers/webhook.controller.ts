import { Request, Response } from "express";
import handleResponse from "../helpers/handleResponse.helper";
import { WebhookResponse } from "../dtos/payment/response/webhookResponse";
import { orders } from "../store/paymentStore";
import { OrderService } from "../services/order.service";
import { PaymentService } from "../services/payment.service";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { getOrderIDFromWebHook } from "../helpers/getOrderIDFromWebHook";

const paymentService = new PaymentService;
const orderService = new OrderService;

export const webhookController = {

    webhook: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const payload: WebhookResponse = req.body;
            console.log("webhook nhan duoc giao dich")
            console.log("paylaod ,", JSON.stringify(payload, null, 2));
            console.log("transactionID : ", payload.id)
            console.log("referencecode : ", payload.referenceCode)
            console.log("Ordercode : ", payload.code);
            console.log("amount : ", payload.transferAmount.toLocaleString("vi-VN"))
            const code = payload.code as string | null;
            if (!code) return handleResponse(res, 404, {
                success: false,
                message: "Ko tim thay OrderCode"
            })
            if (code) {
                // const order = orders[code];
                const order = await paymentService.getPaymentById(uow, Number(getOrderIDFromWebHook(code)))
                if (order?.status.toLowerCase() === "pending") {
                    if (Number(payload.transferAmount) >= Number(order.amount)) {
                        // orders[code].status = "success";
                        // orders[code].paidAt = new Date().toISOString();
                        // orders[code].transactionId = payload.id;
                        // orders[code].referenceCode = payload.referenceCode;
                        console.log(`payment success Order ${code} => Paid ${payload.transferAmount.toLocaleString("vi-VN")} `);
                        await paymentService.updatePaymentStatus(uow, Number(getOrderIDFromWebHook(code)), "Completed");
                        const content = order.content?.split("-")[1];
                        console.log(content);
                        if(!content) {
                            console.warn("sai roi")
                            return;
                        };
                        await orderService.updateOrderStatus(uow,content , "Completed" );

                    } else {
                        console.warn(`payment warning Order ${code} - So tien ko khop. Can : ${order.amount}, Nhan : ${payload.transferAmount}`)

                    }
                } else {
                    // console.warn(`payment warning OrderCode ${code} da o trang thai ${order.status} `)
                }
            } else {
                console.warn("Webhook ko tim thay order voi code : ", code)
            }

            return handleResponse(res, 200, {
                success: true,
                message: "Webhook Received"
            });
        } catch (error: any) {
            console.error("CartController: getCart failed", error);

        }

    }

}