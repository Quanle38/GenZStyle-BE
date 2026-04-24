"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const role_enum_1 = require("../enums/role.enum");
const upload_middleware_1 = __importDefault(require("../middleware/upload.middleware"));
const authRouter = (0, express_1.Router)();
// PUBLIC
authRouter.post("/login", auth_controller_1.default.login);
authRouter.post("/register", upload_middleware_1.default.single("file"), auth_controller_1.default.register);
authRouter.post("/refreshToken", auth_controller_1.default.refreshToken);
// PROTECTED
authRouter.post("/logout", auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.ADMIN, role_enum_1.ROLE.USER]), auth_controller_1.default.logout);
authRouter.get("/me", auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.ADMIN, role_enum_1.ROLE.USER]), auth_controller_1.default.me);
exports.default = authRouter;
//# sourceMappingURL=auth.route.js.map