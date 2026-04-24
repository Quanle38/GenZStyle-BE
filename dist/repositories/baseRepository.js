"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor() {
        this.transaction = null;
    }
    setTransaction(transaction) {
        this.transaction = transaction;
    }
    getTransactionOption() {
        return { transaction: this.transaction };
    }
    async findById(id, options) {
        return this.model.findByPk(id, {
            ...options,
            ...this.getTransactionOption()
        });
    }
    async findOne(options) {
        return this.model.findOne({
            ...options,
            ...this.getTransactionOption()
        });
    }
    async findAll(options, transaction) {
        return this.model.findAll({
            ...options,
            ...this.getTransactionOption()
        });
    }
    async findAndCountAll(options) {
        return this.model.findAndCountAll({
            ...options,
            ...this.getTransactionOption()
        });
    }
    async create(data, options) {
        return this.model.create(data, {
            ...options,
            ...this.getTransactionOption()
        });
    }
    async bulkCreate(data, options) {
        return this.model.bulkCreate(data, {
            ...options,
            ...this.getTransactionOption()
        });
    }
    async update(id, data, options) {
        return this.model.update(data, {
            where: { id },
            ...options,
            ...this.getTransactionOption()
        });
    }
    async updateByCondition(condition, data, options) {
        return this.model.update(data, {
            where: condition,
            ...options,
            ...this.getTransactionOption()
        });
    }
    async delete(id, options) {
        return this.model.destroy({
            where: { id },
            ...options,
            ...this.getTransactionOption()
        });
    }
    async softDelete(id) {
        const [affectedCount] = await this.model.update({ is_deleted: true }, {
            where: { id },
            ...this.getTransactionOption()
        });
        return affectedCount > 0;
    }
    async bulkDelete(ids, options) {
        return this.model.destroy({
            where: { id: ids },
            ...options,
            ...this.getTransactionOption()
        });
    }
    async count(options) {
        return this.model.count({
            ...options,
            ...this.getTransactionOption()
        });
    }
    async exists(id) {
        const count = await this.model.count({
            where: { id },
            ...this.getTransactionOption()
        });
        return count > 0;
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=baseRepository.js.map