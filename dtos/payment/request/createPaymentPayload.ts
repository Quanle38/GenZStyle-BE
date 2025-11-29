export interface CreatePaymentPayload {
    order_id: string;
    gateway: string; // VD: 'momo', 'vnpay', 'zalopay', 'paypal', 'stripe'
    amount: number;
    reference_number?: string | null; // Mã tham chiếu từ cổng thanh toán (có thể tạo sau)
    status?: string; // Nếu không truyền sẽ dùng default là 'pending'
}