import { Response } from "express";

const handleError = (
    res: Response,
    statusCode: number = 500,
    error: any
) => {
    return res.status(statusCode).json({
        success: false,
        error: error?.message || "internal server error"
    });
};

export default handleError;
