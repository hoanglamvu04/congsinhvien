import pool from "../config/db.js";

// 📘 Lấy danh sách kỷ luật theo sinh viên
export const getKyLuatBySinhVien = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;

    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }

    const [rows] = await pool.query(`
      SELECT * FROM ky_luat
      WHERE ma_sinh_vien = ?
    `, [ma_sv]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách kỷ luật" });
  }
};

// ➕ Thêm kỷ luật (Admin)
export const createKyLuat = async (req, res) => {
  try {
    const { ma_sinh_vien, ngay_quyet_dinh, hinh_thuc, ly_do, nguoi_ra_quyet_dinh } = req.body;

    await pool.query(`
      INSERT INTO ky_luat (ma_sinh_vien, ngay_quyet_dinh, hinh_thuc, ly_do, nguoi_ra_quyet_dinh)
      VALUES (?, ?, ?, ?, ?)
    `, [ma_sinh_vien, ngay_quyet_dinh, hinh_thuc, ly_do, nguoi_ra_quyet_dinh]);

    res.status(201).json({ message: "Thêm kỷ luật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi thêm kỷ luật" });
  }
};

// 🗑️ Xóa kỷ luật (Admin)
export const deleteKyLuat = async (req, res) => {
  try {
    const { id_ky_luat } = req.params;
    await pool.query("DELETE FROM ky_luat WHERE id_ky_luat = ?", [id_ky_luat]);
    res.json({ message: "Xóa kỷ luật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi xóa kỷ luật" });
  }
};
