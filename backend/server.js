import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import khoaRoutes from "./routes/khoaRoutes.js";
import nganhRoutes from "./routes/nganhRoutes.js";
import lopRoutes from "./routes/lopRoutes.js";
import giangVienRoutes from "./routes/giangVienRoutes.js";
import monHocRoutes from "./routes/monHocRoutes.js";
import hocKyRoutes from "./routes/hocKyRoutes.js";
import lopHocPhanRoutes from "./routes/lopHocPhanRoutes.js";
import sinhVienRoutes from "./routes/sinhVienRoutes.js";
import dangKyMonRoutes from "./routes/dangKyMonRoutes.js";
import thoiKhoaBieuRoutes from "./routes/thoiKhoaBieuRoutes.js";
import diemRoutes from "./routes/diemRoutes.js";
import thiLaiRoutes from "./routes/thiLaiRoutes.js";
import diemRenLuyenRoutes from "./routes/diemRenLuyenRoutes.js";
import hocPhiRoutes from "./routes/hocPhiRoutes.js";
import giaoDichRoutes from "./routes/giaoDichRoutes.js";
import hocBongRoutes from "./routes/hocBongRoutes.js";
import khenThuongRoutes from "./routes/khenThuongRoutes.js";
import kyLuatRoutes from "./routes/kyLuatRoutes.js";
import khaoSatRoutes from "./routes/khaoSatRoutes.js";
import phieuTraLoiRoutes from "./routes/phieuTraLoiRoutes.js";
import phanHoiRoutes from "./routes/phanHoiRoutes.js";
import tinNhanRoutes from "./routes/tinNhanRoutes.js";
import thongBaoRoutes from "./routes/thongBaoRoutes.js";
import lichSuHoatDongRoutes from "./routes/lichSuHoatDongRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Route test DB
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ message: "Database connected!", result: rows[0].result });
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ⚡ Routes chính
app.use("/api/auth", authRoutes);
app.use("/api/sinhvien", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/khoa", khoaRoutes);
app.use("/api/nganh", nganhRoutes);
app.use("/api/lop", lopRoutes);
app.use("/api/giangvien", giangVienRoutes);
app.use("/api/monhoc", monHocRoutes);
app.use("/api/hocky", hocKyRoutes);
app.use("/api/lophocphan", lopHocPhanRoutes);
app.use("/api/sinhvien", sinhVienRoutes);
app.use("/api/dangky", dangKyMonRoutes);
app.use("/api/thoi-khoa-bieu", thoiKhoaBieuRoutes);
app.use("/api/diem", diemRoutes);
app.use("/api/thilai", thiLaiRoutes);
app.use("/api/diemrenluyen", diemRenLuyenRoutes)
app.use("/api/hocphi", hocPhiRoutes);
app.use("/api/giaodich", giaoDichRoutes);
app.use("/api/hocbong", hocBongRoutes);
app.use("/api/khenthuong", khenThuongRoutes);
app.use("/api/kyluat", kyLuatRoutes);
app.use("/api/khaosat", khaoSatRoutes);
app.use("/api/phieutraloi", phieuTraLoiRoutes);
app.use("/api/phanhoi", phanHoiRoutes);
app.use("/api/tinnhan", tinNhanRoutes);
app.use("/api/thongbao", thongBaoRoutes);
app.use("/api/lichsuhoatdong", lichSuHoatDongRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
