"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const history_controller_1 = __importDefault(require("../controllers/history.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const role_enum_1 = require("../enums/role.enum");
const router = (0, express_1.Router)();
// Lấy token check userId đó thông qua authMiddleware
router.get("/my-orders", auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.USER]), history_controller_1.default.getOrdersByMe);
exports.default = router;
//# sourceMappingURL=history.route.js.map