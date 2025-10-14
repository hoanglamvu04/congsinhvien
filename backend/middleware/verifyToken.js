import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Thiếu token xác thực" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn toàn bộ payload vào request (gồm cả ma_sinh_vien, ma_giang_vien, role)
    req.user = decoded;

    console.log("🧩 Token hợp lệ:", decoded);
    next();
  } catch (error) {
    console.error("❌ verifyToken error:", error);
    return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
