// =====================================
// File: src/repositories/membershipTier.repository.ts (ĐÃ SỬA)
// =====================================

import { BaseRepository } from "./baseRepository";
import { MembershipTier } from "../models/memberShipTier.model";
import { User } from "../models/user.model";
import { FindOptions } from "sequelize";

export class MembershipTierRepository extends BaseRepository<MembershipTier> {

    protected model = MembershipTier;

    // 1. Lấy tất cả các hạng (getAll) - [GIỮ LẠI]
    async getAll(): Promise<MembershipTier[]> {
        const options: FindOptions = {
            where: { is_deleted: false },
            order: [['min_points', 'ASC']]
        };
        return this.findAll(options);
    }

    // (Hàm getById và getUsersByTierId đã bị loại bỏ theo yêu cầu)

    // 2. Xóa mềm (Soft Delete) hạng thành viên (softDeleteTier) - [GIỮ LẠI]
    async softDeleteTier(id: string): Promise<boolean> {
        return this.softDelete(id);
    }

}