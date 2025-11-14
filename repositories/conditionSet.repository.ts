// repositories/conditionSet.repository.ts
import { Op } from "sequelize";
import { BaseRepository } from "./baseRepository"; // Giả định path này đúng
import { ConditionSet } from "../models/conditionSets.model"; 
import { ConditionDetail } from "../models/conditionDetail.model"; // Cần import nếu muốn dùng include Details

export class ConditionSetRepository extends BaseRepository<ConditionSet> {
    protected model = ConditionSet; 

    /**
     * Tìm ConditionSet theo ID và có thể bao gồm chi tiết điều kiện (Details).
     */
    async findByIdWithDetails(id: string): Promise<ConditionSet | null> {
        return this.findOne({
            where: { id },
            include: [{
                model: ConditionDetail,
                as: 'details', // Alias phải khớp với associations
                where: { is_deleted: false },
                required: false
            }]
        });
    }

    // Thêm các hàm tìm kiếm/tạo/cập nhật tùy chỉnh khác nếu cần
}