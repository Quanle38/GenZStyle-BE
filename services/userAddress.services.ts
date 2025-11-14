// services/userAddress.service.ts
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { UserAddress } from "../models";
import { UserAddressCreationAttributes } from "../models/userAddress.model";

export class UserAddressService {
    /**
     * Lấy tất cả địa chỉ (chưa bị xóa) của một người dùng.
     */
    async getAllByUserId(uow: UnitOfWork, userId: string): Promise<UserAddress[]> {
        return uow.userAddresses.findByUserId(userId);
    }

    /**
     * Lấy một địa chỉ theo ID và user ID (để đảm bảo quyền sở hữu).
     */
    async getById(uow: UnitOfWork, addressId: string, userId: string): Promise<UserAddress | null> {
        const address = await uow.userAddresses.findById(addressId);

        // Kiểm tra địa chỉ có tồn tại, chưa bị xóa và thuộc về user đó không
        if (address && address.user_id === userId && !address.is_deleted) {
            return address;
        }
        return null;
    }

    /**
     * Tạo một địa chỉ mới.
     * Kiểm tra số lượng tối đa và nếu không có địa chỉ nào, set mặc định là true.
     */
    async create(uow: UnitOfWork, userId: string, data: Partial<UserAddressCreationAttributes>): Promise<UserAddress> {
        const maxAddresses = 5;
        const canAdd = await uow.userAddresses.canAddMoreAddresses(userId, maxAddresses);

        if (!canAdd) {
            throw new Error(`User cannot have more than ${maxAddresses} addresses.`);
        }

        const count = await uow.userAddresses.countByUserId(userId);
        const isDefault = count === 0;

        const newAddressData: Partial<UserAddressCreationAttributes> = {
            ...data,
            user_id: userId,
            is_deleted: false,
            is_default: data.is_default !== undefined ? data.is_default : isDefault,
        };

        // Nếu người dùng chọn is_default=true, ta phải set tất cả địa chỉ khác thành false
        if (newAddressData.is_default) {
            await uow.userAddresses.updateByCondition(
                { user_id: userId },
                { is_default: false }
                // 💡 Đã sửa: Xóa đối số uow.transaction vì BaseRepository đã tự thêm.
            );
        }

        return uow.userAddresses.create(newAddressData);
    }

    /**
     * Cập nhật địa chỉ theo ID.
     * ...
     */
    async update(
        uow: UnitOfWork,
        addressId: string,
        userId: string,
        data: Partial<UserAddress>
    ): Promise<UserAddress | null> {
        const existingAddress = await this.getById(uow, addressId, userId);

        if (!existingAddress) return null;

        // Nếu đang cố gắng đặt làm mặc định
        if (data.is_default === true) {
            await uow.userAddresses.updateByCondition(
                { user_id: userId },
                { is_default: false }
                // 💡 Đã sửa: Xóa đối số uow.transaction vì BaseRepository đã tự thêm.
            );
        }

        // ... phần còn lại giữ nguyên ...
        const result = await uow.userAddresses.updateAddress(addressId, data);

        if (result) {
            // Lấy lại dữ liệu đã cập nhật
            return uow.userAddresses.findById(addressId);
        }
        return null;
    }

    /**
     * Xóa mềm (soft delete) một địa chỉ.
     * ...
     */
    async deleteOne(uow: UnitOfWork, addressId: string, userId: string): Promise<boolean | "NOT_FOUND"> {
        const existingAddress = await this.getById(uow, addressId, userId);

        if (!existingAddress) return "NOT_FOUND";

        // Nếu địa chỉ đang là mặc định, cần xử lý logic: set địa chỉ khác làm default hoặc báo lỗi
        if (existingAddress.is_default) {
            const otherAddresses = await uow.userAddresses.findByUserId(userId);
            if (otherAddresses.length > 1) {
                const result = await uow.userAddresses.softDelete(addressId);
                if (result) {
                    const latestAddress = await uow.userAddresses.getLatestAddress(userId);
                    if (latestAddress) {
                        // setAsDefault đã được sửa để gọi updateByCondition (nếu nó được implement đúng)
                        await uow.userAddresses.setAsDefault(latestAddress.address_id.toString(), userId);
                    }
                    return true;
                }
                return false;
            } else {
                throw new Error("Cannot delete the only default address.");
            }
        }

        return uow.userAddresses.softDelete(addressId);
    }
}