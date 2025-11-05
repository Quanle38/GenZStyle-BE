import { CreateOptions, DestroyOptions, FindOptions, Transaction, UpdateOptions } from "sequelize";
import { IGenericRepository } from "../interface/IGenericInterface";

export abstract class BaseRepository<T> implements IGenericRepository<T> {
    protected transaction: Transaction | null = null;
    protected abstract model: any; // Sequelize Model

    public setTransaction(transaction: Transaction): void {
        this.transaction = transaction;
    }

    protected getTransactionOption() {
        return { transaction: this.transaction };
    }

    async findById(id: string | number, options?: Omit<FindOptions, 'transaction'>): Promise<T | null> {
        return this.model.findByPk(id, {
            ...options,
            ...this.getTransactionOption()
        });
    }

    async findOne(options?: Omit<FindOptions, 'transaction'>): Promise<T | null> {
        return this.model.findOne({
            ...options,
            ...this.getTransactionOption()
        });
    }

    async findAll(options?: Omit<FindOptions, 'transaction'>, transaction?: Transaction | null): Promise<T[]> {
        return this.model.findAll({
            ...options,
            ...this.getTransactionOption()
        });
    }

    async findAndCountAll(options?: Omit<FindOptions, 'transaction'>): Promise<{ rows: T[]; count: number }> {
        return this.model.findAndCountAll({
            ...options,
            ...this.getTransactionOption()
        });
    }

    async create(data: Partial<T>, options?: Omit<CreateOptions, 'transaction'>): Promise<T> {
        return this.model.create(data, {
            ...options,
            ...this.getTransactionOption()
        });
    }

    async bulkCreate(data: Partial<T>[], options?: Omit<CreateOptions, 'transaction'>): Promise<T[]> {
        return this.model.bulkCreate(data, {
            ...options,
            ...this.getTransactionOption()
        });
    }

    async update(id: string | number, data: Partial<T>, options?: Omit<UpdateOptions, 'transaction'>): Promise<[number, T[]]> {
        return this.model.update(data, {
            where: { id },
            ...options,
            ...this.getTransactionOption()
        });
    }

    async updateByCondition(condition: any, data: Partial<T>, options?: Omit<UpdateOptions, 'transaction'>): Promise<[number, T[]]> {
        return this.model.update(data, {
            where: condition,
            ...options,
            ...this.getTransactionOption()
        });
    }

    async delete(id: string | number, options?: Omit<DestroyOptions, 'transaction'>): Promise<number> {
        return this.model.destroy({
            where: { id },
            ...options,
            ...this.getTransactionOption()
        });
    }

    async softDelete(id: string | number): Promise<boolean> {
        const [affectedCount] = await this.model.update(
            { is_deleted: true },
            {
                where: { id },
                ...this.getTransactionOption()
            }
        );
        return affectedCount > 0;
    }

    async bulkDelete(ids: (string | number)[], options?: Omit<DestroyOptions, 'transaction'>): Promise<number> {
        return this.model.destroy({
            where: { id: ids },
            ...options,
            ...this.getTransactionOption()
        });
    }

    async count(options?: Omit<FindOptions, 'transaction'>): Promise<number> {
        return this.model.count({
            ...options,
            ...this.getTransactionOption()
        });
    }

    async exists(id: string | number): Promise<boolean> {
        const count = await this.model.count({
            where: { id },
            ...this.getTransactionOption()
        });
        return count > 0;
    }
}