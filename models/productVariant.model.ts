import {
    DataTypes, Model, Optional,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin,
    Association
} from "sequelize";
import { sequelize } from "../config/connection";
import type { Product } from "./product.model";

export interface ProductVariantAttributes {
    id: string;
    product_id: string;
    size: number;
    color: string;
    stock: number;
    price: number;
    is_deleted: boolean;
    image: string | null;
    created_at: Date;
    updated_at: Date;
    
    // Quan hệ
    product?: Product;
}

interface ProductVariantCreationAttributes extends Optional<ProductVariantAttributes, 
    "id" | "is_deleted" | "image" | "created_at" | "updated_at"> { }

export class ProductVariant
    extends Model<ProductVariantAttributes, ProductVariantCreationAttributes>
    implements ProductVariantAttributes {
    
    public id!: string;
    public product_id!: string;
    public size!: number;
    public color!: string;
    public stock!: number;
    public price!: number;
    public is_deleted!: boolean;
    public image!: string | null;
    public created_at!: Date;
    public updated_at!: Date;

    // Mixins cho quan hệ BelongsTo
    public getProduct!: BelongsToGetAssociationMixin<Product>;
    public setProduct!: BelongsToSetAssociationMixin<Product, string>;
    public createProduct!: BelongsToCreateAssociationMixin<Product>;

    public static associations: {
        product: Association<ProductVariant, Product>;
    };
}

ProductVariant.init(
    {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        product_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        tableName: "Variants",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);