import { ConditionDetailDTO } from "./create.request";

export interface UpdateConditionSetRequest {
  name?: string;
  is_reusable?: boolean;

  details?: ConditionDetailDTO[]; 
  // nếu truyền → replace toàn bộ
}