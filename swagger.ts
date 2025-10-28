// // src/swagger.ts
// //import swaggerJSDoc from "swagger-jsdoc";
// import swaggerUi from "swagger-ui-express";
// import { Express } from "express";

// const options: swaggerJSDoc.Options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "GenZStyle API",
//       version: "1.0.0",
//       description: "Tài liệu API cho dự án GenZStyle 🚀",
//     },
//     servers: [
//       {
//         url: "http://localhost:5000", // đổi port nếu bạn dùng port khác
//       },
//     ],
//   },
//   apis: ["./src/routes/*.ts"], // đường dẫn tới các file route có comment swagger
// };

// const swaggerSpec = swaggerJSDoc(options);

// export const setupSwagger = (app: Express) => {
//   app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// };
