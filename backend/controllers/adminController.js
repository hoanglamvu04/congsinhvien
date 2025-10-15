import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { ghiLog } from "./lichSuHoatDongController.js";

const SALT_ROUNDS = 10;

// 🧩 Tạo tài khoản sinh viên hoặc giảng viên
export const createAccount = async (req, res) => {
  const { ten_dang_nhap, mat_khau, vai_tro } = req.body;
  try {
    const [exist] = await pool.query(
      "SELECT * FROM tai_khoan WHERE ten_dang_nhap = ?",
      [ten_dang_nhap]
    );
    if (exist.length > 0) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    const hash = await bcrypt.hash(mat_khau, SALT_ROUNDS);
    const [result] = await pool.query(
      `INSERT INTO tai_khoan 
        (ten_dang_nhap, mat_khau, vai_tro, trang_thai, ngay_tao, nguoi_tao) 
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [ten_dang_nhap, hash, vai_tro || "sinhvien", "hoatdong", req.user.id]
    );

    await ghiLog(
      req.user.id,
      `Tạo tài khoản mới (${vai_tro || "sinhvien"}): ${ten_dang_nhap}`,
      "tai_khoan",
      result.insertId
    );

    res.status(201).json({ message: "Tạo tài khoản thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi tạo tài khoản" });
  }
};

// 🧾 Lấy danh sách tài khoản (có thể lọc theo vai trò, từ khóa)
export const getAllAccounts = async (req, res) => {
  const { vai_tro, keyword } = req.query;
  try {
    let sql =
      "SELECT id_tai_khoan, ten_dang_nhap, vai_tro, trang_thai, ngay_tao FROM tai_khoan WHERE 1=1";
    const params = [];

    if (vai_tro) {
      sql += " AND vai_tro = ?";
      params.push(vai_tro);
    }
    if (keyword) {
      sql += " AND ten_dang_nhap LIKE ?";
      params.push(`%${keyword}%`);
    }

    sql += " ORDER BY ngay_tao DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách tài khoản" });
  }
};

// ✏️ Cập nhật thông tin tài khoản (vai trò, trạng thái)
export const updateAccount = async (req, res) => {
  const { id_tai_khoan } = req.params;
  const { vai_tro, trang_thai } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE tai_khoan SET vai_tro=?, trang_thai=? WHERE id_tai_khoan=?",
      [vai_tro, trang_thai, id_tai_khoan]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    await ghiLog(
      req.user.id,
      `Cập nhật tài khoản ID=${id_tai_khoan} (vai_tro=${vai_tro}, trang_thai=${trang_thai})`,
      "tai_khoan",
      id_tai_khoan
    );

    res.json({ message: "Cập nhật tài khoản thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi cập nhật tài khoản" });
  }
};

// 🔑 Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  const { id_tai_khoan } = req.params;
  const { mat_khau_moi } = req.body;
  try {
    const hash = await bcrypt.hash(mat_khau_moi, SALT_ROUNDS);
    const [result] = await pool.query(
      "UPDATE tai_khoan SET mat_khau=? WHERE id_tai_khoan=?",
      [hash, id_tai_khoan]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    await ghiLog(
      req.user.id,
      `Đặt lại mật khẩu cho tài khoản ID=${id_tai_khoan}`,
      "tai_khoan",
      id_tai_khoan
    );

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi đặt lại mật khẩu" });
  }
};

// 🗑️ Xóa tài khoản
export const deleteAccount = async (req, res) => {
  const { id_tai_khoan } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM tai_khoan WHERE id_tai_khoan = ?", [id_tai_khoan]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy tài khoản để xóa" });

    await ghiLog(req.user.id, `Xóa tài khoản ID=${id_tai_khoan}`, "tai_khoan", id_tai_khoan);

    res.json({ message: "Xóa tài khoản thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi xóa tài khoản" });
  }
};
