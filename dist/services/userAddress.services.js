"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAddressService = void 0;
class UserAddressService {
    /**
     * Lấy tất cả địa chỉ của user
     */
    async getAllByUserId(uow, userId) {
        return uow.userAddresses.findByUserId(userId);
    }
    /**
     * Lấy 1 địa chỉ theo ID (ownership enforced)
     */
    async getById(uow, addressId, userId) {
        return uow.userAddresses.findByIdAndUser(addressId, userId);
    }
    /**
     * Tạo địa chỉ mới
     */
    async create(uow, userId, data) {
        const canAdd = await uow.userAddresses.canAddMoreAddresses(userId);
        if (!canAdd) {
            throw new Error("User cannot have more than 5 addresses");
        }
        const count = await uow.userAddresses.countByUserId(userId);
        const isDefault = count === 0;
        if (data.is_default === true) {
            await uow.userAddresses.updateByCondition({ user_id: userId }, { is_default: false });
        }
        return uow.userAddresses.create({
            ...data,
            user_id: userId,
            is_default: data.is_default ?? isDefault,
            is_deleted: false,
        });
    }
    /**
     * Cập nhật địa chỉ
     */
    async update(uow, addressId, userId, data) {
        const updated = await uow.userAddresses.updateAddress(addressId, userId, data);
        if (!updated)
            return null;
        return uow.userAddresses.findByIdAndUser(addressId, userId);
    }
    /**
     * Xóa mềm địa chỉ
     */
    async deleteOne(uow, addressId, userId) {
        const address = await uow.userAddresses.findByIdAndUser(addressId, userId);
        if (!address)
            return "NOT_FOUND";
        if (address.is_default) {
            const others = await uow.userAddresses.findByUserId(userId);
            if (others.length <= 1) {
                throw new Error("Cannot delete the only default address");
            }
        }
        const deleted = await uow.userAddresses.softDeleteByUser(addressId, userId);
        if (deleted && address.is_default) {
            const latest = await uow.userAddresses.getLatestAddress(userId);
            if (latest) {
                await uow.userAddresses.setAsDefault(latest.address_id.toString(), userId);
            }
        }
        return deleted;
    }
}
exports.UserAddressService = UserAddressService;
//# sourceMappingURL=userAddress.services.js.map