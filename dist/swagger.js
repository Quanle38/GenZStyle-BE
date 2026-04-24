"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const yamljs_1 = __importDefault(require("yamljs")); // Import thư viện đọc file YAML
// 💡 Lấy thư mục gốc
const rootPath = process.cwd();
// 🎯 Đọc file YAML trực tiếp
// Đảm bảo file swagger.yaml nằm đúng ở thư mục gốc dự án
const swaggerPath = path_1.default.join(rootPath, "swagger.yaml");
const swaggerSpec = yamljs_1.default.load(swaggerPath);
const setupSwagger = (app) => {
    // Log kiểm tra đường dẫn file để tránh lỗi "File not found"
    console.log(`Loading swagger from: ${swaggerPath}`);
    console.log(`Setting up Swagger UI at http://localhost:5000/api-docs`);
    // Đăng ký middleware Swagger
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map