import { Response } from "express";

const handleResponse = (
    res: Response,
    statusCode: number = 500,
    data: any
) => {
    return res.status(statusCode).json(data);
};

export default handleResponse;
