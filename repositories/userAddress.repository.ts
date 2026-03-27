import { UserAddress } from "../models";
import { BaseRepository } from "../repositories/baseRepository";
import { Op } from "sequelize";

export class UserAddressRepository extends BaseRepository<UserAddress> {
    protected model = UserAddress;

    /**
     * Lấy tất cả địa chỉ của user (chưa bị xóa)
     */
    async findByUserId(userId: string): Promise<UserAddress[]> {
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
    async findByIdAndUser(
        addressId: string,
        userId: string
    ): Promise<UserAddress | null> {
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
    async setAsDefault(addressId: string, userId: string): Promise<boolean> {
        await this.updateByCondition(
            { user_id: userId },
            { is_default: false }
        );

        const [affected] = await this.updateByCondition(
            {
                address_id: addressId,
                user_id: userId,
                is_deleted: false,
            },
            {
                is_default: true,
                updated_at: new Date(),
            }
        );

        return affected > 0;
    }

    /**
     * Đếm số địa chỉ của user
     */
    async countByUserId(userId: string): Promise<number> {
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
    async canAddMoreAddresses(
        userId: string,
        max: number = 5
    ): Promise<boolean> {
        const count = await this.countByUserId(userId);
        return count < max;
    }

    /**
     * Cập nhật địa chỉ (ownership enforced)
     */
    async updateAddress(
        addressId: string,
        userId: string,
        data: Partial<UserAddress>
    ): Promise<boolean> {
        const [affected] = await this.updateByCondition(
            {
                address_id: addressId,
                user_id: userId,
                is_deleted: false,
            },
            {
                ...data,
                updated_at: new Date(),
            }
        );

        return affected > 0;
    }

    /**
     * Xóa mềm địa chỉ theo user (ownership enforced)
     */
    async softDeleteByUser(
        addressId: string,
        userId: string
    ): Promise<boolean> {
        const [affected] = await this.updateByCondition(
            {
                address_id: addressId,
                user_id: userId,
                is_deleted: false,
            },
            {
                is_deleted: true,
                updated_at: new Date(),
            }
        );

        return affected > 0;
    }


    /**
     * Lấy địa chỉ mới nhất của user
     */
    async getLatestAddress(userId: string): Promise<UserAddress | null> {
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
    async searchAddresses(
        userId: string,
        keyword: string
    ): Promise<UserAddress[]> {
        return this.findAll({
            where: {
                user_id: userId,
                is_deleted: false,
                [Op.or]: [
                    { full_address: { [Op.like]: `%${keyword}%` } },
                    { label: { [Op.like]: `%${keyword}%` } },
                ],
            },
        });
    }

    /**
        * Xóa tất cả địa chỉ của 1 User
        */
    async bulkDelete(addressIds: number[]) {
        return this.model.destroy({
            where: {
                address_id: {
                    [Op.in]: addressIds
                }
            }
        });
    }
}
