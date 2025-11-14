// models/favorite.model.ts
import {
    DataTypes, Model, Optional,
    BelongsToGetAssociationMixin, BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin, Association
} from "sequelize";
import { sequelize } from "../config/connection";
import type { User } from "./user.model"; // Giả định
import type { Product } from "./product.model"; // Giả định

/**
 * Attributes for the Favorite Model
 */
export interface FavoriteAttributes {
    favorite_id: number;
    user_id: string; // Foreign Key to User
    product_id: string; // Foreign Key to Product
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
    // Quan hệ
    user?: User;
    product?: Product;
}

/**
 * Optional attributes when creating a new Favorite
 */
export interface FavoriteCreationAttributes extends Optional<FavoriteAttributes,
    "favorite_id" | "is_deleted" | "created_at" | "updated_at"> { }

/**
 * The Sequelize Favorite Model
 */
export class Favorite
    extends Model<FavoriteAttributes, FavoriteCreationAttributes>
    implements FavoriteAttributes {

    public favorite_id!: number;
    public user_id!: string;
    public product_id!: string;
    public is_deleted!: boolean;

    public created_at!: Date;
    public updated_at!: Date;

    // Mixins cho quan hệ BelongsTo User
    public getUser!: BelongsToGetAssociationMixin<User>;
    public setUser!: BelongsToSetAssociationMixin<User, string>; 
    public createUser!: BelongsToCreateAssociationMixin<User>;

    // Mixins cho quan hệ BelongsTo Product
    public getProduct!: BelongsToGetAssociationMixin<Product>;
    public setProduct!: BelongsToSetAssociationMixin<Product, string>; 
    public createProduct!: BelongsToCreateAssociationMixin<Product>;

    public static associations: {
        user: Association<Favorite, User>;
        product: Association<Favorite, Product>;
    };
}

// --- Khởi tạo Model ---
Favorite.init(
    {
        favorite_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        product_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "Favorites",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);