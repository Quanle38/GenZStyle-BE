import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { LoginRequestBody } from "../dtos/auth/request/login.request";
import { RegisterRequestBody } from "../dtos/auth/request/register.request";
import { generateRefreshToken, generateToken, verifyToken } from "../helpers/jwt.helper";
import { hashPassword, verifyPassword } from "../helpers/password.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { User } from "../models";

const ATTRIBUTES_TO_EXCLUDE = ['password', 'refresh_token', 'is_deleted'];

const authController = {
  /**
   * POST /auth/login - Đăng nhập
   */
  login: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    
    try {
      await uow.start();

      const body = req.body as LoginRequestBody;
      
      if (!body.email || !body.password) {
        await uow.rollback();
        return handleError(res, 400, "Email and password are required");
      }

      // Tìm user theo email
      const user = await uow.users.findByEmail(body.email);

      if (!user) {
        await uow.rollback();
        return handleError(res, 404, "User not found");
      }

      // Verify password (hỗ trợ plaintext -> tự động migrate sang bcrypt)
      const { ok, needsRehash } = await verifyPassword(body.password, user.password);

      if (!ok) {
        await uow.rollback();
        return handleError(res, 401, "Invalid credentials");
      }

      // Nếu password trong DB là plaintext, hash và update
      if (needsRehash) {
        try {
          const newHashed = await hashPassword(body.password);
          await uow.users.updatePassword(user.id, newHashed);
        } catch (err) {
          console.warn("Failed to re-hash & update password:", err);
          // không block login nếu update thất bại
        }
      }

      // Generate tokens
      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Lưu refresh token vào DB
      await uow.users.updateRefreshToken(user.id, refreshToken);

      await uow.commit();

      // Loại bỏ các trường nhạy cảm
      const userJson = user.toJSON();
      const { password, refresh_token, is_deleted, ...rest } = userJson;

      return res.status(200).json({
        message: "Login successfully",
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: rest
        }
      });
    } catch (error: any) {
      await uow.rollback();
      return handleError(res, 500, error);
    }
  },

  /**
   * POST /auth/refresh - Làm mới access token
   */
  refreshToken: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    
    try {
      await uow.start();

      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        await uow.rollback();
        return handleError(res, 401, "Header Authorization không hợp lệ hoặc thiếu Token");
      }
      
      const token = authHeader.split(" ")[1];

      // Verify token signature & expiry
      let payload;
      try {
        payload = verifyToken(token);
      } catch (err) {
        await uow.rollback();
        return handleError(res, 401, "Invalid or expired refresh token");
      }

      // Tìm user theo refresh token (đảm bảo token chưa bị rotate)
      const user = await uow.users.findByRefreshToken(token);

      if (!user) {
        await uow.rollback();
        return handleError(res, 404, "User not found or refresh token revoked");
      }

      // Token rotation: tạo mới refresh token và access token
      const newRefreshToken = generateRefreshToken(user);
      const newAccessToken = generateToken(user);

      // Lưu refresh token mới
      await uow.users.updateRefreshToken(user.id, newRefreshToken);

      await uow.commit();

      return res.status(200).json({
        message: "Token refreshed successfully",
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken
        }
      });
    } catch (error: any) {
      await uow.rollback();
      return handleError(res, 500, error);
    }
  },

  /**
   * POST /auth/logout - Đăng xuất
   */
  logout: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    
    try {
      await uow.start();

      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        await uow.rollback();
        return handleError(res, 401, "Header Authorization không hợp lệ hoặc thiếu Token");
      }
      
      const token = authHeader.split(" ")[1];

      // Tìm user theo refresh token
      const user = await uow.users.findByRefreshToken(token);

      if (!user) {
        await uow.rollback();
        // Idempotent response - vẫn trả về success kể cả không tìm thấy user
        return res.status(200).json({ message: "Logout successfully" });
      }

      // Xóa refresh token (set null)
      await uow.users.updateRefreshToken(user.id, null);

      await uow.commit();

      return res.status(200).json({
        message: "Logout successfully"
      });
    } catch (error: any) {
      await uow.rollback();
      return handleError(res, 500, error);
    }
  },

  /**
   * POST /auth/register - Đăng ký tài khoản mới
   */
  register: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    
    try {
      await uow.start();

      const body = req.body as RegisterRequestBody;

      // Validate required fields
      if (!body.email || !body.password || !body.first_name || !body.last_name) {
        await uow.rollback();
        return handleError(res, 400, "Missing required fields");
      }

      // Kiểm tra email đã tồn tại chưa
      const existedUser = await uow.users.findByEmail(body.email);

      if (existedUser) {
        await uow.rollback();
        return handleError(res, 400, "Email already registered");
      }

      // Hash password
      const hashedPassword = await hashPassword(body.password);

      // Tạo user mới
      const newUserData: Partial<User> = {
        email: body.email,
        password: hashedPassword,
        first_name: body.first_name,
        last_name: body.last_name,
        dob: body.birthday ? new Date(body.birthday) : new Date(),
        gender: body.gender || 'other',
        phone_number: body.phone_number || '',
        role: "USER",
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const newUser = await uow.users.create(newUserData);

      // Generate tokens
      const accessToken = generateToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      // Lưu refresh token
      await uow.users.updateRefreshToken(newUser.id, refreshToken);

      await uow.commit();

      // Loại bỏ các trường nhạy cảm
      const userJson = newUser.toJSON();
      const { password, refresh_token, is_deleted, ...safeUser } = userJson;

      return res.status(201).json({
        message: "Register successfully",
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: safeUser,
        },
      });
    } catch (error: any) {
      await uow.rollback();
      console.error("Register error:", error);
      return handleError(res, 500, error);
    }
  },

  /**
   * GET /auth/me - Lấy thông tin user hiện tại
   */
  me: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return handleError(res, 401, "Header Authorization không hợp lệ hoặc thiếu Token");
      }
      
      const token = authHeader.split(" ")[1];
      
      // Verify và decode token
      let userDecode;
      try {
        userDecode = verifyToken(token);
      } catch (err) {
        return handleError(res, 401, "Invalid or expired token");
      }

      // Tìm user theo ID từ token
      if(userDecode === null) {
       return handleError(res, 401, "Invalid or expired token");
      }
      const user = await uow.users.findById(userDecode.user_id);
      
      if (!user) {
        return handleError(res, 404, "User not found");
      }

      // Loại bỏ các trường nhạy cảm
      const userJson = user.toJSON();
      const { password, refresh_token, is_deleted, ...rest } = userJson;

      return res.status(200).json({
        message: "Fetch user successfully",
        data: {
          user: rest
        }
      });
    } catch (error: any) {
      console.error("Fetch me error:", error);
      return handleError(res, 500, error);
    }
  },
};

export default authController;