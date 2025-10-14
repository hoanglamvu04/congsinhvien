import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllLop,
  createLop,
  updateLop,
  deleteLop,
} from "../controllers/lopController.js";

const router = express.Router();

router.get("/", verifyToken, getAllLop);
router.post("/", verifyToken, isAdmin, createLop);
router.put("/:ma_lop", verifyToken, isAdmin, updateLop);
router.delete("/:ma_lop", verifyToken, isAdmin, deleteLop);

export default router;
