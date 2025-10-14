import pool from "../config/db.js";

// 📘 Gửi tin nhắn
export const guiTinNhan = async (req, res) => {
  try {
    const { nguoi_nhan, noi_dung, tep_dinh_kem } = req.body;
    const nguoi_gui = req.user.ten_dang_nhap;

    await pool.query(`
      INSERT INTO tin_nhan (nguoi_gui, nguoi_nhan, noi_dung, tep_dinh_kem)
      VALUES (?, ?, ?, ?)
    `, [nguoi_gui, nguoi_nhan, noi_dung, tep_dinh_kem]);

    res.status(201).json({ message: "Gửi tin nhắn thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi gửi tin nhắn" });
  }
};

// 📘 Lấy danh sách tin nhắn giữa 2 người
export const getTinNhan = async (req, res) => {
  try {
    const { nguoi_nhan } = req.params;
    const nguoi_gui = req.user.ten_dang_nhap;

    const [rows] = await pool.query(`
      SELECT * FROM tin_nhan
      WHERE (nguoi_gui = ? AND nguoi_nhan = ?) OR (nguoi_gui = ? AND nguoi_nhan = ?)
      ORDER BY thoi_gian_gui ASC
    `, [nguoi_gui, nguoi_nhan, nguoi_nhan, nguoi_gui]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn" });
  }
};
