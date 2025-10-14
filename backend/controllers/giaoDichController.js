import pool from "../config/db.js";

// 📘 Xem lịch sử giao dịch của sinh viên
export const getGiaoDichBySinhVien = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;

    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }

    const [rows] = await pool.query(`
      SELECT gd.*, hp.ma_hoc_ky
      FROM giao_dich gd
      JOIN hoc_phi hp ON gd.id_hoc_phi = hp.id_hoc_phi
      WHERE hp.ma_sinh_vien = ?
    `, [ma_sv]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách giao dịch" });
  }
};

// ➕ Tạo giao dịch mới (Sinh viên nộp học phí)
export const createGiaoDich = async (req, res) => {
  try {
    const { id_hoc_phi, so_tien, phuong_thuc } = req.body;

    await pool.query(`
      INSERT INTO giao_dich (id_hoc_phi, ngay_giao_dich, so_tien, phuong_thuc, trang_thai)
      VALUES (?, NOW(), ?, ?, 'cho_duyet')
    `, [id_hoc_phi, so_tien, phuong_thuc]);

    res.status(201).json({ message: "Tạo giao dịch thành công, đang chờ duyệt" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi tạo giao dịch" });
  }
};

// ✅ Duyệt giao dịch (Admin)
export const duyetGiaoDich = async (req, res) => {
  try {
    const { id_giao_dich, trang_thai } = req.body; // da_duyet hoặc huy

    await pool.query(
      "UPDATE giao_dich SET trang_thai = ? WHERE id_giao_dich = ?",
      [trang_thai, id_giao_dich]
    );

    res.json({ message: "Cập nhật trạng thái giao dịch thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi duyệt giao dịch" });
  }
};
