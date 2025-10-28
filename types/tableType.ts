import { ConditionType, CouponType, OrderStatus, PaymentMethod, PaymentStatus, Role } from "../enums/mapping";

// Users
export interface User {
  id: string;        // "id": "U001"
  address_id: number;     // "address_id": 1
  refresh_token: string | null; // "refresh_token": "rt1" | có thể null
  first_name: string;     // "first_name": "VHU"
  last_name: string;      // "last_name": "An"
  email: string;          // "email": "an@example.com"
  dob: Date;              // "dob": ISO date string → parse thành Date trong JS
  phone_number: string;   // "phone_number": "0901234567"
  gender: string;         // "gender": "Male"
  password: string;       // "password": "hashedpass1"
  created_at: Date;       // "created_at": timestamp
  updated_at: Date;       // "updated_at": timestamp
  is_new: boolean;        // "is_new": true
  role: Role;             // "role": "USER"
  is_deleted: boolean;    // "is_deleted": false
  avatar: string | null;  // PostgreSQL "avata" → sửa đúng chính tả "avatar"
}

// UserAddresses
export interface UserAddress {
  address_id: number;
  full_address: string;
  is_default: boolean;
  label: string;
  is_deleted : boolean
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
  brand: string;
  price: number;
  color: string;
  size: string;
  is_deleted: boolean;
  thumbnail : string;
}

// Variants
export interface Variant {
  variant_id: string;
  product_id: string;   // FK -> Products
  size: string;
  color: string;
  stock: number;
  price: number;
  is_deleted: boolean;
  image?: string;
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
