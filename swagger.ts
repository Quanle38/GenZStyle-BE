import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { Express } from "express";
import path from "path";

// 💡 Lấy thư mục gốc (root directory) của dự án một cách đáng tin cậy.
// Ví dụ: /path/to/genzstyle-be
const rootPath = process.cwd(); 

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "GenZStyle API",
            version: "1.0.0",
            description: "Tài liệu API cho dự án GenZStyle",
        },
        servers: [{ url: "http://localhost:5000" }],
    },
    // 🎯 ĐỊNH NGHĨA ĐƯỜNG DẪN TÌM KIẾM CẢ .ts VÀ .js
    apis: [
        // 1. Dùng cho môi trường Development (ts-node)
        path.join(rootPath, "routes/**/*.ts"), 
        // 2. Dùng cho môi trường Production (sau khi build vào dist)
        path.join(rootPath, "dist/routes/**/*.js"), 
        
        // Thêm đường dẫn cho các file docs riêng (nếu có, ví dụ: file trong controller)
        // path.join(rootPath, "controllers/**/*.ts"),
    ], 
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
    // Thêm log để kiểm tra hàm này có được gọi hay không
    console.log(`Setting up Swagger UI at http://localhost:5000/api-docs`);
    
    // Đăng ký middleware Swagger
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};