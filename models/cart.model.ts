import {
  DataTypes,
  Model,
  Association,
  HasManyGetAssociationsMixin
} from "sequelize";
import { sequelize } from "../config/connection";
import { CartItem } from "./cartItem.model";

export class Cart extends Model {
  public id!: string;
  public user_id!: string;
  public amount!: number;
  public total_price!: number;

  // ✅ BỔ SUNG: quan hệ items
  public items?: CartItem[];

  // (optional) mixin nếu cần dùng
  public getItems!: HasManyGetAssociationsMixin<CartItem>;

  public static associations: {
    items: Association<Cart, CartItem>;
  };
}

Cart.init(
  {
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
      defaultValue: 0.0
    }
  },
  {
    sequelize,
    tableName: "Carts",
    timestamps: false,
    underscored: true
  }
);
