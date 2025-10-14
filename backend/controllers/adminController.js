import pool from "../config/db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// 🧩 Tạo tài khoản sinh viên hoặc giảng viên
export const createAccount = async (req, res) => {
  const { ten_dang_nhap, mat_khau, vai_tro } = req.body;
  try {
    const [exist] = await pool.query("SELECT * FROM tai_khoan WHERE ten_dang_nhap = ?", [ten_dang_nhap]);
    if (exist.length > 0) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    const hash = await bcrypt.hash(mat_khau, SALT_ROUNDS);
    await pool.query(
      "INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai, ngay_tao, nguoi_tao) VALUES (?, ?, ?, ?, NOW(), ?)",
      [ten_dang_nhap, hash, vai_tro || "sinhvien", "hoatdong", req.user.id]
    );

    res.status(201).json({ message: "Tạo tài khoản thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi tạo tài khoản" });
  }
};

// 🧾 Lấy danh sách sinh viên
export const getAllStudents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_tai_khoan, ten_dang_nhap, vai_tro, trang_thai, ngay_tao FROM tai_khoan WHERE vai_tro = 'sinhvien'"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách sinh viên" });
  }
};
console.log("🧩 Đã vào createAccount");
