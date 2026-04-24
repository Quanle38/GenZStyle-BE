"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const variant_controller_1 = __importDefault(require("../controllers/variant.controller"));
const variantRouter = (0, express_1.Router)();
variantRouter.get("/", variant_controller_1.default.getAll);
variantRouter.get("/:id", variant_controller_1.default.getById);
variantRouter.post("/create", variant_controller_1.default.create);
variantRouter.post("/autoCreate", variant_controller_1.default.autoImportVariant);
// variantRouter.patch("/update/:id", [authMiddleware, checkRole([ROLE.ADMIN])],variantController.update);
variantRouter.patch("/update/:id", variant_controller_1.default.update);
//variantRouter.delete("/delete/:id", [authMiddleware, checkRole([ROLE.ADMIN])],variantController.deleteOne);
variantRouter.delete("/delete/:id", variant_controller_1.default.deleteOne);
exports.default = variantRouter;
//# sourceMappingURL=variant.route.js.map