// config/connection.ts
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Kết nối để test ngay khi load module
pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL");
    client.release(); // trả connection về pool
  })
  .catch(err => {
    console.error("❌ Database connection error:", err);
  });

export default pool;
