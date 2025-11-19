// ✅ @types/express/index.d.ts (Code đề xuất)
import { User } from '../../models/user.model'; // Giả định đường dẫn này là đúng

declare global {
    namespace Express {
        interface Request {
            // Định nghĩa req.user chỉ là kiểu User
            user?: User; 
        }
    }
}
// Lưu ý: Nếu bạn muốn loại bỏ gợi ý các trường của User, điều đó không khả thi 
// vì bạn đang gán user object đầy đủ từ DB vào req.user.