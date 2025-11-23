// middleware/roleCheck.js
import jwt from "jsonwebtoken";

// 🧠 Kiểm tra quyền Admin
export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "❌ Chỉ quản trị viên mới được phép truy cập" });
};

// 👨‍🏫 Kiểm tra quyền Giảng viên
export const isGiangVien = (req, res, next) => {
  if (req.user?.role === "giangvien") return next();
  return res.status(403).json({ message: "❌ Chỉ giảng viên mới được phép truy cập" });
};

// 🎓 Kiểm tra quyền Sinh viên
export const isSinhVien = (req, res, next) => {
  if (req.user?.role === "sinhvien") return next();
  return res.status(403).json({ message: "❌ Chỉ sinh viên mới được phép truy cập" });
};

// 🏛️ Kiểm tra quyền Nhân viên Phòng Đào Tạo
export const isNhanVienPhongDaoTao = (req, res, next) => {
  if (req.user?.role === "nhanvien" && req.user?.ten_phong === "Phòng Đào Tạo") {
    return next();
  }
  return res.status(403).json({ message: "❌ Chỉ nhân viên Phòng Đào Tạo mới được phép truy cập" });
};

// 🔐 Cho phép cả Admin và Phòng Đào Tạo
export const isPDTOrAdmin = (req, res, next) => {
  const user = req.user;
  if (
    user?.role === "admin" ||
    (user?.role === "nhanvien" && user?.ten_phong === "Phòng Đào Tạo")
  ) {
    return next();
  }
  return res.status(403).json({ message: "❌ Không có quyền truy cập" });
};

// 🧩 Middleware lọc dữ liệu theo phòng ban
export const filterByDepartment = (req, res, next) => {
  try {
    const user = req.user;

    // 🛡️ Nếu là admin hoặc Phòng Đào Tạo => không giới hạn
    if (
      user?.role === "admin" ||
      (user?.role === "nhanvien" && user?.ten_phong === "Phòng Đào Tạo")
    ) {
      req.filter = { all: true }; // Có thể dùng ở controller để check
      return next();
    }

    // 🏢 Nếu là nhân viên thuộc phòng khác
    if (user?.role === "nhanvien" && user?.ma_phong) {
      req.filter = { ma_phong: user.ma_phong };
      return next();
    }

    // 👨‍🏫 Nếu là giảng viên => có thể lọc theo khoa (nếu có)
    if (user?.role === "giangvien" && user?.ma_phong) {
      req.filter = { ma_phong: user.ma_phong };
      return next();
    }

    // 🎓 Nếu là sinh viên => có thể gắn mã lớp/khoa để lọc
    if (user?.role === "sinhvien" && user?.ma_sinh_vien) {
      req.filter = { ma_sinh_vien: user.ma_sinh_vien };
      return next();
    }

    // ❌ Nếu không có gì phù hợp
    return res.status(403).json({ message: "Không xác định được phạm vi truy cập" });
  } catch (err) {
    console.error("FilterByDepartment error:", err);
    return res.status(500).json({ message: "Lỗi khi xác định phòng ban" });
  }
};
