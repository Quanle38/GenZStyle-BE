import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CreateConditionSetRequest } from "../dtos/conditionSet/request/create.request";
import { UpdateConditionSetRequest } from "../dtos/conditionSet/request/update.request";

export class ConditionSetService {

    async getAll(uow: UnitOfWork, page: number, limit: number) {
        return await uow.conditionSet.findAllWithPagination(page, limit);
    }

    async getById(uow: UnitOfWork, id: string) {
        return await uow.conditionSet.findByIdWithDetails(id);
    }

    async create(uow: UnitOfWork, body: CreateConditionSetRequest) {
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

        } catch (err) {
            await uow.rollback();
            throw err;
        }
    }

    async deleteOne(uow: UnitOfWork, id: string) {
        await uow.start();
        try {
            const deletedCount = await uow.conditionSet.delete(id);

            await uow.commit();

            return deletedCount;

        } catch (err) {
            await uow.rollback();
            throw err;
        }
    }

    async update(
        uow: UnitOfWork,
        id: string,
        body: UpdateConditionSetRequest
    ) {
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

                await uow.conditionDetail.updateByCondition(
                    { condition_set_id: id },
                    { is_deleted: true }
                );

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

        } catch (err) {
            await uow.rollback();
            throw err;
        }
    }
}

export const conditionSetService = new ConditionSetService();