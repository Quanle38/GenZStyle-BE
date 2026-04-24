"use strict";
// =====================================
// File: src/repositories/user.repository.ts
// =====================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const models_1 = require("../models"); // Cần đảm bảo các Model này được import chính xác
const baseRepository_1 = require("../repositories/baseRepository");
const role_enum_1 = require("../enums/role.enum");
// Khai báo UserRepository, kế thừa từ BaseRepository
class UserRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = models_1.User;
    }
    /**
     * Lấy Membership Tier của user theo ID
     * @param userId ID của User
     * @returns MembershipTier object hoặc null nếu không tìm thấy user hoặc rank
     */
    async getTierByUserId(userId) {
        const user = await this.model.findByPk(userId, {
            include: [{
                    model: models_1.MembershipTier,
                    as: "membership",
                    required: false
                }],
            transaction: this.transaction
        });
        if (!user || !user.membership) {
            return null;
        }
        return user.membership;
    }
    // =======================================================
    // Các hàm gốc giữ nguyên
    // =======================================================
    /**
     * Tìm user theo ID kèm theo addresses
     */
    async findByIdWithAddresses(id, excludeFields = []) {
        return this.model.findByPk(id, {
            attributes: { exclude: excludeFields },
            include: [
                {
                    model: models_1.UserAddress,
                    as: 'addresses',
                    where: { is_deleted: false },
                    required: false
                }
            ],
            transaction: this.transaction
        });
    }
    /**
     * Tìm tất cả users với phân trang
     */
    async findAllWithPagination(page, limit) {
        const offset = (page - 1) * limit;
        return this.model.findAndCountAll({
            limit,
            offset,
            order: [["created_at", "DESC"]],
            where: { is_deleted: false },
            transaction: this.transaction
        });
    }
    /**
     * Kiểm tra xem user có phải admin không
     */
    async isAdminOrSuperAdmin(id) {
        const user = await this.findById(id);
        if (!user)
            return false;
        return user.role === role_enum_1.ROLE.ADMIN || user.role === role_enum_1.ROLE.SUPERADMIN;
    }
    /**
     * Tìm user theo email
     */
    async findByEmail(email) {
        return this.findOne({
            where: { email, is_deleted: false }
        });
    }
    /**
     * Tìm user theo phone number
     */
    async findByPhoneNumber(phoneNumber) {
        return this.findOne({
            where: { phone_number: phoneNumber, is_deleted: false }
        });
    }
    /**
     * Cập nhật refresh token
     */
    async updateRefreshToken(id, refreshToken) {
        const [affectedCount] = await this.update(id, {
            refresh_token: refreshToken
        });
        return affectedCount > 0;
    }
    /**
     * Cập nhật password
     */
    async updatePassword(id, hashedPassword) {
        const [affectedCount] = await this.update(id, {
            password: hashedPassword,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }
    /**
     * Tìm users theo role
     */
    async findByRole(role, options) {
        return this.findAll({
            ...options,
            where: {
                role,
                is_deleted: false
            }
        });
    }
    /**
     * Đếm số lượng users theo role
     */
    async countByRole(role) {
        return this.count({
            where: {
                role,
                is_deleted: false
            }
        });
    }
    /**
     * Tìm kiếm users theo từ khóa (email, first_name, last_name, phone)
     */
    async searchUsers(keyword, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { Op } = require('sequelize');
        return this.findAndCountAll({
            where: {
                is_deleted: false,
                [Op.or]: [
                    { email: { [Op.like]: `%${keyword}%` } },
                    { first_name: { [Op.like]: `%${keyword}%` } },
                    { last_name: { [Op.like]: `%${keyword}%` } },
                    { phone_number: { [Op.like]: `%${keyword}%` } }
                ]
            },
            limit,
            offset,
            order: [["created_at", "DESC"]]
        });
    }
    /**
     * Lấy tất cả users đã bị xóa mềm
     */
    async findDeletedUsers(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        return this.findAndCountAll({
            where: { is_deleted: true },
            limit,
            offset,
            order: [["updated_at", "DESC"]]
        });
    }
    /**
     * Khôi phục user đã bị xóa mềm
     */
    async restore(id) {
        const [affectedCount] = await this.update(id, {
            is_deleted: false,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }
    /**
     * Xóa vĩnh viễn user (hard delete)
     */
    async hardDelete(id) {
        return this.delete(id);
    }
    async findByRefreshToken(token) {
        return this.findOne({
            where: { refresh_token: token, is_deleted: false }
        });
    }
    async isNewUser(user_id) {
        const check = await this.findOne({
            where: { id: user_id, is_new: true, is_deleted: false }
        });
        return !check ? false : true;
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map