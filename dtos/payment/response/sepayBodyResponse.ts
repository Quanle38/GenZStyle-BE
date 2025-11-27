export interface SepayBodyResponse {
    id: number;                 // ID giao dịch trên SePay
    gateway: string;            // Brand name của ngân hàng
    transactionDate: string;    // Thời gian giao dịch phía ngân hàng (YYYY-MM-DD HH:mm:ss)
    accountNumber: string;      // Số tài khoản ngân hàng
    code: string | null;        // Mã code thanh toán (SePay tự nhận diện)
    content: string;            // Nội dung chuyển khoản
    transferType: "in" | "out"; // Loại giao dịch: in = tiền vào, out = tiền ra
    transferAmount: number;     // Số tiền giao dịch
    accumulated: number;        // Số dư tài khoản sau giao dịch
    subAccount: string | null;  // Tài khoản phụ (nếu có)
    referenceCode: string;      // Mã tham chiếu của SMS banking
    description: string;        // Nội dung đầy đủ tin nhắn SMS
}
