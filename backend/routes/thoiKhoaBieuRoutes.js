import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { getThoiKhoaBieu, createTkb } from "../controllers/thoiKhoaBieuController.js";

const router = express.Router();

router.get("/", verifyToken, getThoiKhoaBieu);
router.post("/", verifyToken, isAdmin, createTkb);

export default router;
