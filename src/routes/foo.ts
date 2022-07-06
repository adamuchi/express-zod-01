import { Router } from "express";
import type { Request, Response } from "express";
const router = Router();
router.get("/pong", (req: Request, res: Response) => {
    res.send("PONG!");
});
export default router;