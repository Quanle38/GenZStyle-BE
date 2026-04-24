"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const email_1 = __importDefault(require("../config/email"));
class EmailService {
    async sendMail(to, subject, html) {
        try {
            const info = await email_1.default.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                html,
            });
            console.log("email", info.messageId);
            return true;
        }
        catch (err) {
            console.error("Email", err);
            return false;
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map