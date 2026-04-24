"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_controller_1 = __importDefault(require("../controllers/address.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const role_enum_1 = require("../enums/role.enum");
const userAddressRouter = (0, express_1.Router)();
/**
 * ===== PROTECTED - USER =====
 * Yêu cầu đăng nhập
 * User chỉ thao tác trên địa chỉ của CHÍNH MÌNH
 */
// Tạo địa chỉ mới
userAddressRouter.post("/", auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.USER, role_enum_1.ROLE.ADMIN]), address_controller_1.default.create);
// Lấy tất cả địa chỉ của user hiện tại
userAddressRouter.get("/", auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.USER, role_enum_1.ROLE.ADMIN]), address_controller_1.default.getAllByUserId);
// Lấy chi tiết địa chỉ theo id (có check ownership)
userAddressRouter.get("/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.USER, role_enum_1.ROLE.ADMIN]), address_controller_1.default.getById);
// Cập nhật địa chỉ (có check ownership)
userAddressRouter.put("/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.USER, role_enum_1.ROLE.ADMIN]), address_controller_1.default.update);
// Xóa mềm địa chỉ (có check ownership)
userAddressRouter.delete("/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.USER, role_enum_1.ROLE.ADMIN]), address_controller_1.default.deleteOne);
exports.default = userAddressRouter;
//# sourceMappingURL=address.route.js.map