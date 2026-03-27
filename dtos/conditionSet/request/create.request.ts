import { CouponConditionType } from "../../../models/conditionDetail.model";

export interface ConditionDetailDTO {
  condition_type: CouponConditionType;
  condition_value: string;
}
export interface CreateConditionSetRequest {
  id: string;              // ví dụ: SET_GOLD_1M
  name: string;
  is_reusable: boolean;

  details: ConditionDetailDTO[]; // bắt buộc >= 1
}