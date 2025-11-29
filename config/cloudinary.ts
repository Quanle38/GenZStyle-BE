import { v2 as cloudinary } from 'cloudinary';
// hoặc const cloudinary = require('cloudinary').v2;

const cloud = cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Lấy từ .env
    api_key: process.env.CLOUDINARY_API_KEY,       // Lấy từ .env
    api_secret: process.env.CLOUDINARY_API_SECRET,   // Lấy từ .env
    secure: true // Đảm bảo URL được tạo là HTTPS
});
export default cloud;