// File: src/interfaces/IGeneric.interface.ts

import { Transaction, FindOptions, CreateOptions, UpdateOptions, DestroyOptions } from "sequelize";

/**
 * Generic Repository Interface cho các CRUD operations cơ bản
 */
export interface IGenericRepository<T> {
    // Set transaction cho repository
    setTransaction(transaction: Transaction): void;

    // READ operations
    findById(id: string | number, options?: Omit<FindOptions, 'transaction'>): Promise<T | null>;
    findOne(options?: Omit<FindOptions, 'transaction'>): Promise<T | null>;
    findAll(options?: Omit<FindOptions, 'transaction'>): Promise<T[]>;
    findAndCountAll(options?: Omit<FindOptions, 'transaction'>): Promise<{ rows: T[]; count: number }>;

    // CREATE operations
    create(data: Partial<T>, options?: Omit<CreateOptions, 'transaction'>): Promise<T>;
    bulkCreate(data: Partial<T>[], options?: Omit<CreateOptions, 'transaction'>): Promise<T[]>;

    // UPDATE operations
    update(id: string | number, data: Partial<T>, options?: Omit<UpdateOptions, 'transaction'>): Promise<[number, T[]]>;
    updateByCondition(condition: any, data: Partial<T>, options?: Omit<UpdateOptions, 'transaction'>): Promise<[number, T[]]>;

    // DELETE operations
    delete(id: string | number, options?: Omit<DestroyOptions, 'transaction'>): Promise<number>;
    softDelete(id: string | number): Promise<boolean>;
    bulkDelete(ids: (string | number)[], options?: Omit<DestroyOptions, 'transaction'>): Promise<number>;

    // COUNT operations
    count(options?: Omit<FindOptions, 'transaction'>): Promise<number>;

    // EXISTS operations
    exists(id: string | number): Promise<boolean>;
}
