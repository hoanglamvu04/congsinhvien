import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ghiLog } from "./lichSuHoatDongController.js";
dotenv.config();

const SALT_ROUNDS = 10;

// 🧩 Đăng ký tài khoản
export const register = async (req, res) => {
  const { ten_dang_nhap, mat_khau, vai_tro } = req.body; // 'admin', 'giangvien', 'sinhvien'
  try {
    // Kiểm tra tồn tại
    const [exist] = await pool.query(
      "SELECT * FROM tai_khoan WHERE ten_dang_nhap = ?",
      [ten_dang_nhap]
    );
    if (exist.length > 0) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hash = await bcrypt.hash(mat_khau, SALT_ROUNDS);

    // Tạo tài khoản
    const [result] = await pool.query(
      "INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai, ngay_tao) VALUES (?, ?, ?, ?, NOW())",
      [ten_dang_nhap, hash, vai_tro || "sinhvien", 1]
    );

    // 🧩 Ghi log hành động
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

// 🔐 Đăng nhập
export const login = async (req, res) => {
  const { ten_dang_nhap, mat_khau } = req.body;
  try {
    // Kiểm tra tài khoản tồn tại
    const [rows] = await pool.query(
      "SELECT * FROM tai_khoan WHERE ten_dang_nhap = ?",
      [ten_dang_nhap]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }

    const user = rows[0];

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // ✅ Nếu là sinh viên → lấy mã sinh viên
    let ma_sinh_vien = null;
    if (user.vai_tro === "sinhvien") {
      const [sv] = await pool.query(
        "SELECT ma_sinh_vien FROM sinh_vien WHERE id_tai_khoan = ?",
        [user.id_tai_khoan]
      );
      if (sv.length > 0) ma_sinh_vien = sv[0].ma_sinh_vien;
    }

    // ✅ Nếu là giảng viên → lấy mã giảng viên
    let ma_giang_vien = null;
    if (user.vai_tro === "giangvien") {
      const [gv] = await pool.query(
        "SELECT ma_giang_vien FROM giang_vien WHERE id_tai_khoan = ?",
        [user.id_tai_khoan]
      );
      if (gv.length > 0) ma_giang_vien = gv[0].ma_giang_vien;
    }

    // ✅ Tạo JWT chứa đầy đủ thông tin
    const token = jwt.sign(
      {
        id: user.id_tai_khoan,
        role: user.vai_tro,
        ma_sinh_vien,
        ma_giang_vien,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // 🧩 Ghi log đăng nhập
    await ghiLog(
      user.ten_dang_nhap,
      `Đăng nhập thành công (${user.vai_tro})`,
      "tai_khoan",
      user.id_tai_khoan
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      role: user.vai_tro,
      ma_sinh_vien,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi đăng nhập" });
  }
};
