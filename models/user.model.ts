import {
    DataTypes, Model, Optional,
    HasManyGetAssociationsMixin, HasManyAddAssociationMixin,
    HasManySetAssociationsMixin, HasManyRemoveAssociationMixin,
    HasManyCountAssociationsMixin, HasManyCreateAssociationMixin,
    Association
} from "sequelize";
import { sequelize } from "../config/connection";
import type { MembershipTier } from "./memberShipTier.model";
import type { UserAddress } from "./userAddress.model";

export interface UserAttributes {
    id: string;
    refresh_token: string | null;
    first_name: string;
    last_name: string;
    email: string;
    dob: Date;
    phone_number: string;
    gender: string;
    password: string;
    created_at: Date;
    updated_at: Date;
    is_new: boolean;
    role: string;
    is_deleted: boolean;
    avatar: string | null;
    membership_id: string; 
    addresses?: UserAddress[];
    membership?: MembershipTier;
}

interface UserCreationAttributes extends Optional<UserAttributes, 
    "id" | "created_at" | "updated_at" | "refresh_token" | "avatar" | "is_new" | "is_deleted"> { }

export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    
    public id!: string;
    public refresh_token!: string | null;
    public first_name!: string;
    public last_name!: string;
    public email!: string;
    public dob!: Date;
    public phone_number!: string;
    public gender!: string;
    public password!: string;
    public created_at!: Date;
    public updated_at!: Date;
    public is_new!: boolean;
    public role!: string;
    public is_deleted!: boolean;
    public avatar!: string | null;
    public membership_id!: string;
    public membership?: MembershipTier;

    public getAddresses!: HasManyGetAssociationsMixin<UserAddress>;
    public addAddress!: HasManyAddAssociationMixin<UserAddress, number>;
    public addAddresses!: HasManyAddAssociationMixin<UserAddress, number>;
    public setAddresses!: HasManySetAssociationsMixin<UserAddress, number>;
    public removeAddress!: HasManyRemoveAssociationMixin<UserAddress, number>;
    public removeAddresses!: HasManyRemoveAssociationMixin<UserAddress, number>;
    public countAddresses!: HasManyCountAssociationsMixin;
    public createAddress!: HasManyCreateAssociationMixin<UserAddress>;

    public static associations: {
        addresses: Association<User, UserAddress>;
        membership: Association<User, MembershipTier>;
    };
}

User.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        refresh_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        dob: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_new: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        avatar: {
            type: DataTypes.STRING,
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
        membership_id: { 
            type: DataTypes.STRING(50), 
            allowNull: true, 
           // defaultValue: 'BRONZE'
            // ❌ KHÔNG định nghĩa REFERENCES ở đây
            // Foreign key sẽ được định nghĩa trong associations.ts
        },
    },
    {
        sequelize,
        tableName: "Users",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);