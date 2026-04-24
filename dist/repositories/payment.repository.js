"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
// repositories/payment.repository.ts
const baseRepository_1 = require("./baseRepository");
const payment_model_1 = require("../models/payment.model");
const order_model_1 = require("../models/order.model");
const user_model_1 = require("../models/user.model");
const sequelize_1 = require("sequelize");
class PaymentRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = payment_model_1.Payment;
    }
    /**
     * Lấy tất cả các giao dịch thanh toán với khả năng eager loading
     */
    async getAll(includeRelations = false) {
        const options = {
            order: [['created_at', 'DESC']]
        };
        if (includeRelations) {
            options.include = [
                {
                    model: order_model_1.Order,
                    as: 'order',
                    include: [
                        {
                            model: user_model_1.User,
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
    async findByIdWithDetails(paymentId) {
        return this.findOne({
            where: { id: paymentId },
            include: [
                {
                    model: order_model_1.Order,
                    as: 'order',
                    include: [
                        {
                            model: user_model_1.User,
                            as: 'user',
                            attributes: ['id', 'email', 'phone_number']
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
    async findByOrderId(orderId) {
        return await this.findOne({
            where: { order_id: orderId }
        });
    }
    /**
     * 🔄 Check Dupicate Payment
     * Method này trả về Payment
     */
    async checkDuplicatePayment(referenceCode) {
        return await this.findOne({
            where: { reference: referenceCode }
        });
    }
    /**
     * Tìm payment của order với thông tin chi tiết
     */
    async findByOrderIdWithDetails(orderId) {
        return await this.findOne({
            where: { order_id: orderId },
            include: [
                {
                    model: order_model_1.Order,
                    as: 'order',
                    include: [
                        {
                            model: user_model_1.User,
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
    async findByReferenceNumber(referenceNumber) {
        return this.findOne({
            where: { reference_number: referenceNumber }
        });
    }
    /**
     * Tìm giao dịch theo trạng thái
     */
    async findByStatus(status) {
        return this.findAll({
            where: { status },
            order: [['created_at', 'DESC']]
        });
    }
    /**
     * Tìm giao dịch theo gateway (cổng thanh toán)
     */
    async findByGateway(gateway) {
        return this.findAll({
            where: { gateway },
            order: [['created_at', 'DESC']]
        });
    }
    /**
     * Tìm giao dịch theo khoảng thời gian
     */
    async findByDateRange(startDate, endDate) {
        return this.findAll({
            where: {
                created_at: {
                    [sequelize_1.Op.between]: [startDate, endDate]
                }
            },
            order: [['created_at', 'DESC']]
        });
    }
    /**
     * Tìm giao dịch theo loại (in/out)
     */
    async findByType(type) {
        return this.findAll({
            where: { type },
            order: [['created_at', 'DESC']]
        });
    }
    /**
     * Thống kê tổng số tiền theo trạng thái
     */
    async getTotalAmountByStatus(status) {
        const result = await this.model.sum('amount', {
            where: { status },
            ...this.getTransactionOption()
        });
        return result || 0;
    }
    /**
     * Thống kê tổng số tiền theo khoảng thời gian
     */
    async getTotalAmountByDateRange(startDate, endDate) {
        const result = await this.model.sum('amount', {
            where: {
                created_at: {
                    [sequelize_1.Op.between]: [startDate, endDate]
                }
            },
            ...this.getTransactionOption()
        });
        return result || 0;
    }
    /**
     * Đếm số lượng giao dịch theo trạng thái
     */
    async countByStatus(status) {
        return this.count({
            where: { status }
        });
    }
    /**
     * Tạo mới một giao dịch thanh toán
     */
    async createPayment(data) {
        return this.create(data);
    }
    /**
     * Cập nhật trạng thái giao dịch
     */
    async updateStatus(paymentId, status, referenceNumber) {
        const updateData = { status };
        if (referenceNumber) {
            updateData.reference_number = referenceNumber;
        }
        return this.update(paymentId, updateData);
    }
    /**
     * Cập nhật reference number
     */
    async updateReferenceNumber(paymentId, referenceNumber) {
        return this.update(paymentId, { reference_number: referenceNumber });
    }
    /**
     * 🔄 Kiểm tra xem đơn hàng đã có payment chưa
     */
    async orderHasPayment(orderId) {
        const count = await this.count({
            where: { order_id: orderId }
        });
        return count > 0;
    }
    /**
     * 🔄 Kiểm tra xem đơn hàng đã có giao dịch thanh toán thành công chưa
     */
    async hasSuccessfulPayment(orderId, successStatus = 'completed') {
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
    async findWithPagination(page = 1, limit = 10, filters) {
        const offset = (page - 1) * limit;
        const where = {};
        if (filters) {
            if (filters.status)
                where.status = filters.status;
            if (filters.gateway)
                where.gateway = filters.gateway;
            if (filters.type)
                where.type = filters.type;
            if (filters.startDate && filters.endDate) {
                where.created_at = {
                    [sequelize_1.Op.between]: [filters.startDate, filters.endDate]
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
                    model: order_model_1.Order,
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
exports.PaymentRepository = PaymentRepository;
//# sourceMappingURL=payment.repository.js.map