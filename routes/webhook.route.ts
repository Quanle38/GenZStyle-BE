// routes/cartCoupon.route.ts
import { Router } from "express";
import { webhookController } from "../controllers/webhook.controller";
import { verifySepayAPIkey } from "../helpers/verifySepayAPIkey"


const webhookrouter = Router();

// authMiddleware đã được apply từ cartRouter cha
webhookrouter.post("/sepay", verifySepayAPIkey, webhookController.webhook );
export default webhookrouter;