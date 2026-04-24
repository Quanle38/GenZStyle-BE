"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const role_enum_1 = require("../enums/role.enum");
const productRouter = (0, express_1.Router)();
productRouter.get("/", product_controller_1.default.getAll);
productRouter.get("/search", product_controller_1.default.search);
productRouter.get("/:id", product_controller_1.default.getById);
productRouter.post("/create", product_controller_1.default.create);
productRouter.post("/update/:id", [auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.ADMIN])], product_controller_1.default.update);
productRouter.delete("/delete/:id", [auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.ADMIN])], product_controller_1.default.deleteOne);
exports.default = productRouter;
//# sourceMappingURL=product.route.js.map