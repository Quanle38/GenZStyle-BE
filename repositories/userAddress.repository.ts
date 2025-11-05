import { UserAddress } from "../models";
import { BaseRepository } from "../repositories/baseRepository"
import { FindOptions } from "sequelize";

export class UserAddressRepository extends BaseRepository<UserAddress> {
    protected model = UserAddress;

    /**
     * Tìm tất cả địa chỉ của một user
     */
    async findByUserId(userId: string): Promise<UserAddress[]> {
        return this.findAll({
            where: {
                user_id: userId,
                is_deleted: false
            },
            order: [['is_default', 'DESC'], ['created_at', 'DESC']]
        });
    }

    /**
     * Đặt địa chỉ làm mặc định
     */
    async setAsDefault(addressId: string, userId: string): Promise<boolean> {
        // Bỏ default của tất cả địa chỉ khác
        await this.updateByCondition(
            { user_id: userId },
            { is_default: false }
        );

        // Set địa chỉ hiện tại làm default
        const [affectedCount] = await this.update(addressId, { 
            is_default: true,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }

    /**
     * Lấy địa chỉ mặc định của user
     */
    async findDefaultAddress(userId: string): Promise<UserAddress | null> {
        return this.findOne({
            where: {
                user_id: userId,
                is_default: true,
                is_deleted: false
            }
        });
    }

    /**
     * Đếm số lượng địa chỉ của user
     */
    async countByUserId(userId: string): Promise<number> {
        return this.count({
            where: {
                user_id: userId,
                is_deleted: false
            }
        });
    }

    /**
     * Tìm địa chỉ theo label
     */
    async findByLabel(userId: string, label: string): Promise<UserAddress | null> {
        return this.findOne({
            where: {
                user_id: userId,
                label,
                is_deleted: false
            }
        });
    }

    /**
     * Cập nhật địa chỉ
     */
    async updateAddress(
        addressId: string, 
        data: Partial<UserAddress>
    ): Promise<boolean> {
        const [affectedCount] = await this.update(addressId, {
            ...data,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }

    /**
     * Xóa mềm tất cả địa chỉ của user
     */
    async softDeleteByUserId(userId: string): Promise<boolean> {
        const addresses = await this.findByUserId(userId);
        if (addresses.length === 0) return true;

        const [affectedCount] = await this.updateByCondition(
            { user_id: userId },
            { 
                is_deleted: true,
                updated_at: new Date()
            }
        );
        return affectedCount > 0;
    }

    /**
     * Xóa vĩnh viễn tất cả địa chỉ của user
     */
    async hardDeleteByUserId(userId: string): Promise<number> {
        const { Op } = require('sequelize');
        return this.model.destroy({
            where: {
                user_id: userId
            },
            transaction: this.transaction
        });
    }

    /**
     * Kiểm tra user có địa chỉ nào không
     */
    async hasAddresses(userId: string): Promise<boolean> {
        const count = await this.countByUserId(userId);
        return count > 0;
    }

    /**
     * Lấy địa chỉ được tạo gần nhất
     */
    async getLatestAddress(userId: string): Promise<UserAddress | null> {
        return this.findOne({
            where: {
                user_id: userId,
                is_deleted: false
            },
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Tìm kiếm địa chỉ theo từ khóa
     */
    async searchAddresses(
        userId: string, 
        keyword: string
    ): Promise<UserAddress[]> {
        const { Op } = require('sequelize');
        
        return this.findAll({
            where: {
                user_id: userId,
                is_deleted: false,
                [Op.or]: [
                    { full_address: { [Op.like]: `%${keyword}%` } },
                    { label: { [Op.like]: `%${keyword}%` } }
                ]
            },
            order: [['is_default', 'DESC'], ['created_at', 'DESC']]
        });
    }

    /**
     * Khôi phục địa chỉ đã xóa
     */
    async restore(addressId: string): Promise<boolean> {
        const [affectedCount] = await this.update(addressId, { 
            is_deleted: false,
            updated_at: new Date()
        });
        return affectedCount > 0;
    }

    /**
     * Validate số lượng địa chỉ tối đa (ví dụ: max 5 địa chỉ)
     */
    async canAddMoreAddresses(userId: string, maxAddresses: number = 5): Promise<boolean> {
        const count = await this.countByUserId(userId);
        return count < maxAddresses;
    }
}