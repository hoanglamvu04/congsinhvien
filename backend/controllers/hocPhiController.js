import pool from "../config/db.js";

// 📘 Xem học phí (Sinh viên hoặc Admin)
export const getHocPhiBySinhVien = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;

    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }

    const [rows] = await pool.query(`
      SELECT hp.*, hk.ten_hoc_ky
      FROM hoc_phi hp
      JOIN hoc_ky hk ON hp.ma_hoc_ky = hk.ma_hoc_ky
      WHERE hp.ma_sinh_vien = ?
    `, [ma_sv]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy thông tin học phí" });
  }
};

// ➕ Tạo / cập nhật học phí (Admin)
export const upsertHocPhi = async (req, res) => {
  try {
    const { ma_sinh_vien, ma_hoc_ky, tong_tien_phai_nop, tong_tien_da_nop, con_no, trang_thai } = req.body;

    await pool.query(`
      INSERT INTO hoc_phi (ma_sinh_vien, ma_hoc_ky, tong_tien_phai_nop, tong_tien_da_nop, con_no, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tong_tien_phai_nop = VALUES(tong_tien_phai_nop),
        tong_tien_da_nop = VALUES(tong_tien_da_nop),
        con_no = VALUES(con_no),
        trang_thai = VALUES(trang_thai)
    `, [ma_sinh_vien, ma_hoc_ky, tong_tien_phai_nop, tong_tien_da_nop, con_no, trang_thai]);

    res.json({ message: "Cập nhật học phí thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi cập nhật học phí" });
  }
};
