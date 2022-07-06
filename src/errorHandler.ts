import type {Request, Response, NextFunction} from "express";

export default function (error: any, req: Request, res: Response, next: NextFunction) {
    res.status(error.status ?? 500).json({
        message: error.message ?? "An error occurred",
        ...error.data,
    });
}
