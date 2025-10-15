import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  createAccount,
  getAllAccounts,
  updateAccount,
  resetPassword,
  deleteAccount,
} from "../controllers/adminController.js";

const router = express.Router();

// 🔐 Chỉ Admin được truy cập
router.post("/create-account", verifyToken, isAdmin, createAccount);
router.get("/accounts", verifyToken, isAdmin, getAllAccounts);
router.put("/accounts/:id_tai_khoan", verifyToken, isAdmin, updateAccount);
router.put("/accounts/:id_tai_khoan/reset-password", verifyToken, isAdmin, resetPassword);
router.delete("/accounts/:id_tai_khoan", verifyToken, isAdmin, deleteAccount);

export default router;
