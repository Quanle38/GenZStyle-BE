import { Transaction } from "sequelize";
import { sequelize } from "../config/connection";
import { UserRepository } from "../repositories/user.repository";
import { UserAddressRepository } from "../repositories/userAddress.repository";
import { ProductRepository } from "../repositories/product.repository";
import { ProductVariantRepository } from "../repositories/productVariant.repository";

export class UnitOfWork {
    private transaction: Transaction | null = null;

    // Khai báo tất cả repositories
    users: UserRepository;
    userAddresses: UserAddressRepository;
    products: ProductRepository;
    productVariants: ProductVariantRepository;

    constructor() {
        this.users = new UserRepository();
        this.userAddresses = new UserAddressRepository();
        this.products = new ProductRepository();
        this.productVariants = new ProductVariantRepository();
    }

    /**
     * Bắt đầu transaction mới
     */
    async start(): Promise<void> {
        this.transaction = await sequelize.transaction();
        
        // Set transaction cho tất cả repositories
        this.users.setTransaction(this.transaction);
        this.userAddresses.setTransaction(this.transaction);
        this.products.setTransaction(this.transaction);
        this.productVariants.setTransaction(this.transaction);
    }

    /**
     * Commit transaction
     */
    async commit(): Promise<void> {
        if (this.transaction) {
            await this.transaction.commit();
            this.transaction = null;
        }
    }

    /**
     * Rollback transaction
     */
    async rollback(): Promise<void> {
        if (this.transaction) {
            await this.transaction.rollback();
            this.transaction = null;
        }
    }

    /**
     * Kiểm tra xem có transaction đang chạy không
     */
    isTransactionActive(): boolean {
        return this.transaction !== null;
    }
}
