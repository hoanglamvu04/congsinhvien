import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { 
  getMyDiem , 
  upsertDiem, 
  getAllDiem, 
  deleteDiem 
} from "../controllers/diemController.js";

const router = express.Router();

router.get("/me", verifyToken, getMyDiem);
router.get("/all", verifyToken, isAdmin, getAllDiem);
router.post("/", verifyToken, isAdmin, upsertDiem);
router.delete("/:id_diem", verifyToken, isAdmin, deleteDiem);

export default router;
