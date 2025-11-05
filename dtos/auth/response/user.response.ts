import type { UserAddress } from "../../../models/userAddress.model"; // Import type nếu cần

/**
 * DTO đại diện cho dữ liệu User được trả về cho client.
 * Loại bỏ: password, refresh_token, is_deleted.
 */
export interface UserResponseDTO {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    dob: Date;
    phone_number: string;
    gender: string;
    
    // Timestamps
    created_at: Date;
    updated_at: Date;
    
    // Trạng thái & Vai trò
    is_new: boolean;
    role: string;
    avatar: string | null;

    // Quan hệ (nếu được include)
    addresses?: UserAddress[];
}