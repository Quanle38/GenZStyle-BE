"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = void 0;
// helpers/password.helper.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const hashPassword = async (plain) => {
    const hashed = await bcrypt_1.default.hash(plain, SALT_ROUNDS);
    return hashed;
};
exports.hashPassword = hashPassword;
/**
 * verifyPassword:
 * - Nếu storedPassword có dấu hiệu là bcrypt hash (bắt đầu bằng $2a$/$2b$...), dùng bcrypt.compare
 * - Nếu không (plaintext trong DB), so sánh trực tiếp. Nếu khớp, caller có thể hash & cập nhật DB.
 */
const verifyPassword = async (candidate, storedPassword) => {
    const looksHashed = typeof storedPassword === "string" && /^\$2[aby]\$/.test(storedPassword);
    if (looksHashed) {
        const ok = await bcrypt_1.default.compare(candidate, storedPassword);
        return { ok, needsRehash: false };
    }
    else {
        // stored as plaintext
        const ok = candidate === storedPassword;
        // nếu đúng, nên hash lại và cập nhật DB (caller tự làm)
        return { ok, needsRehash: ok };
    }
};
exports.verifyPassword = verifyPassword;
//# sourceMappingURL=password.helper.js.map