// repositories/payment.repository.ts
import { BaseRepository } from "./baseRepository";
import { Payment } from "../models/payment.model";
import { Order } from "../models/order.model";
import { User } from "../models/user.model";
import { Op, FindOptions } from "sequelize";
import { CreatePaymentPayload } from "../dtos/payment/request/createPaymentPayload";
import { UpdatePaymentPayload } from "../dtos/payment/request/updatePaymentPayload";

export class PaymentRepository extends BaseRepository<Payment> {
    protected model = Payment;

    /**
     * Lấy tất cả các giao dịch thanh toán với khả năng eager loading
     */
    async getAll(includeRelations: boolean = false): Promise<Payment[]> {
        const options: FindOptions = {
            order: [['created_at', 'DESC']]
        };

        if (includeRelations) {
            options.include = [
                {
                    model: Order,
                    as: 'order',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'full_name', 'email']
                        }
                    ]
                }
            ];
        }

        return this.findAll(options);
    }

    /**
     * Tìm giao dịch thanh toán theo ID với thông tin chi tiết
     */
    async findByIdWithDetails(paymentId: number): Promise<Payment | null> {
        return this.findOne({
            where: { id: paymentId },
            include: [
                {
                    model: Order,
                    as: 'order',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'full_name', 'email', 'phone']
                        }
                    ]
                }
            ]
        });
    }

    /**
     * 🔄 Tìm giao dịch thanh toán của một đơn hàng (1:1 - chỉ có 1 payment)
     * Method này trả về Payment | null vì quan hệ 1:1
     */
    async findByOrderId(orderId: string): Promise<Payment | null> {
        return await this.findOne({
            where: { order_id: orderId }
        });
    }

    /**
     * Tìm payment của order với thông tin chi tiết
     */
    async findByOrderIdWithDetails(orderId: string): Promise<Payment | null> {
        return await this.findOne({
            where: { order_id: orderId },
            include: [
                {
                    model: Order,
                    as: 'order',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'full_name', 'email', 'phone']
                        }
                    ]
                }
            ]
        });
    }

    /**
     * Tìm giao dịch theo reference number (mã tham chiếu từ cổng thanh toán)
     */
    async findByReferenceNumber(referenceNumber: string): Promise<Payment | null> {
        return this.findOne({
            where: { reference_number: referenceNumber }
        });
    }

    /**
     * Tìm giao dịch theo trạng thái
     */
    async findByStatus(status: string): Promise<Payment[]> {
        return this.findAll({
            where: { status },
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Tìm giao dịch theo gateway (cổng thanh toán)
     */
    async findByGateway(gateway: string): Promise<Payment[]> {
        return this.findAll({
            where: { gateway },
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Tìm giao dịch theo khoảng thời gian
     */
    async findByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
        return this.findAll({
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Tìm giao dịch theo loại (in/out)
     */
    async findByType(type: 'in' | 'out'): Promise<Payment[]> {
        return this.findAll({
            where: { type },
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Thống kê tổng số tiền theo trạng thái
     */
    async getTotalAmountByStatus(status: string): Promise<number> {
        const result = await this.model.sum('amount', {
            where: { status },
            ...this.getTransactionOption()
        });
        return result || 0;
    }

    /**
     * Thống kê tổng số tiền theo khoảng thời gian
     */
    async getTotalAmountByDateRange(startDate: Date, endDate: Date): Promise<number> {
        const result = await this.model.sum('amount', {
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate]
                }
            },
            ...this.getTransactionOption()
        });
        return result || 0;
    }

    /**
     * Đếm số lượng giao dịch theo trạng thái
     */
    async countByStatus(status: string): Promise<number> {
        return this.count({
            where: { status }
        });
    }

    /**
     * Tạo mới một giao dịch thanh toán
     */
    async createPayment(data: CreatePaymentPayload): Promise<Payment> {
        return this.create(data);
    }

    /**
     * Cập nhật trạng thái giao dịch
     */
    async updateStatus(
        paymentId: number,
        status: string,
        referenceNumber?: string
    ): Promise<[number, Payment[]]> {
        const updateData: UpdatePaymentPayload = { status };
        if (referenceNumber) {
            updateData.reference_number = referenceNumber;
        }

        return this.update(paymentId, updateData);
    }

    /**
     * Cập nhật reference number
     */
    async updateReferenceNumber(
        paymentId: number,
        referenceNumber: string
    ): Promise<[number, Payment[]]> {
        return this.update(paymentId, { reference_number: referenceNumber });
    }

    /**
     * 🔄 Kiểm tra xem đơn hàng đã có payment chưa
     */
    async orderHasPayment(orderId: string): Promise<boolean> {
        const count = await this.count({
            where: { order_id: orderId }
        });
        return count > 0;
    }

    /**
     * 🔄 Kiểm tra xem đơn hàng đã có giao dịch thanh toán thành công chưa
     */
    async hasSuccessfulPayment(orderId: string, successStatus: string = 'completed'): Promise<boolean> {
        const count = await this.count({
            where: {
                order_id: orderId,
                status: successStatus
            }
        });
        return count > 0;
    }

    /**
     * Lấy danh sách giao dịch với phân trang và lọc
     */
    async findWithPagination(
        page: number = 1,
        limit: number = 10,
        filters?: {
            status?: string;
            gateway?: string;
            type?: 'in' | 'out';
            startDate?: Date;
            endDate?: Date;
        }
    ): Promise<{ rows: Payment[]; count: number; totalPages: number }> {
        const offset = (page - 1) * limit;
        const where: any = {};

        if (filters) {
            if (filters.status) where.status = filters.status;
            if (filters.gateway) where.gateway = filters.gateway;
            if (filters.type) where.type = filters.type;
            if (filters.startDate && filters.endDate) {
                where.created_at = {
                    [Op.between]: [filters.startDate, filters.endDate]
                };
            }
        }

        const { rows, count } = await this.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'total_amount', 'status']
                }
            ]
        });

        return {
            rows,
            count,
            totalPages: Math.ceil(count / limit)
        };
    }
}