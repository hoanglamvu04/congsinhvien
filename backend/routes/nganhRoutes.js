import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllNganh,
  createNganh,
  updateNganh,
  deleteNganh,
} from "../controllers/nganhController.js";

const router = express.Router();

router.get("/", verifyToken, getAllNganh);
router.post("/", verifyToken, isAdmin, createNganh);
router.put("/:ma_nganh", verifyToken, isAdmin, updateNganh);
router.delete("/:ma_nganh", verifyToken, isAdmin, deleteNganh);

export default router;
