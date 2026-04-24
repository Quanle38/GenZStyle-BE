"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAddressRepository = void 0;
const models_1 = require("../models");
const baseRepository_1 = require("../repositories/baseRepository");
const sequelize_1 = require("sequelize");
class UserAddressRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = models_1.UserAddress;
    }
    /**
     * Lấy tất cả địa chỉ của user (chưa bị xóa)
     */
    async findByUserId(userId) {
        return this.findAll({
            where: {
                user_id: userId,
                is_deleted: false,
            },
            order: [
                ["is_default", "DESC"],
                ["created_at", "DESC"],
            ],
        });
    }
    /**
     * Lấy địa chỉ theo ID + userId (ownership enforced)
     */
    async findByIdAndUser(addressId, userId) {
        return this.findOne({
            where: {
                address_id: addressId,
                user_id: userId,
                is_deleted: false,
            },
        });
    }
    /**
     * Set địa chỉ làm mặc định (an toàn)
     */
    async setAsDefault(addressId, userId) {
        await this.updateByCondition({ user_id: userId }, { is_default: false });
        const [affected] = await this.updateByCondition({
            address_id: addressId,
            user_id: userId,
            is_deleted: false,
        }, {
            is_default: true,
            updated_at: new Date(),
        });
        return affected > 0;
    }
    /**
     * Đếm số địa chỉ của user
     */
    async countByUserId(userId) {
        return this.count({
            where: {
                user_id: userId,
                is_deleted: false,
            },
        });
    }
    /**
     * Kiểm tra có thể thêm địa chỉ mới không
     */
    async canAddMoreAddresses(userId, max = 5) {
        const count = await this.countByUserId(userId);
        return count < max;
    }
    /**
     * Cập nhật địa chỉ (ownership enforced)
     */
    async updateAddress(addressId, userId, data) {
        const [affected] = await this.updateByCondition({
            address_id: addressId,
            user_id: userId,
            is_deleted: false,
        }, {
            ...data,
            updated_at: new Date(),
        });
        return affected > 0;
    }
    /**
     * Xóa mềm địa chỉ theo user (ownership enforced)
     */
    async softDeleteByUser(addressId, userId) {
        const [affected] = await this.updateByCondition({
            address_id: addressId,
            user_id: userId,
            is_deleted: false,
        }, {
            is_deleted: true,
            updated_at: new Date(),
        });
        return affected > 0;
    }
    /**
     * Lấy địa chỉ mới nhất của user
     */
    async getLatestAddress(userId) {
        return this.findOne({
            where: {
                user_id: userId,
                is_deleted: false,
            },
            order: [["created_at", "DESC"]],
        });
    }
    /**
     * Tìm kiếm địa chỉ
     */
    async searchAddresses(userId, keyword) {
        return this.findAll({
            where: {
                user_id: userId,
                is_deleted: false,
                [sequelize_1.Op.or]: [
                    { full_address: { [sequelize_1.Op.like]: `%${keyword}%` } },
                    { label: { [sequelize_1.Op.like]: `%${keyword}%` } },
                ],
            },
        });
    }
    /**
        * Xóa tất cả địa chỉ của 1 User
        */
    async bulkDelete(addressIds) {
        return this.model.destroy({
            where: {
                address_id: {
                    [sequelize_1.Op.in]: addressIds
                }
            }
        });
    }
}
exports.UserAddressRepository = UserAddressRepository;
//# sourceMappingURL=userAddress.repository.js.map