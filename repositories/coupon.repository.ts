// repositories/coupon.repository.ts
import { BaseRepository } from "./baseRepository";
import { Coupon } from "../models/coupon.model"; 
import { Op } from "sequelize";

export class CouponRepository extends BaseRepository<Coupon> {
    // Ép kiểu (as any) cần thiết nếu BaseRepository không được khai báo generic đúng
    protected model = Coupon as any; 

    /**
     * Tìm coupon theo mã code và kiểm tra trạng thái hoạt động/hết hạn.
     */
    async findActiveCouponByCode(code: string): Promise<Coupon | null> {
        const now = new Date();
        
        return this.findOne({
            where: {
                code,
                is_deleted: false,
                start_time: { [Op.lte]: now }, // Bắt đầu trước hoặc bằng thời điểm hiện tại
                end_time: { [Op.gte]: now },   // Kết thúc sau hoặc bằng thời điểm hiện tại
                // Lưu ý: Không kiểm tra used_count < usage_limit ở đây, để logic kiểm tra đó ở Service.
            },
            include: ['conditions'],
        });
    }

    /**
     * Tăng số lần sử dụng của coupon một cách nguyên tử (atomic).
     */
    async incrementUsedCount(couponId: string): Promise<boolean> {
        if (!this.model) {
             return false;
        }

        try {
            await this.model.increment(
                'used_count',
                {
                    by: 1,
                    where: { id: couponId },
                    // Đảm bảo transaction được áp dụng nếu có
                    ...this.getTransactionOption() 
                }
            );
            return true;
        } catch (error) {
            return false;
        }
    }
}