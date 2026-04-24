"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionSetRepository = void 0;
const baseRepository_1 = require("./baseRepository"); // Giả định path này đúng
const conditionSets_model_1 = require("../models/conditionSets.model");
const conditionDetail_model_1 = require("../models/conditionDetail.model"); // Cần import nếu muốn dùng include Details
class ConditionSetRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = conditionSets_model_1.ConditionSet;
        // Thêm các hàm tìm kiếm/tạo/cập nhật tùy chỉnh khác nếu cần
    }
    /**
     * Tìm ConditionSet theo ID và có thể bao gồm chi tiết điều kiện (Details).
     */
    async findByIdWithDetails(id) {
        return this.findOne({
            where: { id },
            include: [{
                    model: conditionDetail_model_1.ConditionDetail,
                    as: 'details', // Alias phải khớp với associations
                    where: { is_deleted: false },
                    required: false
                }]
        });
    }
    async findAllWithPagination(page, limit) {
        const offset = (page - 1) * limit;
        return this.model.findAndCountAll({
            limit,
            offset,
            order: [["created_at", "DESC"]],
            transaction: this.transaction,
        });
    }
}
exports.ConditionSetRepository = ConditionSetRepository;
//# sourceMappingURL=conditionSet.repository.js.map