"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionDetailRepository = void 0;
const baseRepository_1 = require("./baseRepository"); // Giả định path này đúng
const conditionDetail_model_1 = require("../models/conditionDetail.model");
class ConditionDetailRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = conditionDetail_model_1.ConditionDetail;
        // Thêm các hàm tùy chỉnh khác nếu cần
    }
    /**
     * Lấy tất cả chi tiết điều kiện (không bị xóa) cho một Condition Set cụ thể.
     */
    async findDetailsBySetId(conditionSetId) {
        return this.findAll({
            where: {
                condition_set_id: conditionSetId,
                is_deleted: false
            },
            order: [['condition_detail_id', 'ASC']]
        });
    }
}
exports.ConditionDetailRepository = ConditionDetailRepository;
//# sourceMappingURL=conditionDetail.repository.js.map