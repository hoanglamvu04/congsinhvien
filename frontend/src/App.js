import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

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
import ThoiKhoaBieuManager from "./pages/admin/ThoiKhoaBieuManager";

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
function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Giải mã token để lấy tên phòng (nếu là nhân viên)
  let ten_phong = null;
  try {
    if (token) {
      const decoded = jwtDecode(token);
      ten_phong = decoded.ten_phong;
    }
  } catch (err) {
    console.error("❌ Lỗi giải mã token:", err);
  }

  return (
    <Router>
      <Routes>
        {/* ===== TRANG CHUNG ===== */}
        <Route path="/" element={token ? <Navigate to="/home" /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />

        {/* ===== GIAO DIỆN SINH VIÊN ===== */}
        <Route
          path="/sinhvien/*"
          element={
            role === "sinhvien" ? (
              <UserLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
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

        {/* ===== GIAO DIỆN GIẢNG VIÊN ===== */}
        <Route
          path="/giangvien/*"
          element={
            role === "giangvien" ? (
              <GiangVienLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<GiangVienDashboard />} />
          <Route path="thongtin" element={<ThongTinGiangVien />} />
          <Route path="lichday" element={<LichDayGiangVien />} />
          <Route path="lophocphan" element={<LopHocPhanGV />} />
          <Route path="lophocphan/:ma_lop_hp" element={<ChiTietLopHocPhan />} />
          <Route path="diemdanh" element={<DiemDanhGiangVien />} />
          <Route path="diem" element={<QuanLyDiemGV />} />
          <Route path="thongbao" element={<ThongBaoGiangVien />} />
        </Route>

        {/* ===== GIAO DIỆN PHÒNG ĐÀO TẠO ===== */}
        <Route
          path="/phongdaotao/*"
          element={
            role === "nhanvien" && ten_phong === "Phòng Đào Tạo" ? (
              <PDTLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
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
        </Route>

        {/* ===== GIAO DIỆN ADMIN ===== */}
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
          <Route path="sinhvien" element={<SinhVienManager />} />
          <Route path="thoi-khoa-bieu" element={<ThoiKhoaBieuManager />} />
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        limit={1}
        closeOnClick={false}
      />
    </Router>
  );
}

export default App;
