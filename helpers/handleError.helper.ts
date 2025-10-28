import { Response } from "express";

const handleError = (
    res: Response,
    statusCode: number = 500,
    error: any | string
) => {
    return res.status(statusCode).json({
        success: false,
        error: error?.message || error || "internal server error"
    });
};

export default handleError;
