import { Request, Response } from "express"
import handleError from "../helpers/handleError.helper"
import { PaymentService } from "../services/payment.service"
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CreatePaymentPayload } from "../dtos/payment/request/createPaymentPayload";
import { SepayBodyResponse } from "../dtos/payment/response/sepayBodyResponse";
import { Payment } from "../models";
import { TransactionStatus } from "../enums/transaction";
import { SplitId } from "../helpers/splitId";

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
            const { id } = req.params;
            const payment = await paymentService.getPaymentById(uow, parseInt(id));
            if (!payment) return handleError(res, 404, "Payment not found");
            return res.status(200).json({
                status: payment.status
            })

        } catch (error) {
            return handleError(res, 500, error)
        }
    },
    createPayment: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const body = req.body as CreatePaymentPayload;
            console.log("body", body)
            const isExist = await paymentService.getPaymentByOrderId(uow, body.order_id);
            if (isExist) {
                return handleError(res, 400, `Order ${body.order_id} already has a payment. Cannot create multiple payments for one order.`)
            }
            const create = await paymentService.createPayment(uow, body);
            console.log("create", create)
            return res.status(200).json({
                qrUrl: create
            })
        } catch (error) {
            return handleError(res, 500, error)
        }
    },
    wedhook: async (req: Request, res: Response) => {
        console.warn("🔔 WEBHOOK CALLED - START"); // Thêm log này ĐẦU TIÊN
        console.warn("Headers:", req.headers);
        console.warn("Body:", req.body);
        const uow = new UnitOfWork();
        try {
            const data = req.body;
            console.log("data:", data)
            if (!data || typeof data !== "object") {

                return res.status(400).json({
                    success: false,
                    message: "Invalid webhook data"
                });
            }
            const {
                gateway,
                transactionDate,
                accountNumber,
                subAccount,
                transferType,
                transferAmount,
                accumulated,
                code,
                content,
                referenceCode,
                description
            } = data;

            if (!referenceCode || !transferType || !transferAmount) { // Fix: Thêm ! để check null/undefined
                console.log("Thieu truong ")
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
            }

            let amountIn = 0;
            if (transferType === "in") {
                amountIn = Number(transferAmount);
            }

            // const existPayment = await paymentService.checkDuplicatePayment(uow, referenceCode);
            // if (existPayment) {
            //     console.log(" giao dich bi trung ")

            //     return res.json({
            //         success: true,
            //         message: "Duplicate transaction ignored"
            //     });
            // }

            // console.log("Sepay connect successfully");
            // console.log("body", data);

            // Fix: Tìm payment theo content/description thay vì referenceCode
            // Vì referenceCode trong webhook là mã giao dịch từ ngân hàng
            // Còn ID payment của bạn nằm trong content/description
            const paymentId = content || description; // ID payment của bạn (PM000001)
            if (!paymentId) {
                console.log("Ko co paymentID")
                return res.status(400).json({
                    success: false,
                    message: "Payment ID not found in transaction content"
                });
            }
            const id = SplitId(code);
            const payment = await paymentService.getPaymentById(uow, id);
            if (!payment) {
                console.log("Ko co payment")
                return res.status(404).json({
                    success: false,
                    message: "Payment not found"
                });
            }

            const update: Partial<Payment> = {
                reference_number: referenceCode,
                status: TransactionStatus.Completed
            };

            if (transferType === "in") {
                
                await paymentService.updatePayment(uow, payment.id, update);
            }

            await uow.commit();

            return res.status(200).json({ success: true });

        } catch (error) {
            return handleError(res, 500, error)
        }
    },
}
export default paymentController