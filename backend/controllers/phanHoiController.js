import pool from "../config/db.js";

// 📘 Gửi phản hồi
export const guiPhanHoi = async (req, res) => {
  try {
    const { nguoi_nhan, chu_de, noi_dung } = req.body;
    const ma_sinh_vien = req.user.ma_sinh_vien;

    await pool.query(`
      INSERT INTO phan_hoi (ma_sinh_vien, nguoi_nhan, chu_de, noi_dung)
      VALUES (?, ?, ?, ?)
    `, [ma_sinh_vien, nguoi_nhan, chu_de, noi_dung]);

    res.status(201).json({ message: "Phản hồi đã được gửi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi gửi phản hồi" });
  }
};

// 📘 Admin hoặc giảng viên trả lời phản hồi
export const traLoiPhanHoi = async (req, res) => {
  try {
    const { id_phan_hoi, phan_hoi_tu_nguoi_nhan } = req.body;

    await pool.query(`
      UPDATE phan_hoi
      SET phan_hoi_tu_nguoi_nhan = ?, trang_thai = 'dagiaiquyet', ngay_phan_hoi = NOW()
      WHERE id_phan_hoi = ?
    `, [phan_hoi_tu_nguoi_nhan, id_phan_hoi]);

    res.json({ message: "Trả lời phản hồi thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi trả lời phản hồi" });
  }
};
