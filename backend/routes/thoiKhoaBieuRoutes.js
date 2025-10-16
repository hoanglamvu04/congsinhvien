import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllTkb,
  createTkb,
  updateTkb,
  deleteTkb,
  getTkbBySinhVien,
} from "../controllers/thoiKhoaBieuController.js";

const router = express.Router();

router.get("/", verifyToken, getAllTkb);
router.get("/me", verifyToken, getTkbBySinhVien);
router.post("/", verifyToken, isAdmin, createTkb);
router.put("/:id_tkb", verifyToken, isAdmin, updateTkb);
router.delete("/:id_tkb", verifyToken, isAdmin, deleteTkb);

export default router;
