// File: enums/order.ts

export enum OrderStatus {
    // 1. Trạng thái Ban đầu (Đang chờ)
    PENDING = "Pending",        // Đang chờ xử lý, chờ thanh toán hoặc chờ xác nhận
    
    // 2. Trạng thái Hoạt động (Đang diễn ra)
    PROCESSING = "Processing",  // Đang được xử lý, đóng gói hoặc chuẩn bị giao hàng
    
    // ✨ TRẠNG THÁI VẬN CHUYỂN MỚI
    SHIPPING = "Shipping",      // Đã chuyển cho đơn vị vận chuyển / Đang trên đường giao hàng
    DELIVERED = "Delivered",    // Đã giao hàng thành công
    
    // 3. Trạng thái Hoàn tất Thành công
    COMPLETED = "Completed",    // Hoàn thành đơn hàng (Thường là sau khi giao và hết thời hạn đổi trả)
    
    // 4. Trạng thái Hoàn tất Thất bại/Ngưng
    CANCELLED = "Cancelled",    // Đã bị hủy bởi khách hàng hoặc người bán
    FAILED = "Failed"           // Thất bại (ví dụ: lỗi thanh toán, giao hàng không thành công, bị từ chối)
}

// Enum OrderMethod giữ nguyên
export enum OrderMethod {
    CAST = "Cast", // Thanh toán tiền mặt (Cash) hoặc COD
    BANK = "Bank"  // Thanh toán qua ngân hàng, thẻ, hoặc ví điện tử
}