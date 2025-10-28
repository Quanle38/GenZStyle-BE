// controllers/product.controller.ts
import { Request, Response } from "express";
import baseModel from "../models/base.model";
import handleError from "../helpers/handleError.helper";
import addressTable from "../models/schema/userAddress.schema";
import { UserAddress } from "../types/tableType";
const addressController = {
    create: async (req: Request, res: Response) => {
        try {
            const address: Partial<UserAddress> = req.body;

            if (!address.full_address) {
                return handleError(res, 400, "Missing required fields");
            }
            const newAdressData = {
                ...address,
                is_deleted: false,
            };
            const createdAdress = await baseModel.create(addressTable.name, newAdressData)
            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: createdAdress,
            });
        } catch (error: any) {
            return handleError(res, 500, error);
        }
    },
};

export default addressController;
