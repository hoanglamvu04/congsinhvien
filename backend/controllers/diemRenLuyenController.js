import pool from "../config/db.js";

// 📘 Xem điểm rèn luyện (Sinh viên)
export const getDiemRenLuyen = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;
    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }

    const [rows] = await pool.query(`
      SELECT drl.*, hk.ten_hoc_ky
      FROM diem_ren_luyen drl
      JOIN hoc_ky hk ON drl.ma_hoc_ky = hk.ma_hoc_ky
      WHERE drl.ma_sinh_vien = ?
    `, [ma_sv]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy điểm rèn luyện" });
  }
};

// ➕ Cập nhật điểm rèn luyện (Cố vấn hoặc Admin)
export const upsertDiemRenLuyen = async (req, res) => {
  try {
    const {
      ma_sinh_vien,
      ma_hoc_ky,
      diem_tu_danh_gia,
      diem_co_van,
      diem_chung_ket,
      xep_loai
    } = req.body;

    await pool.query(`
      INSERT INTO diem_ren_luyen (ma_sinh_vien, ma_hoc_ky, diem_tu_danh_gia, diem_co_van, diem_chung_ket, xep_loai)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        diem_tu_danh_gia=VALUES(diem_tu_danh_gia),
        diem_co_van=VALUES(diem_co_van),
        diem_chung_ket=VALUES(diem_chung_ket),
        xep_loai=VALUES(xep_loai)
    `, [ma_sinh_vien, ma_hoc_ky, diem_tu_danh_gia, diem_co_van, diem_chung_ket, xep_loai]);

    res.json({ message: "Cập nhật điểm rèn luyện thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật điểm rèn luyện" });
  }
};
