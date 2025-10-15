import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AccountManager from "./pages/admin/AccountManager";
import KhoaManager from "./pages/admin/KhoaManager";
import NganhManager from "./pages/admin/NganhManager";
import LopManager from "./pages/admin/LopManager";
import GiangVienManager from "./pages/admin/GiangVienManager";
import HocKyManager from "./pages/admin/HocKyManager";
import MonHocManager from "./pages/admin/MonHocManager"
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

import SinhVienDangKy from "./pages/sinhvien/SinhVienDangKy";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Router>
      <Routes>
        {/* Trang thường */}
        <Route path="/" element={token ? <Navigate to="/home" /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sinhvien/dangky" element={<SinhVienDangKy />} />
        {/* Trang quản trị */}
        <Route
          path="/admin/*"
          element={
            role === "admin" ? (
              <AdminLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
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

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
