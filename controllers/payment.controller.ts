import { Request, Response } from "express"
import handleError from "../helpers/handleError.helper"
import { PaymentService } from "../services/payment.service"
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CreatePaymentPayload } from "../dtos/payment/request/createPaymentPayload";

const paymentService = new PaymentService;

const paymentController = {
    heath: async (req: Request, res: Response) => {
        return res.status(200).json({
            mesaage: "ok"
        })
    },
    status: async (req: Request, res: Response) => {
        try {

        } catch (error) {
            return handleError(res, 500, error)
        }
    },
    createPayment: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const body = req.body as CreatePaymentPayload;
            console.log("body",body)
            const create = await paymentService.createPayment(uow, body);
            console.log("create",create)
            return res.status(200).json({
                message : "success"
            })
        } catch (error) {
            return handleError(res, 500, error)
        }
    },
    wedhook: async (req: Request, res: Response) => {
        try {

        } catch (error) {
            return handleError(res, 500, error)
        }
    },
}
export default paymentController