import { Request, Response } from "express"
import handleError from "../helpers/handleError.helper"
import { PaymentService } from "../services/payment.service"
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CreatePaymentPayload } from "../dtos/payment/request/createPaymentPayload";
import { SepayBodyResponse } from "../dtos/payment/response/sepayBodyResponse";

const paymentService = new PaymentService;

const paymentController = {
    heath: async (req: Request, res: Response) => {
        return res.status(200).json({
            mesaage: "ok"
        })
    },
    status: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const {id} = req.params;
            const payment =  await paymentService.getPaymentById(uow, parseInt(id));
            if(!payment) return handleError(res, 404, "Payment not found");
            return res.status(200).json({
                status : payment.status
            })

        } catch (error) {
            return handleError(res, 500, error)
        }
    },
    createPayment: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const body = req.body as CreatePaymentPayload;
            console.log("body",body)
            const isExist = await paymentService.getPaymentByOrderId(uow,body.order_id);
            if(isExist){
                return handleError(res, 400, `Order ${body.order_id} already has a payment. Cannot create multiple payments for one order.`)
            }
            const create = await paymentService.createPayment(uow, body);
            console.log("create",create)
            return res.status(200).json({
               qrUrl : create
            })
        } catch (error) {
            return handleError(res, 500, error)
        }
    },
    wedhook: async (req: Request, res: Response) => {
        try {
            const data : SepayBodyResponse = req.body;
            console.log("Sepay connect successfully");
            console.log("body" , data);
            return res.status(200).json({
                success : true
            })

        } catch (error) {
            return handleError(res, 500, error)
        }
    },
}
export default paymentController