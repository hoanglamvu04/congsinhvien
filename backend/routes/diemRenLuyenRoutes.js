import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { getDiemRenLuyen, upsertDiemRenLuyen } from "../controllers/diemRenLuyenController.js";

const router = express.Router();

router.get("/", verifyToken, getDiemRenLuyen);
router.post("/", verifyToken, isAdmin, upsertDiemRenLuyen);

export default router;
