import pool from "../config/db.js";

// 📘 Lấy danh sách sinh viên (Admin hoặc Giảng viên có thể xem toàn bộ)
export const getAllSinhVien = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sv.*, l.ten_lop, n.ten_nganh, k.ten_khoa 
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.ma_lop = l.ma_lop
      LEFT JOIN nganh n ON sv.ma_nganh = n.ma_nganh
      LEFT JOIN khoa k ON sv.ma_khoa = k.ma_khoa
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách sinh viên" });
  }
};
// 📘 Lấy thông tin sinh viên theo tài khoản đăng nhập
export const getSinhVienByToken = async (req, res) => {
  try {
    const userId = req.user.id; // id_tai_khoan được gắn sẵn trong verifyToken
    const [rows] = await pool.query(
      `
      SELECT sv.*, l.ten_lop, n.ten_nganh, k.ten_khoa
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.ma_lop = l.ma_lop
      LEFT JOIN nganh n ON sv.ma_nganh = n.ma_nganh
      LEFT JOIN khoa k ON sv.ma_khoa = k.ma_khoa
      WHERE sv.id_tai_khoan = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông tin sinh viên." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin sinh viên:", error);
    res.status(500).json({ error: "Lỗi khi lấy thông tin sinh viên." });
  }
};

// ➕ Thêm sinh viên (Admin)
export const createSinhVien = async (req, res) => {
  try {
    const {
      ma_sinh_vien,
      id_tai_khoan,
      ho_ten,
      ngay_sinh,
      gioi_tinh,
      ma_lop,
      ma_nganh,
      ma_khoa,
      dia_chi,
      dien_thoai,
      email,
      trang_thai_hoc_tap,
    } = req.body;

    await pool.query(
      `INSERT INTO sinh_vien 
      (ma_sinh_vien, id_tai_khoan, ho_ten, ngay_sinh, gioi_tinh, ma_lop, ma_nganh, ma_khoa, dia_chi, dien_thoai, email, trang_thai_hoc_tap)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ma_sinh_vien,
        id_tai_khoan || null,
        ho_ten,
        ngay_sinh,
        gioi_tinh,
        ma_lop,
        ma_nganh,
        ma_khoa,
        dia_chi || null,
        dien_thoai || null,
        email || null,
        trang_thai_hoc_tap || "danghoc",
      ]
    );

    res.status(201).json({ message: "Thêm sinh viên thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm sinh viên" });
  }
};

// ✏️ Cập nhật sinh viên
export const updateSinhVien = async (req, res) => {
  try {
    const { ma_sinh_vien } = req.params;
    const {
      ho_ten,
      ngay_sinh,
      gioi_tinh,
      ma_lop,
      ma_nganh,
      ma_khoa,
      dia_chi,
      dien_thoai,
      email,
      trang_thai_hoc_tap,
    } = req.body;

    await pool.query(
      `UPDATE sinh_vien 
       SET ho_ten=?, ngay_sinh=?, gioi_tinh=?, ma_lop=?, ma_nganh=?, ma_khoa=?, dia_chi=?, dien_thoai=?, email=?, trang_thai_hoc_tap=?
       WHERE ma_sinh_vien=?`,
      [
        ho_ten,
        ngay_sinh,
        gioi_tinh,
        ma_lop,
        ma_nganh,
        ma_khoa,
        dia_chi,
        dien_thoai,
        email,
        trang_thai_hoc_tap,
        ma_sinh_vien,
      ]
    );

    res.json({ message: "Cập nhật sinh viên thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật sinh viên" });
  }
};

// 🗑️ Xóa sinh viên
export const deleteSinhVien = async (req, res) => {
  try {
    const { ma_sinh_vien } = req.params;
    await pool.query("DELETE FROM sinh_vien WHERE ma_sinh_vien = ?", [ma_sinh_vien]);
    res.json({ message: "Xóa sinh viên thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa sinh viên" });
  }
};
