import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";
import YAML from "yamljs"; // Import thư viện đọc file YAML

// 💡 Lấy thư mục gốc
const rootPath = process.cwd(); 

// 🎯 Đọc file YAML trực tiếp
// Đảm bảo file swagger.yaml nằm đúng ở thư mục gốc dự án
const swaggerPath = path.join(rootPath, "swagger.yaml");
const swaggerSpec = YAML.load(swaggerPath);

export const setupSwagger = (app: Express) => {
    // Log kiểm tra đường dẫn file để tránh lỗi "File not found"
    console.log(`Loading swagger from: ${swaggerPath}`);
    console.log(`Setting up Swagger UI at http://localhost:5000/api-docs`);
    
    // Đăng ký middleware Swagger
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};