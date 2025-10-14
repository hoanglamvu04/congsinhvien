import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllHocKy,
  createHocKy,
  updateHocKy,
  deleteHocKy
} from "../controllers/hocKyController.js";

const router = express.Router();

router.get("/", verifyToken, getAllHocKy);
router.post("/", verifyToken, isAdmin, createHocKy);
router.put("/:ma_hoc_ky", verifyToken, isAdmin, updateHocKy);
router.delete("/:ma_hoc_ky", verifyToken, isAdmin, deleteHocKy);

export default router;
