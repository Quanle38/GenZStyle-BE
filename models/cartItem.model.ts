import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/connection";

export class CartItem extends Model {
    public id!: number; 
    public cart_id!: string; 
    public variant_id!: string; 
    // Giá trị này là giá/đơn vị tại thời điểm thêm vào giỏ
    public total_price!: number; 
    // ✅ CỘT MỚI: Số lượng sản phẩm
    public quantity!: number; 
}

CartItem.init({
    id: {
        type: DataTypes.INTEGER, 
        primaryKey: true,
        autoIncrement: true, 
        allowNull: false
    },
    cart_id: {
        type: DataTypes.STRING(255), 
        allowNull: false
    },
    variant_id: {
        type: DataTypes.STRING(255), 
        allowNull: false
    },
    // Đổi tên 'price' thành 'price_per_unit' cho rõ ràng hơn
    total_price: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false
    },
    // ✅ CỘT MỚI: Số lượng
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: "CartItems", 
    timestamps: false, 
    underscored: true 
});