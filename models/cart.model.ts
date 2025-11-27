import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/connection";

export class Cart extends Model {
    public id!: string; 
    public user_id!: string; 
    public amount!: number; 
    public total_price!: number; 
}

Cart.init({
    id: {
        type: DataTypes.STRING(255), 
        primaryKey: true,
        allowNull: false,
        defaultValue: sequelize.literal("next_cart_id()")
            
    },
    user_id: {
        type: DataTypes.STRING(255), 
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER, 
        allowNull: false,
        defaultValue: 0
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
        defaultValue: 0.00
    }
}, {
    sequelize,
    tableName: "Carts", 
    // ✅ BỔ SUNG DÒNG NÀY ĐỂ TẮT created_at VÀ updated_at
    timestamps: false, 
    // -----------------------
    underscored: true 
});