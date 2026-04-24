"use strict";
// =====================================
// File: src/repositories/membershipTier.repository.ts (ĐÃ SỬA)
// =====================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipTierRepository = void 0;
const baseRepository_1 = require("./baseRepository");
const memberShipTier_model_1 = require("../models/memberShipTier.model");
class MembershipTierRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = memberShipTier_model_1.MembershipTier;
    }
    // 1. Lấy tất cả các hạng (getAll) - [GIỮ LẠI]
    async getAll() {
        const options = {
            where: { is_deleted: false },
            order: [['min_points', 'ASC']]
        };
        return this.findAll(options);
    }
    // (Hàm getById và getUsersByTierId đã bị loại bỏ theo yêu cầu)
    // 2. Xóa mềm (Soft Delete) hạng thành viên (softDeleteTier) - [GIỮ LẠI]
    async softDeleteTier(id) {
        return this.softDelete(id);
    }
}
exports.MembershipTierRepository = MembershipTierRepository;
//# sourceMappingURL=membershipTier.repository.js.map