import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ghiLog } from "./lichSuHoatDongController.js";
dotenv.config();

const SALT_ROUNDS = 10;

// ⏱️ Thời hạn token
const ACCESS_EXPIRE = "3h";   // ⬅️ Access Token: 3 tiếng
const REFRESH_EXPIRE = "7d";  // Refresh Token: 7 ngày

// 🔐 Hàm tạo Access và Refresh Token
const generateTokens = (user, rememberMe) => {
  const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRE,
  });

  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: rememberMe ? REFRESH_EXPIRE : "1d",
  });

  return { accessToken, refreshToken };
};

// 🧩 Đăng ký tài khoản
export const register = async (req, res) => {
  const { ten_dang_nhap, mat_khau, vai_tro } = req.body;
  try {
    const [exist] = await pool.query(
      "SELECT * FROM tai_khoan WHERE ten_dang_nhap = ?",
      [ten_dang_nhap]
    );
    if (exist.length > 0)
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });

    const hash = await bcrypt.hash(mat_khau, SALT_ROUNDS);

    const [result] = await pool.query(
      "INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai, ngay_tao) VALUES (?, ?, ?, ?, NOW())",
      [ten_dang_nhap, hash, vai_tro || "sinhvien", 1]
    );

    await ghiLog(
      ten_dang_nhap,
      `Đăng ký tài khoản mới (${vai_tro || "sinhvien"})`,
      "tai_khoan",
      result.insertId
    );

    res.status(201).json({ message: "Tạo tài khoản thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi tạo tài khoản" });
  }
};

// 🔑 Đăng nhập
export const login = async (req, res) => {
  const { ten_dang_nhap, mat_khau, role: selectedRole, rememberMe } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM tai_khoan WHERE ten_dang_nhap = ?",
      [ten_dang_nhap]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: "Tài khoản không tồn tại" });

    const user = rows[0];

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

    // 🛑 Kiểm tra vai trò FE chọn có đúng vai trò thật hay không
    if (selectedRole && selectedRole !== user.vai_tro) {
      return res.status(400).json({
        message: `Tài khoản này thuộc vai trò "${user.vai_tro}", không phải "${selectedRole}". Vui lòng chọn lại vai trò đúng.`,
      });
    }

    // 🔍 Lấy thêm thông tin tùy vai trò
    let ma_sinh_vien = null,
      ma_giang_vien = null,
      ma_phong = null,
      ten_phong = null,
      ho_ten = null;   // 👈 BẮT BUỘC CÓ

    if (user.vai_tro === "sinhvien") {
      const [sv] = await pool.query(
        "SELECT ma_sinh_vien, ho_ten FROM sinh_vien WHERE id_tai_khoan = ?",
        [user.id_tai_khoan]
      );
      if (sv.length > 0) {
        ma_sinh_vien = sv[0].ma_sinh_vien;
        ho_ten = sv[0].ho_ten;   // 👈 giờ mới không lỗi
      }
    }


    if (user.vai_tro === "giangvien") {
      const [gv] = await pool.query(
        "SELECT ma_giang_vien FROM giang_vien WHERE id_tai_khoan = ?",
        [user.id_tai_khoan]
      );
      if (gv.length > 0) ma_giang_vien = gv[0].ma_giang_vien;
    }

    if (user.vai_tro === "nhanvien") {
      const [nv] = await pool.query(
        `SELECT nv.ma_phong, pb.ten_phong
         FROM nhan_vien nv
         LEFT JOIN phong_ban pb ON nv.ma_phong = pb.ma_phong
         WHERE nv.ma_tai_khoan = ?`,
        [user.id_tai_khoan]
      );

      if (nv.length > 0) {
        ma_phong = nv[0].ma_phong;
        ten_phong = nv[0].ten_phong;
      }
    }

    const payload = {
      id: user.id_tai_khoan,
      role: user.vai_tro,
      ma_sinh_vien,
      ma_giang_vien,
      ma_phong,
      ten_phong,
      ho_ten
    };

    // Tạo tokens
    const { accessToken, refreshToken } = generateTokens(payload, rememberMe);

    // Lưu cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    // Ghi log
    await ghiLog(user.ten_dang_nhap, `Đăng nhập (${user.vai_tro})`, "tai_khoan", user.id_tai_khoan);

    res.json({ message: "Đăng nhập thành công", user: payload });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi đăng nhập" });
  }
};

// 🔁 Làm mới token (Refresh)
export const refreshToken = async (req, res) => {
  try {
    const refresh = req.cookies.refreshToken;
    if (!refresh) return res.status(401).json({ message: "Không có refresh token" });

    const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(decoded, process.env.JWT_SECRET, {
      expiresIn: ACCESS_EXPIRE, // ⬅️ vẫn 3 giờ
    });

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3 * 60 * 60 * 1000, // ⬅️ 3 giờ (ms)
      // secure: true,
    });

    res.json({ message: "Đã cấp token mới" });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(401).json({ message: "REFRESH_TOKEN_INVALID" });
  }
};

// 🚪 Đăng xuất
export const logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.json({ message: "Đã đăng xuất" });
};

// 👤 Lấy thông tin người dùng hiện tại
export const getCurrentUser = (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ message: "TOKEN_INVALID" });
  }
};
