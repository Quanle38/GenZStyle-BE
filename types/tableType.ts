import { ConditionType, CouponType, OrderStatus, PaymentMethod, PaymentStatus, Role } from "../enums/mapping";

// Users
export interface User {
  user_id: string;
  address_id: number;
  refresh_token: string;
  first_name: string;
  last_name: string;
  email: string;
  dob: Date; // PostgreSQL date → JS Date
  phone_number: string;
  gender: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  is_new: boolean;
  role: Role;
}

// UserAddresses
export interface UserAddress {
  address_id: number;
  full_address: string;
  is_default: boolean;
  label: string;
}

// Carts
export interface Cart {
  cart_id: string;
  user_id: string;
  amount: number;
  total_price: number; // decimal → number
}

// CartItems
export interface CartItem {
  id: number;
  cart_id: string;
  variant_id: string;
  price: number;
}

// Products
export interface Product {
  product_id: string;
  name: string;
  base_price: number;
  description: string;
}

// Variants
export interface Variant {
  variant_id: string;
  product_id: string;
  size: number;
  color: string;
  stock: number;
  price: number;
}

// Coupons
export interface Coupon {
  coupon_id: string;
  code: string;
  start_time: Date;
  end_time: Date;
  type: CouponType;
  usage_limit: number;
  used_count: number;
  value: number;
  max_discount: number;
}

// CouponConditions
export interface CouponCondition {
  condition_id: number;
  coupon_id: string;
  condition_type: ConditionType;
  condition_value?: string;
}

// Favorite
export interface Favorite {
  favorite_id: number;
  user_id: string;
  product_id: string;
}

// Orders
export interface Order {
  oder_id: string;
  cart_id: string;
  coupon_id?: string;
  total_amount: number;
  discount: number;
  shipping_address: string;
  created_at: Date;
  updated_at: Date;
  status: OrderStatus;
}

// Payment
export interface Payment {
  payment_id: string;
  oder_id: string;
  method: PaymentMethod;
  amount: number;
  transaction_code: string;
  status: PaymentStatus;
  paid_at: Date;
  created_at: Date;
}
