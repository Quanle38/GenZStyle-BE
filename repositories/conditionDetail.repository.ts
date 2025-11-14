// repositories/conditionDetail.repository.ts
import { Op } from "sequelize";
import { BaseRepository } from "./baseRepository"; // Giả định path này đúng
import { ConditionDetail } from "../models/conditionDetail.model"; 

export class ConditionDetailRepository extends BaseRepository<ConditionDetail> {
    protected model = ConditionDetail; 

    /**
     * Lấy tất cả chi tiết điều kiện (không bị xóa) cho một Condition Set cụ thể.
     */
    async findDetailsBySetId(conditionSetId: string): Promise<ConditionDetail[]> {
        return this.findAll({
            where: { 
                condition_set_id: conditionSetId,
                is_deleted: false
            },
            order: [['condition_detail_id', 'ASC']]
        });
    }

    // Thêm các hàm tùy chỉnh khác nếu cần
}