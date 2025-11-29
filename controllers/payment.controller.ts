import { Request, Response } from "express"
import handleError from "../helpers/handleError.helper"
import { PaymentService } from "../services/payment.service"
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CreatePaymentPayload } from "../dtos/payment/request/createPaymentPayload";
import { SepayBodyResponse } from "../dtos/payment/response/sepayBodyResponse";
import { Payment } from "../models";
import { TransactionStatus } from "../enums/transaction";
import { SplitId } from "../helpers/splitId";
import { OrderService } from "../services/order.service";
import { OrderStatus } from "../enums/order";
import { or } from "sequelize";

const paymentService = new PaymentService;
const orderService = new OrderService;
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
                gateway: gateway,
                status: TransactionStatus.Completed
            };

            if (transferType === "in") {
                await paymentService.updatePayment(uow, payment.id, update);
                await orderService.updateOrderStatus(uow, payment.order_id, OrderStatus.COMPLETED);
            }

            await uow.commit();

            return res.status(200).json({ success: true });

        } catch (error) {
            return handleError(res, 500, error);
        }
    },
    // Giả định:
    // 1. Nếu thanh toán được tạo thành công, đơn hàng sẽ chuyển từ PENDING sang PROCESSING.
    // 2. Chỉ chấp nhận tạo thanh toán cho đơn hàng ở trạng thái PENDING.

    completePayment: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();

        try {
            const body = req.body as CreatePaymentPayload;
            console.log("body", body);

            // 1. Kiểm tra sự tồn tại của thanh toán
            const isExist = await paymentService.getPaymentByOrderId(uow, body.order_id);
            if (isExist) {
                return handleError(res, 400, `Order ${body.order_id} already has a payment. Cannot create multiple payments for one order.`);
            }

            // 2. Lấy thông tin đơn hàng và kiểm tra trạng thái
            const order = await orderService.getOrderById(uow, body.order_id);

            if (!order) {
                return handleError(res, 404, `Order ${body.order_id} not found.`);
            }

            // Chỉ cho phép tạo thanh toán cho đơn hàng ở trạng thái PENDING
            if (order.status !== OrderStatus.DELIVERED) {
                return handleError(res, 400, `Cannot create payment for order ${body.order_id} with status ${order.status}. Payment is only allowed for status ${OrderStatus.DELIVERED}.`);
            }
            await uow.start();
            // 3. Tạo thanh toán (QR code/URL)
            const create = await paymentService.createPayment(uow, body);
            console.log("create", create);

            // 4. Cập nhật trạng thái đơn hàng sang PROCESSING
            // Bắt đầu một transaction (Unit of Work) để đảm bảo tính toàn vẹn (ACID)

            await orderService.updateOrderStatus(uow, body.order_id, OrderStatus.COMPLETED);

            await uow.commit(); // Hoàn tất transaction

            return res.status(200).json({
                qrUrl: create,
                message: `Payment created successfully. Order status updated to ${OrderStatus.COMPLETED}.`
            });
        } catch (error) {
            // Nếu có lỗi, rollback transaction (quan trọng khi dùng UoW)
            await uow.rollback();
            return handleError(res, 500, error);
        }
    }

}
export default paymentController