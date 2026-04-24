"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const role_enum_1 = require("../enums/role.enum");
const upload_middleware_1 = __importDefault(require("../middleware/upload.middleware"));
const router = (0, express_1.Router)();
// User : getId, update 
router.patch("/update/:id", [auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.ADMIN, role_enum_1.ROLE.USER])], upload_middleware_1.default.single("file"), user_controller_1.default.update);
//ADMIN
router.post("/create", [auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.ADMIN])], user_controller_1.default.create);
router.get("/getAll", [auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.ADMIN])], user_controller_1.default.getAll);
router.get("/get/:id", [auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.ADMIN, role_enum_1.ROLE.USER])], user_controller_1.default.getById);
router.delete("/delete/:id", [auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.ADMIN])], user_controller_1.default.deleteOne);
exports.default = router;
//# sourceMappingURL=user.route.js.map