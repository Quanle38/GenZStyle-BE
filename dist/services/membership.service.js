"use strict";
// =====================================
// File: src/services/membership.service.ts (ĐÃ SỬA)
// =====================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipTierService = void 0;
class MembershipTierService {
    // 1. Lấy tất cả các hạng (getAll)
    async getAll(uow) {
        return uow.membershipTier.getAll();
    }
    // 2. Lấy hạng thành viên theo User ID (getByUserId)
    async getByUserId(uow, userId) {
        const tier = await uow.users.getTierByUserId(userId);
        if (!tier) {
            throw new Error(`Membership rank not found for User ID ${userId}.`);
        }
        return tier;
    }
    // 3. Tạo hạng thành viên mới (create)
    async create(uow, data) {
        data.id = data.id.toUpperCase();
        // Dùng findById cơ bản thay cho getById đã bị xóa
        const existingTier = await uow.membershipTier.findById(data.id);
        if (existingTier) {
            throw new Error(`Membership Tier with ID ${data.id} already exists.`);
        }
        return uow.membershipTier.create(data);
    }
    // 4. Cập nhật hạng thành viên (update)
    async update(uow, id, data) {
        const updateId = id.toUpperCase();
        if (data.id)
            delete data.id; // Ngăn không cho cập nhật PK
        const [affectedCount] = await uow.membershipTier.update(updateId, data);
        if (affectedCount === 0) {
            throw new Error(`Failed to update. Membership Tier with ID ${updateId} not found.`);
        }
        // Dùng findById cơ bản để lấy lại đối tượng đã được cập nhật
        const updatedTier = await uow.membershipTier.findById(updateId);
        if (!updatedTier) {
            throw new Error(`Membership Tier with ID ${updateId} not found after update.`);
        }
        return updatedTier;
    }
    // 5. Xóa mềm hạng thành viên (delete)
    async delete(uow, id) {
        const updateId = id.toUpperCase();
        const success = await uow.membershipTier.softDeleteTier(updateId);
        if (!success) {
            throw new Error(`Failed to delete. Membership Tier with ID ${updateId} not found.`);
        }
        return true;
    }
}
exports.MembershipTierService = MembershipTierService;
exports.default = new MembershipTierService();
//# sourceMappingURL=membership.service.js.map