// src/middlewares/errorHandler.ts

import { AppError } from "../errors/AppError.ts";

import type { Request, Response, NextFunction } from "express";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof AppError) {
        console.error(`[ErrorHandler] ${err.code}: ${err.message}`);
        res.status(err.statusCode).json({ code: err.code, message: err.message });
    } else {
        console.error(`[ErrorHandler] ${err.name}: ${err.message}`);
        res.status(500).json({ code: "INTERNAL_ERROR", message: "伺服器錯誤" });
    }
}