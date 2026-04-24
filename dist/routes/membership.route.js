"use strict";
// =====================================
// File: membership.router.ts (ĐÃ SỬA FINAL)
// =====================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const membershipTier_controller_1 = __importDefault(require("../controllers/membershipTier.controller"));
const membershipRouter = (0, express_1.Router)();
// 1. Lấy tất cả các hạng thành viên (getAll)
// GET /api/membership
membershipRouter.get("/", membershipTier_controller_1.default.getAll);
// 2. Tạo hạng thành viên mới (create)
// POST /api/membership
membershipRouter.post("/", membershipTier_controller_1.default.create);
// 3. Lấy hạng thành viên theo User ID (getByUserId)
// Dùng Query Parameter: GET /api/membership/user-rank?userId=123
membershipRouter.get("/user-rank", membershipTier_controller_1.default.getByUserId);
// 4. Cập nhật hạng thành viên theo ID (update)
// Dùng Query Parameter: PUT /api/membership/update?id=GOLD
membershipRouter.put("/update", membershipTier_controller_1.default.update);
// 5. Xóa mềm hạng thành viên theo ID (delete)
// Dùng Query Parameter: DELETE /api/membership/delete?id=GOLD
membershipRouter.delete("/delete", membershipTier_controller_1.default.delete);
exports.default = membershipRouter;
//# sourceMappingURL=membership.route.js.map