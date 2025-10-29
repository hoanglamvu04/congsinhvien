// middleware/roleCheck.js

// 🧠 Kiểm tra quyền Admin
export const isAdmin = (req, res, next) => {
  console.log("📋 Kiểm tra vai trò:", req.user);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "❌ Chỉ admin mới được phép truy cập" });
  }
  console.log("🧩 Đã vào isAdmin");
  next();
};

// 👨‍🏫 Kiểm tra quyền Giảng viên
export const isGiangVien = (req, res, next) => {
  console.log("📋 Kiểm tra vai trò:", req.user);
  if (req.user.role !== "giangvien") {
    return res.status(403).json({ message: "❌ Chỉ giảng viên mới được phép truy cập" });
  }
  console.log("🧩 Đã vào isGiangVien");
  next();
};

// 🎓 Kiểm tra quyền Sinh viên
export const isSinhVien = (req, res, next) => {
  console.log("📋 Kiểm tra vai trò:", req.user);
  if (req.user.role !== "sinhvien") {
    return res.status(403).json({ message: "❌ Chỉ sinh viên mới được phép truy cập" });
  }
  console.log("🧩 Đã vào isSinhVien");
  next();
};

// 🏛️ Kiểm tra quyền Nhân viên Phòng Đào Tạo
export const isNhanVienPhongDaoTao = (req, res, next) => {
  console.log("📋 Kiểm tra phòng:", req.user);
  if (req.user.role === "nhanvien" && req.user.ten_phong === "Phòng Đào Tạo") {
    console.log("🧩 Đã vào isNhanVienPhongDaoTao");
    return next();
  }
  return res.status(403).json({ message: "❌ Chỉ nhân viên Phòng Đào Tạo mới được phép truy cập" });
};

// 🔐 Cho phép cả Admin và Phòng Đào Tạo
export const isPDTOrAdmin = (req, res, next) => {
  if (req.user.role === "admin" || (req.user.role === "nhanvien" && req.user.ten_phong === "Phòng Đào Tạo")) {
    console.log("🧩 Đã vào isPDTOrAdmin");
    return next();
  }
  return res.status(403).json({ message: "❌ Không có quyền truy cập" });
};
