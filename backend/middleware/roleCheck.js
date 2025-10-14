export const isAdmin = (req, res, next) => {
  console.log("📋 Kiểm tra vai trò:", req.user);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới được phép truy cập" });
  }
  next();
};
console.log("🧩 Đã vào isAdmin");
