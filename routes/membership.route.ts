// =====================================
// File: membership.router.ts (ĐÃ SỬA FINAL)
// =====================================

import { Router } from "express";
import membershipTierController from "../controllers/membershipTier.controller"; 

const membershipRouter = Router();

// 1. Lấy tất cả các hạng thành viên (getAll)
// GET /api/membership
membershipRouter.get("/", membershipTierController.getAll);

// 2. Tạo hạng thành viên mới (create)
// POST /api/membership
membershipRouter.post("/", membershipTierController.create);

// 3. Lấy hạng thành viên theo User ID (getByUserId)
// Dùng Query Parameter: GET /api/membership/user-rank?userId=123
membershipRouter.get("/user-rank", membershipTierController.getByUserId);

// 4. Cập nhật hạng thành viên theo ID (update)
// Dùng Query Parameter: PUT /api/membership/update?id=GOLD
membershipRouter.put("/update", membershipTierController.update);

// 5. Xóa mềm hạng thành viên theo ID (delete)
// Dùng Query Parameter: DELETE /api/membership/delete?id=GOLD
membershipRouter.delete("/delete", membershipTierController.delete);

export default membershipRouter;