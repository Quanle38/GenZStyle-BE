// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { authService } from "../services/auth.service";

const authController = {
  login: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    try {
      await uow.start();

      const result = await authService.login(uow, req.body);
      await uow.commit();

      return res.status(200).json({ message: "Login successfully", data: result });
    } catch (error: any) {
      await uow.rollback();
      return handleError(res, error.status || 500, error.message || error);
    }
  },

  register: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    try {
      await uow.start();

      const result = await authService.register(uow, req.body);
      await uow.commit();

      return res.status(201).json({ message: "Register successfully", data: result });
    } catch (error: any) {
      await uow.rollback();
      return handleError(res, error.status || 500, error.message || error);
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    try {
      await uow.start();

      const token = req.headers["authorization"]?.split(" ")[1];
      const result = await authService.refreshToken(uow, token!);
      await uow.commit();

      return res.status(200).json({ message: "Token refreshed successfully", data: result });
    } catch (error: any) {
      await uow.rollback();
      return handleError(res, error.status || 500, error.message || error);
    }
  },

  logout: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    try {
      await uow.start();

      const token = req.headers["authorization"]?.split(" ")[1];
      await authService.logout(uow, token!);
      await uow.commit();

      return res.status(200).json({ message: "Logout successfully" });
    } catch (error: any) {
      await uow.rollback();
      return handleError(res, error.status || 500, error.message || error);
    }
  },

  me: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      const result = await authService.me(uow, token!);
      return res.status(200).json({ message: "Fetch user successfully", data: { user: result } });
    } catch (error: any) {
      return handleError(res, error.status || 500, error.message || error);
    }
  },
};

export default authController;
