import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/**
 * ✅ Middleware xác thực token từ cookie HTTP-only
 */
export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.token; // 🔥 lấy từ cookie thay vì header

    if (!token) {
      return res.status(401).json({ message: "Thiếu token xác thực" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn payload user vào req
    req.user = decoded;
    // console.log("✅ Token hợp lệ:", decoded);

    next();
  } catch (error) {
    console.error("❌ verifyToken error:", error.message);
    return res
      .status(403)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
