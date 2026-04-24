"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/cartCoupon.route.ts
const express_1 = require("express");
const webhook_controller_1 = require("../controllers/webhook.controller");
const verifySepayAPIkey_1 = require("../helpers/verifySepayAPIkey");
const webhookrouter = (0, express_1.Router)();
// authMiddleware đã được apply từ cartRouter cha
webhookrouter.post("/sepay", verifySepayAPIkey_1.verifySepayAPIkey, webhook_controller_1.webhookController.webhook);
exports.default = webhookrouter;
//# sourceMappingURL=webhook.route.js.map