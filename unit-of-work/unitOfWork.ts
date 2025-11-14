import { Transaction } from "sequelize";
import { sequelize } from "../config/connection";
import { UserRepository } from "../repositories/user.repository";
import { UserAddressRepository } from "../repositories/userAddress.repository";
import { ProductRepository } from "../repositories/product.repository";
import { ProductVariantRepository } from "../repositories/productVariant.repository";
import { FavoriteRepository } from "../repositories/favorite.repository";
import { CouponRepository } from "../repositories/coupon.repository";
// ❌ XÓA import Repository cũ
// import { CouponConditionRepository } from "../repositories/couponCondition.repository"; 
import { MembershipTierRepository } from "../repositories/membershipTier.repository";

// ➡️ THÊM IMPORTS CHO REPOSITORIES MỚI
import { ConditionSetRepository } from "../repositories/conditionSet.repository"; 
import { ConditionDetailRepository } from "../repositories/conditionDetail.repository"; 

export class UnitOfWork {
    private transaction: Transaction | null = null;

    // Khai báo tất cả repositories
    users: UserRepository;
    userAddresses: UserAddressRepository;
    products: ProductRepository;
    productVariants: ProductVariantRepository;
    favorite: FavoriteRepository;
    coupon: CouponRepository;
    // ❌ KHAI BÁO CŨ
    // couponCondition: CouponConditionRepository; 
    membershipTier : MembershipTierRepository;

    // ➡️ KHAI BÁO REPOSITORIES MỚI
    conditionSet: ConditionSetRepository;
    conditionDetail: ConditionDetailRepository;

    constructor() {
        this.users = new UserRepository();
        this.userAddresses = new UserAddressRepository();
        this.products = new ProductRepository();
        this.productVariants = new ProductVariantRepository();
        this.favorite = new FavoriteRepository();
        this.coupon = new CouponRepository();
        // ❌ KHỞI TẠO CŨ
        // this.couponCondition = new CouponConditionRepository();
        this.membershipTier = new MembershipTierRepository();

        // ➡️ KHỞI TẠO REPOSITORIES MỚI
        this.conditionSet = new ConditionSetRepository();
        this.conditionDetail = new ConditionDetailRepository();
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
        this.favorite.setTransaction(this.transaction);
        this.coupon.setTransaction(this.transaction);
        
        // ❌ SET TRANSACTION CŨ
        // this.couponCondition.setTransaction(this.transaction);
        this.membershipTier.setTransaction(this.transaction);

        // ➡️ SET TRANSACTION MỚI
        this.conditionSet.setTransaction(this.transaction);
        this.conditionDetail.setTransaction(this.transaction);
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