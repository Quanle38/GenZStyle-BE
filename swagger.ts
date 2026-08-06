import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";
import fs from "fs";
import YAML from "yamljs"; // Import thư viện đọc file YAML

// 🎯 Đọc file YAML trực tiếp.
// Không dựa vào process.cwd() (có thể thay đổi tuỳ nơi chạy server);
// tìm file ở vài vị trí khả dĩ rồi lấy vị trí đầu tiên tồn tại.
const swaggerCandidates = [
    path.join(process.cwd(), "swagger.yaml"),
    path.join(__dirname, "swagger.yaml"),
    path.resolve(__dirname, "../swagger.yaml"),
];
const swaggerPath = swaggerCandidates.find((p) => fs.existsSync(p)) || swaggerCandidates[0];
const swaggerSpec = YAML.load(swaggerPath);

export const setupSwagger = (app: Express) => {
    // Log kiểm tra đường dẫn file để tránh lỗi "File not found"
    console.log(`Loading swagger from: ${swaggerPath}`);
    console.log(`Setting up Swagger UI at http://localhost:5000/api-docs`);
    
    // Đăng ký middleware Swagger
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};