// =====================================
// File: src/repositories/user.repository.ts
// =====================================

import { User, UserAddress, MembershipTier } from "../models"; // Cần đảm bảo các Model này được import chính xác
import { BaseRepository } from "../repositories/baseRepository";
import { ROLE } from "../enums/role.enum";
import { FindOptions } from "sequelize";

// Khai báo UserRepository, kế thừa từ BaseRepository
export class UserRepository extends BaseRepository<User> {
    protected model = User;

    /**
     * Lấy Membership Tier của user theo ID
     * @param userId ID của User
     * @returns MembershipTier object hoặc null nếu không tìm thấy user hoặc rank
     */
    async getTierByUserId(userId: string): Promise<MembershipTier | null> {
        // Sử dụng findByPk để tìm User theo khóa chính
        const user = await this.model.findByPk(userId, {
            // INCLUDE quan hệ Rank (giả định association name là 'rank')
            // Tên 'rank' phải khớp với tên 'as' trong User.belongsTo(MembershipTier, { as: 'rank' })
            include: [{
                model: MembershipTier, // Tên Model được liên kết
                as: 'membership', // Tên Association trong User Model
                required: false
            }],
            transaction: this.transaction
        });

        // Kiểm tra xem User có tồn tại và có Rank được đính kèm không
        // Lỗi TypeScript đã được giải quyết bằng cách sửa User Model
        if (!user || !user.membership_id || !user.membership) {
            return null;
        }
        // Trả về đối tượng MembershipTier được đính kèm
        return user.membership;
    }

    // =======================================================
    // Các hàm gốc giữ nguyên
    // =======================================================

    /**
     * Tìm user theo ID kèm theo addresses
     */
    async findByIdWithAddresses(id: string, excludeFields: string[] = []) {
        return this.model.findByPk(id, {
            attributes: { exclude: excludeFields },
            include: [
                {
                    model: UserAddress,
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
    async findAllWithPagination(page: number, limit: number) {
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
    async isAdminOrSuperAdmin(id: string): Promise<boolean> {
        const user = await this.findById(id);
        if (!user) return false;
        return user.role === ROLE.ADMIN || user.role === ROLE.SUPERADMIN;
    }

    /**
     * Tìm user theo email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({
            where: { email, is_deleted: false }
        });
    }

    /**
     * Tìm user theo phone number
     */
    async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
        return this.findOne({
            where: { phone_number: phoneNumber, is_deleted: false }
        });
    }

    /**
     * Cập nhật refresh token
     */
    async updateRefreshToken(id: string, refreshToken: string | null): Promise<boolean> {
        const [affectedCount] = await this.update(id, {
            refresh_token: refreshToken
        });
        return affectedCount > 0;
    }

    /**
     * Cập nhật password
     */
    async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
        const [affectedCount] = await this.update(id, {
            password: hashedPassword,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }

    /**
     * Tìm users theo role
     */
    async findByRole(role: ROLE, options?: Omit<FindOptions, 'transaction'>): Promise<User[]> {
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
    async countByRole(role: ROLE): Promise<number> {
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
    async searchUsers(keyword: string, page: number = 1, limit: number = 10) {
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
    async findDeletedUsers(page: number = 1, limit: number = 10) {
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
    async restore(id: string): Promise<boolean> {
        const [affectedCount] = await this.update(id, {
            is_deleted: false,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }

    /**
     * Xóa vĩnh viễn user (hard delete)
     */
    async hardDelete(id: string): Promise<number> {
        return this.delete(id);
    }

    async findByRefreshToken(token: string): Promise<User | null> {
        return this.findOne({
            where: { refresh_token: token, is_deleted: false }
        });
    }


}