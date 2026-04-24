"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conditionSetService = exports.ConditionSetService = void 0;
class ConditionSetService {
    async getAll(uow, page, limit) {
        return await uow.conditionSet.findAllWithPagination(page, limit);
    }
    async getById(uow, id) {
        return await uow.conditionSet.findByIdWithDetails(id);
    }
    async create(uow, body) {
        await uow.start();
        try {
            const { details, ...setData } = body;
            if (!details || details.length === 0) {
                throw new Error("ConditionSet must have at least 1 condition detail");
            }
            const conditionSet = await uow.conditionSet.create(setData);
            const detailData = details.map(d => ({
                condition_set_id: conditionSet.id,
                condition_type: d.condition_type,
                condition_value: d.condition_value,
                is_deleted: false
            }));
            await uow.conditionDetail.bulkCreate(detailData);
            await uow.commit();
            return conditionSet;
        }
        catch (err) {
            await uow.rollback();
            throw err;
        }
    }
    async deleteOne(uow, id) {
        await uow.start();
        try {
            const deletedCount = await uow.conditionSet.delete(id);
            await uow.commit();
            return deletedCount;
        }
        catch (err) {
            await uow.rollback();
            throw err;
        }
    }
    async update(uow, id, body) {
        await uow.start();
        try {
            const { details, ...setData } = body;
            const existing = await uow.conditionSet.findById(id);
            if (!existing) {
                throw new Error("ConditionSet not found");
            }
            if (Object.keys(setData).length > 0) {
                await uow.conditionSet.update(id, setData);
            }
            if (details) {
                if (details.length === 0) {
                    throw new Error("ConditionSet must have at least 1 detail");
                }
                await uow.conditionDetail.updateByCondition({ condition_set_id: id }, { is_deleted: true });
                const newDetails = details.map(d => ({
                    condition_set_id: id,
                    condition_type: d.condition_type,
                    condition_value: d.condition_value,
                    is_deleted: false
                }));
                await uow.conditionDetail.bulkCreate(newDetails);
            }
            // ✅ FIX: query trước commit
            const result = await uow.conditionSet.findByIdWithDetails(id);
            await uow.commit();
            return result;
        }
        catch (err) {
            await uow.rollback();
            throw err;
        }
    }
}
exports.ConditionSetService = ConditionSetService;
exports.conditionSetService = new ConditionSetService();
//# sourceMappingURL=conditionSet.service.js.map