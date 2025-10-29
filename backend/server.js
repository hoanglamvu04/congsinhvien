import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import path from "path";
import pool from "./config/db.js";

// 📦 Import các routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import khoaRoutes from "./routes/khoaRoutes.js";
import nganhRoutes from "./routes/nganhRoutes.js";
import lopRoutes from "./routes/lopRoutes.js";
import giangVienRoutes from "./routes/giangVienRoutes.js";
import monHocRoutes from "./routes/monHocRoutes.js";
import khoaHocHocKyRoutes from "./routes/khoaHocHocKyRoutes.js";
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
import diemDanhRoutes from "./routes/diemDanhRoutes.js";
import buoiHocRoutes from "./routes/buoiHocRoutes.js";

// 🧠 Import Socket Handler
import { initSocket } from "./socket/socketHandler.js";

const app = express();
app.use(cors());
app.use(express.json());

// 🖼️ Static
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/khoa", khoaRoutes);
app.use("/api/nganh", nganhRoutes);
app.use("/api/lop", lopRoutes);
app.use("/api/giangvien", giangVienRoutes);
app.use("/api/monhoc", monHocRoutes);
app.use("/api/khoahoc-hocky", khoaHocHocKyRoutes);
app.use("/api/lophocphan", lopHocPhanRoutes);
app.use("/api/sinhvien", sinhVienRoutes);
app.use("/api/dangky", dangKyMonRoutes);
app.use("/api/thoi-khoa-bieu", thoiKhoaBieuRoutes);
app.use("/api/diem", diemRoutes);
app.use("/api/thilai", thiLaiRoutes);
app.use("/api/diemrenluyen", diemRenLuyenRoutes);
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
app.use("/api/diemdanh", diemDanhRoutes);
app.use("/api/buoihoc", buoiHocRoutes);

// ⚡ Tạo server & gắn socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 🔥 Khởi tạo Socket Handler
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server + Socket running on port ${PORT}`));
