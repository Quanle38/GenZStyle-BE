// services/payment.service.ts
import { CreatePaymentPayload } from "../dtos/payment/request/createPaymentPayload";
import { UpdatePaymentPayload } from "../dtos/payment/request/updatePaymentPayload";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { Payment } from "../models/payment.model";
import { TransactionStatus } from "../enums/transaction";
import axios from "axios";
import { generateIdByFormat } from "../helpers/generateId";


export class PaymentService {
    /**
     * 🔄 Tạo một giao dịch thanh toán mới (1 order chỉ có 1 payment)
     */
    async createPayment(
        uow: UnitOfWork,
        body: CreatePaymentPayload
    ): Promise<string> {
        const bank = process.env.BANK;
        const account = process.env.ACCOUNT;
        body.status = TransactionStatus.Pending;
        console.log(body)
        const create = await uow.payment.createPayment({...body,type : "in"});
        const id =   generateIdByFormat("PM",6, create.id);
        const linkQR = `https://qr.sepay.vn/img?acc=${account}&bank=${bank}&amount=${body.amount}&des=${id}&template=compact&download=false`
        return linkQR;
    }

    /**
     * Lấy thông tin chi tiết một giao dịch thanh toán
     */
    async getPaymentById(
        uow: UnitOfWork,
        paymentId: number
    ): Promise<Payment | null> {
        return await uow.payment.findByIdWithDetails(paymentId);
    } 
    /**
     * Lấy thông tin chi tiết một giao dịch thanh toán
     */
    async checkDuplicatePayment(
        uow: UnitOfWork,
            referenceCode : string
    ): Promise<Payment | null> {
        return await uow.payment.checkDuplicatePayment(referenceCode);
    }

    /**
     * Lấy tất cả giao dịch thanh toán
     */
    async getAllPayments(
        uow: UnitOfWork,
        includeRelations: boolean = false
    ): Promise<Payment[]> {
        return await uow.payment.getAll(includeRelations);
    }

    /**
     * 🔄 Lấy payment của một đơn hàng (1:1)
     */
    async getPaymentByOrderId(
        uow: UnitOfWork,
        orderId: string
    ): Promise<Payment | null> {
        return await uow.payment.findByOrderId(orderId);
    }

    /**
     * 🔄 Lấy payment của đơn hàng với thông tin chi tiết
     */
    async getPaymentByOrderIdWithDetails(
        uow: UnitOfWork,
        orderId: string
    ): Promise<Payment | null> {
        return await uow.payment.findByOrderIdWithDetails(orderId);
    }

    /**
     * Lấy giao dịch theo reference number
     */
    async getPaymentByReferenceNumber(
        uow: UnitOfWork,
        referenceNumber: string
    ): Promise<Payment | null> {
        return await uow.payment.findByReferenceNumber(referenceNumber);
    }

    /**
     * Cập nhật trạng thái giao dịch thanh toán
     */
    async updatePaymentStatus(
        uow: UnitOfWork,
        paymentId: number,
        status: string,
        referenceNumber?: string
    ): Promise<Payment | null> {
        // Kiểm tra giao dịch có tồn tại không
        const payment = await uow.payment.findById(paymentId);
        if (!payment) {
            throw new Error(`Payment with ID ${paymentId} not found`);
        }

        // Cập nhật trạng thái
        const [affectedCount, updatedPayments] = await uow.payment.updateStatus(
            paymentId,
            status,
            referenceNumber
        );

        if (affectedCount === 0) {
            throw new Error(`Failed to update payment status`);
        }

        return updatedPayments[0] || null;
    }

    /**
     * Cập nhật thông tin giao dịch
     */
    async updatePayment(
        uow: UnitOfWork,
        paymentId: number,
        data: UpdatePaymentPayload
    ): Promise<Payment | null> {
        const payment = await uow.payment.findById(paymentId);
        if (!payment) {
            throw new Error(`Payment with ID ${paymentId} not found`);
        }

        const [affectedCount, updatedPayments] = await uow.payment.update(paymentId, data);

        if (affectedCount === 0) {
            throw new Error(`Failed to update payment`);
        }

        return updatedPayments[0] || null;
    }

    /**
     * Lấy danh sách giao dịch theo trạng thái
     */
    async getPaymentsByStatus(
        uow: UnitOfWork,
        status: string
    ): Promise<Payment[]> {
        return await uow.payment.findByStatus(status);
    }

    /**
     * Lấy danh sách giao dịch theo gateway
     */
    async getPaymentsByGateway(
        uow: UnitOfWork,
        gateway: string
    ): Promise<Payment[]> {
        return await uow.payment.findByGateway(gateway);
    }

    /**
     * Lấy danh sách giao dịch theo khoảng thời gian
     */
    async getPaymentsByDateRange(
        uow: UnitOfWork,
        startDate: Date,
        endDate: Date
    ): Promise<Payment[]> {
        return await uow.payment.findByDateRange(startDate, endDate);
    }

    /**
     * Lấy tổng số tiền theo trạng thái
     */
    async getTotalAmountByStatus(
        uow: UnitOfWork,
        status: string
    ): Promise<number> {
        return await uow.payment.getTotalAmountByStatus(status);
    }

    /**
     * Lấy tổng số tiền theo khoảng thời gian
     */
    async getTotalAmountByDateRange(
        uow: UnitOfWork,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        return await uow.payment.getTotalAmountByDateRange(startDate, endDate);
    }

    /**
     * Đếm số lượng giao dịch theo trạng thái
     */
    async countPaymentsByStatus(
        uow: UnitOfWork,
        status: string
    ): Promise<number> {
        return await uow.payment.countByStatus(status);
    }

    /**
     * Kiểm tra đơn hàng đã thanh toán thành công chưa
     */
    async hasOrderBeenPaid(
        uow: UnitOfWork,
        orderId: string
    ): Promise<boolean> {
        return await uow.payment.hasSuccessfulPayment(
            orderId,
            TransactionStatus.Completed
        );
    }

    /**
     * Lấy danh sách giao dịch với phân trang
     */
    async getPaymentsWithPagination(
        uow: UnitOfWork,
        page: number = 1,
        limit: number = 10,
        filters?: {
            status?: string;
            gateway?: string;
            type?: 'in' | 'out';
            startDate?: Date;
            endDate?: Date;
        }
    ): Promise<{ rows: Payment[]; count: number; totalPages: number; currentPage: number }> {
        const result = await uow.payment.findWithPagination(page, limit, filters);

        return {
            ...result,
            currentPage: page
        };
    }

    /**
     * Xử lý callback từ cổng thanh toán (webhook)
     */
    async handlePaymentCallback(
        uow: UnitOfWork,
        referenceNumber: string,
        status: string,
        additionalData?: any
    ): Promise<Payment | null> {
        // Tìm giao dịch theo reference number
        const payment = await uow.payment.findByReferenceNumber(referenceNumber);

        if (!payment) {
            throw new Error(`Payment with reference number ${referenceNumber} not found`);
        }

        // Cập nhật trạng thái
        const [affectedCount, updatedPayments] = await uow.payment.updateStatus(
            payment.id,
            status
        );

        if (affectedCount === 0) {
            throw new Error(`Failed to update payment status`);
        }

        const updatedPayment = updatedPayments[0];

        // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng
        if (status === TransactionStatus.Completed && updatedPayment) {
            await this.handleSuccessfulPayment(uow, updatedPayment);
        } else if (status === TransactionStatus.Failed && updatedPayment) {
            await this.handleFailedPayment(uow, updatedPayment);
        }

        return updatedPayment || null;
    }

    /**
     * Xử lý sau khi thanh toán thành công
     */
    private async handleSuccessfulPayment(
        uow: UnitOfWork,
        payment: Payment
    ): Promise<void> {
        // Cập nhật trạng thái đơn hàng thành "paid" hoặc "processing"
        const order = await uow.order.findById(payment.order_id);

        if (order) {
            await uow.order.update(order.id, {
                status: 'paid', // hoặc 'processing'
            });

            // Có thể thêm các xử lý khác:
            // - Gửi email xác nhận
            // - Tạo thông báo
            // - Cập nhật inventory
            // - Log hoạt động
        }
    }

    /**
     * Xử lý khi thanh toán thất bại
     */
    private async handleFailedPayment(
        uow: UnitOfWork,
        payment: Payment
    ): Promise<void> {
        // Cập nhật trạng thái đơn hàng
        const order = await uow.order.findById(payment.order_id);

        if (order) {
            await uow.order.update(order.id, {
                status: 'payment_failed',
            });

            // Có thể thêm:
            // - Gửi email thông báo
            // - Khôi phục inventory nếu đã trừ
            // - Log lỗi
        }
    }

    /**
     * 🔄 Tạo giao dịch hoàn tiền (refund) - Vẫn là 1 payment mới cho order khác hoặc cùng order
     * Lưu ý: Nếu muốn refund, bạn cần quyết định logic:
     * - Cập nhật payment hiện tại thành "refunded"
     * - HOẶC tạo payment mới với type='out' cho một order refund riêng
     */
    // async createRefund(
    //     uow: UnitOfWork,
    //     originalPaymentId: number,
    //     amount: number,
    //     reason?: string
    // ): Promise<Payment> {
    //     // Lấy giao dịch gốc
    //     const originalPayment = await uow.payment.findById(originalPaymentId);

    //     if (!originalPayment) {
    //         throw new Error(`Original payment with ID ${originalPaymentId} not found`);
    //     }

    //     // Kiểm tra số tiền hoàn trả
    //     if (amount > originalPayment.amount) {
    //         throw new Error(`Refund amount cannot exceed original payment amount`);
    //     }

    //     // Cập nhật trạng thái payment gốc thành "refunded"
    //     await uow.payment.updateStatus(originalPaymentId, TransactionStatus.Refunded);

    //     // Nếu bạn muốn tạo một payment record mới cho refund (type='out')
    //     // Bạn cần tạo một Order mới hoặc quyết định logic khác
    //     // Vì 1 order chỉ có 1 payment, nên refund có thể:
    //     // 1. Chỉ cập nhật status của payment hiện tại
    //     // 2. Hoặc tạo order mới (refund order) và payment tương ứng

    //     // Ở đây tôi chỉ cập nhật status, không tạo payment mới
    //     return originalPayment;
    // }

    /**
     * Lấy thống kê giao dịch
     */
    // async getPaymentStatistics(
    //     uow: UnitOfWork,
    //     startDate?: Date,
    //     endDate?: Date
    // ): Promise<{
    //     totalAmount: number;
    //     completedAmount: number;
    //     pendingAmount: number;
    //     failedAmount: number;
    //     refundedAmount: number;
    //     totalCount: number;
    //     completedCount: number;
    //     pendingCount: number;
    //     failedCount: number;
    //     refundedCount: number;
    // }> {
    //     let payments: Payment[];

    //     if (startDate && endDate) {
    //         payments = await uow.payment.findByDateRange(startDate, endDate);
    //     } else {
    //         payments = await uow.payment.getAll();
    //     }

    //     const stats = {
    //         totalAmount: 0,
    //         completedAmount: 0,
    //         pendingAmount: 0,
    //         failedAmount: 0,
    //         refundedAmount: 0,
    //         totalCount: payments.length,
    //         completedCount: 0,
    //         pendingCount: 0,
    //         failedCount: 0,
    //         refundedCount: 0
    //     };

    //     payments.forEach(payment => {
    //         const amount = Number(payment.amount);
    //         stats.totalAmount += amount;

    //         switch (payment.status) {
    //             case TransactionStatus.Completed:
    //                 stats.completedAmount += amount;
    //                 stats.completedCount++;
    //                 break;
    //             case TransactionStatus.Pending:
    //                 stats.pendingAmount += amount;
    //                 stats.pendingCount++;
    //                 break;
    //             case TransactionStatus.Failed:
    //                 stats.failedAmount += amount;
    //                 stats.failedCount++;
    //                 break;
    //             case TransactionStatus.Refunded:
    //                 stats.refundedAmount += amount;
    //                 stats.refundedCount++;
    //                 break;
    //         }
    //     });

    //     return stats;
    // }

    /**
     * 🔄 Xóa payment (nếu cần - ví dụ payment pending)
     */
    async deletePayment(
        uow: UnitOfWork,
        paymentId: number
    ): Promise<void> {
        const payment = await uow.payment.findById(paymentId);

        if (!payment) {
            throw new Error(`Payment with ID ${paymentId} not found`);
        }

        // Chỉ cho phép xóa payment có status là pending hoặc failed
        if (payment.status !== TransactionStatus.Pending && payment.status !== TransactionStatus.Failed) {
            throw new Error(`Cannot delete payment with status: ${payment.status}. Only pending or failed payments can be deleted.`);
        }

        await uow.payment.delete(paymentId);
    }

    

}