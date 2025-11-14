import {
    DataTypes, Model, Optional,
    HasManyGetAssociationsMixin, HasManyAddAssociationMixin,
    HasManySetAssociationsMixin, HasManyRemoveAssociationMixin,
    HasManyCountAssociationsMixin, HasManyCreateAssociationMixin,
    Association
} from "sequelize";
import { sequelize } from "../config/connection";
import type { ProductVariant } from "./productVariant.model";

export interface ProductAttributes {
    id: string;
    name: string;
    base_price: number;
    description: string | null;
    is_deleted: boolean;
    brand: string | null;
    created_at: Date;
    updated_at: Date;
    category : string;
    // Quan hệ
    variants?: ProductVariant[];
}

interface ProductCreationAttributes extends Optional<ProductAttributes,
    "id" | "description" | "is_deleted" |  "brand" | "created_at" | "updated_at" |"category"> { }

export class Product
    extends Model<ProductAttributes, ProductCreationAttributes>
    implements ProductAttributes {

    public id!: string;
    public name!: string;
    public base_price!: number;
    public description!: string | null;
    public is_deleted!: boolean;
    public thumbnail!: string | null;
    public brand!: string | null;
    public created_at!: Date;
    public updated_at!: Date;
    public category! : string;

    // Mixins cho ProductVariant
    public getVariants!: HasManyGetAssociationsMixin<ProductVariant>;
    public addVariant!: HasManyAddAssociationMixin<ProductVariant, string>;
    public addVariants!: HasManyAddAssociationMixin<ProductVariant, string>;
    public setVariants!: HasManySetAssociationsMixin<ProductVariant, string>;
    public removeVariant!: HasManyRemoveAssociationMixin<ProductVariant, string>;
    public removeVariants!: HasManyRemoveAssociationMixin<ProductVariant, string>;
    public countVariants!: HasManyCountAssociationsMixin;
    public createVariant!: HasManyCreateAssociationMixin<ProductVariant>;

    public static associations: {
        variants: Association<Product, ProductVariant>;
    };
}

Product.init(
    {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        base_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        brand: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW, // Thêm mặc định
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW, // Thêm mặc định
        },
         category: {
            type: DataTypes.STRING(255),
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: "Products",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);