import pool from "../config/db.js";

// 📘 Lấy danh sách khen thưởng theo sinh viên
export const getKhenThuongBySinhVien = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;

    // Admin có thể xem theo query
    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }

    const [rows] = await pool.query(`
      SELECT kt.*, k.ten_khoa
      FROM khen_thuong kt
      LEFT JOIN khoa k ON kt.ma_khoa = k.ma_khoa
      WHERE kt.ma_sinh_vien = ?
    `, [ma_sv]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách khen thưởng" });
  }
};

// ➕ Thêm khen thưởng (Admin)
export const createKhenThuong = async (req, res) => {
  try {
    const { ma_sinh_vien, ma_khoa, ngay_khen_thuong, noi_dung, so_tien } = req.body;

    await pool.query(`
      INSERT INTO khen_thuong (ma_sinh_vien, ma_khoa, ngay_khen_thuong, noi_dung, so_tien)
      VALUES (?, ?, ?, ?, ?)
    `, [ma_sinh_vien, ma_khoa, ngay_khen_thuong, noi_dung, so_tien]);

    res.status(201).json({ message: "Thêm khen thưởng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi thêm khen thưởng" });
  }
};

// 🗑️ Xóa khen thưởng (Admin)
export const deleteKhenThuong = async (req, res) => {
  try {
    const { id_khen_thuong } = req.params;
    await pool.query("DELETE FROM khen_thuong WHERE id_khen_thuong = ?", [id_khen_thuong]);
    res.json({ message: "Xóa khen thưởng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi xóa khen thưởng" });
  }
};
