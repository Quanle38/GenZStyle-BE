import { Response } from "express";

const handleError = (
  res: Response,
  statusCode = 500,
  error: string
) => {
  return res.status(statusCode).json({
    message: error,
    data: null
  });
};

export default handleError;
