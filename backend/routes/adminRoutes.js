import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { createAccount, getAllStudents } from "../controllers/adminController.js";

const router = express.Router();

// chỉ admin mới được truy cập
router.post("/create-account", verifyToken, isAdmin, createAccount);
router.get("/students", verifyToken, isAdmin, getAllStudents);

export default router;
