import { Request, Response } from "express";
import { CreatePaymentPayload } from "../dtos/payment/request/createPaymentPayload";
import handleError from "../helpers/handleError.helper";
import { OrderService } from "../services/order.service";
import { PaymentService } from "../services/payment.service";
import { startPaymentTimeout } from "../store/paymentStore";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { getOrderIDFromWebHook } from "../helpers/getOrderIDFromWebHook";

const paymentService = new PaymentService;
const orderService = new OrderService;
const paymentController = {
   
    status: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const { id } = req.params;
            console.log(id)
            const orderCode = getOrderIDFromWebHook(id);
            const payment = await paymentService.getPaymentById(uow, parseInt(orderCode));
            if (!payment) return handleError(res, 404, "Payment not found");
            return res.status(200).json({
                status: payment.status
            })

        } catch (error) {
            return handleError(res, 500, error as string)
        }
    },
  
    createPayment: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const body = req.body as CreatePaymentPayload;
            console.log("body", body);

            const create = await paymentService.createPayment(uow, body);
            console.log("create", create);

            // ⬇️ Gắn timeout ngay khi tạo xong payment
            if (create?.orderCode) {
                startPaymentTimeout(create.orderCode);
                console.log("create order Code", create.orderCode)
            }

            return res.status(200).json(create);
        } catch (error) {
            return handleError(res, 500, error as string);
        }
    }
    

}
export default paymentController