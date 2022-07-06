import { Router } from "express";
import type { Request, Response } from "express";
import typedHandler from "../typedHandler";
import {Auth} from '../auth';
import z from "zod";

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
    res.json({body: req.body});
});

router.get("/error", (req: Request, res: Response) => {
    throw { status: 400, message: "testing stuff", data: { path: req.path }};
});

router.post("/testing", typedHandler({
    auth: [Auth.ADMIN, Auth.SYSTEM],
    log: false,
    inputSchema: z.object({ name: z.string() }).strict(),
    outputSchema: z.object({ key: z.string() }),
    handler: async(input: {name: string}) => {
        return { key: "sdfsdf" };
    }
}));

const sleepMs = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

router.post("/mutating", typedHandler({
    auth: [Auth.ADMIN, Auth.SYSTEM],
    idempotent: true,
    inputSchema: z.object({ name: z.string() }).strict(),
    outputSchema: z.object({ token: z.string() }),
    handler: async(input: {name: string}) => {
        await sleepMs(250);
        return { token: generateToken() };
    }
}));


import fooRoutes from './foo';
import { generateToken } from "../utils";
router.use("/foo", fooRoutes);

export default router;
