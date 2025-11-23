import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllLop,
  createLop,
  updateLop,
  getLopTheoKhoa,
  deleteLop,
  getLopTheoNganh,
} from "../controllers/lopController.js";

const router = express.Router();

router.get("/", verifyToken, getAllLop);
router.get("/by-khoa/:ma_khoa", verifyToken, getLopTheoKhoa);
router.get("/by-nganh/:ma_nganh", verifyToken, getLopTheoNganh);
router.post("/", verifyToken, isAdmin, createLop);
router.put("/:ma_lop", verifyToken, isAdmin, updateLop);
router.delete("/:ma_lop", verifyToken, isAdmin, deleteLop);

export default router;
