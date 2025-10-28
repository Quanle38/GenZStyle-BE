// controllers/auth.controller.ts
import { Request, Response } from "express";
import baseModel from "../models/base.model";
import handleError from "../helpers/handleError.helper";
import { LoginRequestBody } from "../dtos/auth/request/login.request";
import userTable from "../models/schema/user.schema";
import { generateRefreshToken, generateToken, verifyToken } from "../helpers/jwt.helper";
import { User } from "../types/tableType";
import { hashPassword, verifyPassword } from "../helpers/password.helper";

const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const body = req.body as LoginRequestBody;
      if (!body.email || !body.password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user: User | null = await baseModel.findOneWithCondition(
        "Users",
        { email: body.email },
        ["*"]
      );

      if (!user) {
        return handleError(res, 404, "User not found");
      }

      // verify password (supports plaintext in DB -> migrate to bcrypt automatically)
      const { ok, needsRehash } = await verifyPassword(body.password, (user as any).password);

      if (!ok) {
        return handleError(res, 401, "Invalid credentials");
      }

      // If DB stored plaintext and matched, hash & update DB to store hashed password
      if (needsRehash) {
        try {
          const newHashed = await hashPassword(body.password);
          await baseModel.update(
            userTable.name,
            [userTable.columns.password],
            [newHashed],
            userTable.columns.id,
            (user as any).id
          );
          // update local user object so we don't accidentally send old password
          (user as any).password = newHashed;
        } catch (err) {
          console.warn("Failed to re-hash & update password:", err);
          // không block login nếu update thất bại, chỉ log
        }
      }

      // Generate tokens
      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Persist refresh token (rotate)
      await baseModel.update(
        userTable.name,
        [userTable.columns.refresh_token],
        [refreshToken],
        userTable.columns.id,
        (user as any).id
      );

      // strip sensitive fields
      const { password, refresh_token, is_deleted, ...rest } = user as any;

      return res.status(200).json({
        message: "Login successfully",
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: rest
        }
      });
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "Header Authorization không hợp lệ hoặc thiếu Token"
        });
      }
      const token = authHeader.split(" ")[1];

      // verify signature & expiry
      let payload;
      try {
        payload = verifyToken(token);
      } catch (err) {
        return handleError(res, 401, "Invalid or expired refresh token");
      }

      // find user by refresh token (ensure token hasn't been rotated away)
      const user: User | null = await baseModel.findOneWithCondition(
        "Users",
        { refresh_token: token },
        ["*"]
      );

      if (!user) {
        return handleError(res, 404, "User not found or refresh token revoked");
      }

      // rotation: generate new refresh token and access token
      const newRefreshToken = generateRefreshToken(user);
      const newAccessToken = generateToken(user);

      // persist new refresh token
      await baseModel.update(
        userTable.name,
        [userTable.columns.refresh_token],
        [newRefreshToken],
        userTable.columns.id,
        (user as any).id
      );

      return res.status(200).json({
        message: "Token refreshed successfully",
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken
        }
      });
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "Header Authorization không hợp lệ hoặc thiếu Token"
        });
      }
      const token = authHeader.split(" ")[1];

      // find user by refresh token (if token invalid/expired, user can still be logged out by clearing DB)
      const user: User | null = await baseModel.findOneWithCondition(
        "Users",
        { refresh_token: token },
        ["*"]
      );

      if (!user) {
        // If no user found, still respond 200 for idempotency (or 404 if you prefer)
        return res.status(200).json({ message: "Logout successfully" });
      }

      // clear refresh token (set to null)
      await baseModel.update(
        userTable.name,
        [userTable.columns.refresh_token],
        [null],
        userTable.columns.id,
        (user as any).id
      );

      return res.status(200).json({
        message: "Logout successfully"
      });
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  }
};

export default authController;
