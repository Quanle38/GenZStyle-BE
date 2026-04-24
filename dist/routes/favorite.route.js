"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favoriteController_1 = __importDefault(require("../controllers/favoriteController"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const role_enum_1 = require("../enums/role.enum");
const favoriteRouter = (0, express_1.Router)();
favoriteRouter.get("/", auth_middleware_1.authMiddleware, favoriteController_1.default.getAllByCurrentUser);
favoriteRouter.post("/toggle", auth_middleware_1.authMiddleware, favoriteController_1.default.toggleFavorite);
favoriteRouter.get("/by-id", [auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.USER])], favoriteController_1.default.getAllByUserId);
favoriteRouter.post("/send", favoriteController_1.default.sendEmail);
exports.default = favoriteRouter;
//# sourceMappingURL=favorite.route.js.map