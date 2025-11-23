// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./setupAxios";
import ProtectedRoute from "./components/ProtectedRoute";

/* ===== CHUNG ===== */
import Login from "./pages/Login";
import Home from "./pages/Home";
/* ===== ADMIN IMPORTS ===== */
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AccountManager from "./pages/admin/AccountManager";
import KhoaManager from "./pages/admin/KhoaManager";
import NganhManager from "./pages/admin/NganhManager";
import LopManager from "./pages/admin/LopManager";
import GiangVienManager from "./pages/admin/GiangVienManager";
import HocKyManager from "./pages/admin/HocKyManager";
import MonHocManager from "./pages/admin/MonHocManager";
import LopHocPhanManager from "./pages/admin/LopHocPhanManager";
import AdminQuanLyDangKy from "./pages/admin/AdminQuanLyDangKy";
import DiemManager from "./pages/admin/DiemManager";
import ThiLaiManager from "./pages/admin/ThiLaiManager";
import DiemRenLuyenManager from "./pages/admin/DiemRenLuyenManager";
import HocPhiManager from "./pages/admin/HocPhiManager";
import GiaoDichManager from "./pages/admin/GiaoDichManager";
import KhenThuongManager from "./pages/admin/KhenThuongManager";
import KyLuatManager from "./pages/admin/KyLuatManager";
import KhaoSatManager from "./pages/admin/KhaoSatManager";
import PhieuTraLoiManager from "./pages/admin/PhieuTraLoiManager";
import PhanHoiManager from "./pages/admin/PhanHoiManager";
import TinNhanManager from "./pages/admin/TinNhanManager";
import ThongBaoManager from "./pages/admin/ThongBaoManager";
import LichSuHoatDongManager from "./pages/admin/LichSuHoatDongManager";
import SinhVienManager from "./pages/admin/SinhVienManager";
import SinhVienDetail from "./pages/admin/SinhVienDetail";
import ThoiKhoaBieuManager from "./pages/admin/ThoiKhoaBieuManager";
import ThongKeHocPhiManager from "./pages/admin/ThongKeHocPhiManager";
/* ===== SINH VIÊN IMPORTS ===== */
import UserLayout from "./layouts/UserLayout";
import HomeSinhVien from "./pages/sinhvien/HomeSinhVien";
import ThongTinCaNhan from "./pages/sinhvien/ThongTinCaNhan";
import LichHoc from "./pages/sinhvien/LichHoc";
import KetQuaHocTap from "./pages/sinhvien/KetQuaHocTap";
import HuongDan from "./pages/sinhvien/HuongDan";
import SinhVienDangKy from "./pages/sinhvien/SinhVienDangKy";
import HocPhi from "./pages/sinhvien/HocPhi";
import ThongBao from "./pages/sinhvien/ThongBao";
import TinNhan from "./pages/sinhvien/TinNhan";
import PhanHoi from "./pages/sinhvien/PhanHoi";
import KhaoSat from "./pages/sinhvien/KhaoSat";
import KhenThuong from "./pages/sinhvien/KhenThuong";
import KyLuat from "./pages/sinhvien/KyLuat";
import DiemRenLuyen from "./pages/sinhvien/DiemRenLuyen";

/* ===== GIẢNG VIÊN IMPORTS ===== */
import GiangVienLayout from "./pages/giangvien/GiangVienLayout";
import GiangVienDashboard from "./pages/giangvien/GiangVienDashboard";
import ThongTinGiangVien from "./pages/giangvien/ThongTinGiangVien";
import LichDayGiangVien from "./pages/giangvien/LichDayGiangVien";
import ChiTietLopHocPhan from "./pages/giangvien/ChiTietLopHocPhan";
import LopHocPhanGV from "./pages/giangvien/LopHocPhanGV";
import DiemDanhGiangVien from "./pages/giangvien/DiemDanhGiangVien";
import QuanLyDiemGV from "./pages/giangvien/QuanLyDiemGV";
import ThongBaoGiangVien from "./pages/giangvien/ThongBaoGiangVien";

/* ===== PHÒNG ĐÀO TẠO IMPORT ===== */
import PDTLayout from "./pages/phongdaotao/PDTLayout";
import PDTDashboard from "./pages/phongdaotao/PDTDashboard";
import PDTHocKyManager from "./pages/phongdaotao/PDTHocKyManager";
import PDTMonHocManager from "./pages/phongdaotao/PDTMonHocManager";
import PDTLopHocPhanManager from "./pages/phongdaotao/PDTLopHocPhanManager";
import PDTQuanLyDangKy from "./pages/phongdaotao/PDTQuanLyDangKy";
import PDTThoiKhoaBieuManager from "./pages/phongdaotao/PDTThoiKhoaBieuManager";
import PDTThiLaiManager from "./pages/phongdaotao/PDTThiLaiManager";
import PDTKhenThuongManager from "./pages/phongdaotao/PDTKhenThuongManager";
import PDTKyLuatManager from "./pages/phongdaotao/PDTKyLuatManager";
import PDTDiemRenLuyen from "./pages/phongdaotao/PDTDiemRenLuyen";
import DuyetDiem from "./pages/phongdaotao/DuyetDiem";
import ThongBaoHocVu from "./pages/phongdaotao/ThongBaoHocVu";
import PhanHoiPDT from "./pages/phongdaotao/PDTPhanHoi";

import KhoaLayout from "./pages/khoa/KhoaLayout";
import KhoaDashboard from "./pages/khoa/KhoaDashboard";
import GiangVienKhoa from "./pages/khoa/GiangVienKhoa";
import MonHocKhoa from "./pages/khoa/MonHocKhoa";
import LopHocPhanKhoa from "./pages/khoa/LopHocPhanKhoa";
import SinhVienKhoa from "./pages/khoa/SinhVienKhoa";
import DiemKhoa from "./pages/khoa/DiemKhoa";
import KhaoSatKhoa from "./pages/khoa/KhaoSatKhoa";
import PhanHoiKhoa from "./pages/khoa/PhanHoiKhoa";
import ThongBaoKhoa from "./pages/khoa/ThongBaoKhoa";

function App() {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // 🚫 tránh refresh chồng

  const logoutUser = () => {
    console.log("🚪 Logout user do token hết hạn hoặc lỗi.");
    axios.post("/api/auth/logout", {}, { withCredentials: true }).catch(() => { });
    clearTimeout(refreshTimer);
    setUser(null);
    localStorage.clear();
    window.location.href = "/login";
  };

  // 🔁 Hàm gọi refresh token
  const refreshAccessToken = async () => {
    if (isRefreshing) return; // ✅ chặn gọi nhiều lần song song
    setIsRefreshing(true);
    try {
      const res = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
      console.log("🔁 Token được làm mới:", res.data.message);

      // Sau khi refresh thành công → đặt lại hẹn giờ
      scheduleTokenRefresh();
    } catch (err) {
      console.warn("❌ Refresh token lỗi hoặc hết hạn:", err.response?.data?.message);
      logoutUser();
    } finally {
      setIsRefreshing(false);
    }
  };

  // 📅 Đặt lịch refresh token tự động
  const scheduleTokenRefresh = () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((r) => r.startsWith("token="))
        ?.split("=")[1];
      if (!token) return;

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const expTime = decoded.exp * 1000;
      const now = Date.now();
      const timeLeft = expTime - now;

      // Làm mới trước khi hết hạn 1 phút
      const refreshIn = Math.max(timeLeft - 60 * 1000, 10000); // ít nhất 10s
      console.log(`🕓 Token sẽ tự refresh sau ${Math.floor(refreshIn / 1000)} giây`);

      clearTimeout(refreshTimer);
      const timer = setTimeout(refreshAccessToken, refreshIn);
      setRefreshTimer(timer);
    } catch (err) {
      console.error("⚠️ Lỗi khi tính thời gian refresh:", err);
    }
  };

  // 🧩 Lấy user khi mở app
  useEffect(() => {
    axios
      .get("/api/auth/me", { withCredentials: true })
      .then((res) => {
        console.log("✅ User:", res.data.user);
        setUser(res.data.user);
        scheduleTokenRefresh();
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    // Dọn dẹp timer khi unmount
    return () => clearTimeout(refreshTimer);
  }, []);

  if (loading || user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }


  return (
    <Router>

      <Routes>
        {/* ====== TRANG CHUNG ====== */}

        <Route path="/login" element={<Login />} />
        <Route
          element={<ProtectedRoute user={user} allowedRoles={[]} />}
        >
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomeSinhVien />} />
          </Route>
        </Route>
        {/* ====== SINH VIÊN ====== */}
        <Route
          element={<ProtectedRoute user={user} allowedRoles={["sinhvien"]} />}
        >
          <Route path="/sinhvien/*" element={<UserLayout />}>
            <Route index element={<HomeSinhVien />} />
            <Route path="thongtin" element={<ThongTinCaNhan />} />
            <Route path="lichhoc" element={<LichHoc />} />
            <Route path="ketqua" element={<KetQuaHocTap />} />
            <Route path="huongdan" element={<HuongDan />} />
            <Route path="dangky" element={<SinhVienDangKy />} />
            <Route path="hocphi" element={<HocPhi />} />
            <Route path="thongbao" element={<ThongBao />} />
            <Route path="tinnhan/:id?" element={<TinNhan />} />
            <Route path="phanhoi" element={<PhanHoi />} />
            <Route path="khaosat" element={<KhaoSat />} />
            <Route path="khenthuong" element={<KhenThuong />} />
            <Route path="kyluat" element={<KyLuat />} />
            <Route path="diemrenluyen" element={<DiemRenLuyen />} />
          </Route>
        </Route>

        {/* ====== GIẢNG VIÊN ====== */}
        <Route
          element={<ProtectedRoute user={user} allowedRoles={["giangvien"]} />}
        >
          <Route path="/giangvien/*" element={<GiangVienLayout />}>
            <Route index element={<GiangVienDashboard />} />
            <Route path="thongtin" element={<ThongTinGiangVien />} />
            <Route path="lichday" element={<LichDayGiangVien />} />
            <Route path="lophocphan" element={<LopHocPhanGV />} />
            <Route path="lophocphan/:ma_lop_hp" element={<ChiTietLopHocPhan />} />
            <Route path="diemdanh" element={<DiemDanhGiangVien />} />
            <Route path="diem" element={<QuanLyDiemGV />} />
            <Route path="thongbao" element={<ThongBaoGiangVien />} />
          </Route>
        </Route>

        {/* ====== PHÒNG ĐÀO TẠO ====== */}
        <Route
          element={
            <ProtectedRoute
              user={user}
              allowedRoles={["admin", "nhanvien"]}
              requiredPhong={user?.role === "nhanvien" ? "Phòng Đào Tạo" : null}
            />
          }
        >
          <Route path="/phongdaotao/*" element={<PDTLayout />}>
            <Route index element={<PDTDashboard />} />
            <Route path="hocky" element={<PDTHocKyManager />} />
            <Route path="monhoc" element={<PDTMonHocManager />} />
            <Route path="lophocphan" element={<PDTLopHocPhanManager />} />
            <Route path="dangky" element={<PDTQuanLyDangKy />} />
            <Route path="thoi-khoa-bieu" element={<PDTThoiKhoaBieuManager />} />
            <Route path="thilai" element={<PDTThiLaiManager />} />
            <Route path="khenthuong" element={<PDTKhenThuongManager />} />
            <Route path="kyluat" element={<PDTKyLuatManager />} />
            <Route path="duyetdiem" element={<DuyetDiem />} />
            <Route path="diemrenluyen" element={<PDTDiemRenLuyen />} />
            <Route path="thongbao" element={<ThongBaoHocVu />} />
            <Route path="phanhoi" element={<PhanHoiPDT />} />
          </Route>
        </Route>

        {/* ====== ADMIN ====== */}
        <Route element={<ProtectedRoute user={user} allowedRoles={["admin"]} />}>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="accounts" element={<AccountManager />} />
            <Route path="khoa" element={<KhoaManager />} />
            <Route path="nganh" element={<NganhManager />} />
            <Route path="lop" element={<LopManager />} />
            <Route path="giangvien" element={<GiangVienManager />} />
            <Route path="hocky" element={<HocKyManager />} />
            <Route path="monhoc" element={<MonHocManager />} />
            <Route path="lophocphan" element={<LopHocPhanManager />} />
            <Route path="dangky" element={<AdminQuanLyDangKy />} />
            <Route path="diem" element={<DiemManager />} />
            <Route path="thilai" element={<ThiLaiManager />} />
            <Route path="diemrenluyen" element={<DiemRenLuyenManager />} />
            <Route path="hocphi" element={<HocPhiManager />} />
            <Route path="giaodich" element={<GiaoDichManager />} />
            <Route path="khenthuong" element={<KhenThuongManager />} />
            <Route path="kyluat" element={<KyLuatManager />} />
            <Route path="khaosat" element={<KhaoSatManager />} />
            <Route path="phieutraloi" element={<PhieuTraLoiManager />} />
            <Route path="phanhoi" element={<PhanHoiManager />} />
            <Route path="tinnhan" element={<TinNhanManager />} />
            <Route path="thongbao" element={<ThongBaoManager />} />
            <Route path="lichsuhoatdong" element={<LichSuHoatDongManager />} />
            <Route path="sinhvien" element={<SinhVienManager />} />
            <Route path="sinhvien/:id" element={<SinhVienDetail />} />
            <Route path="thoi-khoa-bieu" element={<ThoiKhoaBieuManager />} />
            <Route path="thongkehocphi" element={<ThongKeHocPhiManager />} />
          </Route>
        </Route>
        {/* ====== KHOA ====== */}
        <Route
          element={<ProtectedRoute user={user} allowedRoles={["khoa", "admin"]} />}
        >
          <Route path="/khoa/*" element={<KhoaLayout />}>
            <Route index element={<KhoaDashboard />} />
            <Route path="giangvien" element={<GiangVienKhoa />} />
            <Route path="monhoc" element={<MonHocKhoa />} />
            <Route path="lophocphan" element={<LopHocPhanKhoa />} />
            <Route path="sinhvien" element={<SinhVienKhoa />} />
            <Route path="diem" element={<DiemKhoa />} />
            <Route path="khaosat" element={<KhaoSatKhoa />} />
            <Route path="phanhoi" element={<PhanHoiKhoa />} />
            <Route path="thongbao" element={<ThongBaoKhoa />} />
          </Route>
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={2500} limit={1} />
    </Router>
  );
}

export default App;
