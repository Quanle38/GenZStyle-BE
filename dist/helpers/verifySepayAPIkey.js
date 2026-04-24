"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySepayAPIkey = verifySepayAPIkey;
function verifySepayAPIkey(req, res, next) {
    const authHeader = req.headers["authorization"];
    // ✅ Block nếu không có header HOẶC không đúng prefix
    if (!authHeader || !authHeader.startsWith("Apikey ")) {
        console.warn("[SEPAY] MISSING FIELD OR AUTHORIZATION");
        res.status(401).json({ success: false, message: "unAuthorize" });
        return;
    }
    // ✅ Dùng đúng prefix "Apikey " (chữ k thường)
    const receivedKey = authHeader.replace("Apikey ", "").trim();
    if (receivedKey !== process.env.SEPAY_APIKEY) {
        console.warn("[SEPAY] INVALID API KEY");
        res.status(401).json({ success: false, message: "invalidApikey" });
        return;
    }
    next();
}
//# sourceMappingURL=verifySepayAPIkey.js.map