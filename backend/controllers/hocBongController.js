import pool from "../config/db.js";

// 📘 Xem học bổng theo sinh viên
export const getHocBongBySinhVien = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;
    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }

    const [rows] = await pool.query(`
      SELECT hb.*, hk.ten_hoc_ky, k.ten_khoa
      FROM hoc_bong hb
      JOIN hoc_ky hk ON hb.ma_hoc_ky = hk.ma_hoc_ky
      JOIN khoa k ON hb.ma_khoa = k.ma_khoa
      WHERE hb.ma_sinh_vien = ?
    `, [ma_sv]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách học bổng" });
  }
};

// ➕ Thêm học bổng (Admin)
export const createHocBong = async (req, res) => {
  try {
    const { ma_sinh_vien, ma_hoc_ky, ma_khoa, ten_hoc_bong, so_tien, ngay_cap } = req.body;

    await pool.query(`
      INSERT INTO hoc_bong (ma_sinh_vien, ma_hoc_ky, ma_khoa, ten_hoc_bong, so_tien, ngay_cap)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [ma_sinh_vien, ma_hoc_ky, ma_khoa, ten_hoc_bong, so_tien, ngay_cap]);

    res.status(201).json({ message: "Thêm học bổng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi thêm học bổng" });
  }
};
    