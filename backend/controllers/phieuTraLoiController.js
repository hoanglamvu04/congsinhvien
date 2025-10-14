import pool from "../config/db.js";

// 📘 Sinh viên trả lời khảo sát
export const traLoiKhaoSat = async (req, res) => {
  try {
    const { id_khao_sat, diem_danh_gia, noi_dung_phan_hoi, an_danh } = req.body;
    const ma_sinh_vien = req.user.ma_sinh_vien;

    await pool.query(`
      INSERT INTO phieu_tra_loi (id_khao_sat, ma_sinh_vien, diem_danh_gia, noi_dung_phan_hoi, an_danh)
      VALUES (?, ?, ?, ?, ?)
    `, [id_khao_sat, ma_sinh_vien, diem_danh_gia, noi_dung_phan_hoi, an_danh]);

    res.status(201).json({ message: "Gửi phản hồi khảo sát thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi gửi phản hồi" });
  }
};

// 📘 Admin xem kết quả khảo sát
export const getKetQuaKhaoSat = async (req, res) => {
  try {
    const { id_khao_sat } = req.params;
    const [rows] = await pool.query(`
      SELECT p.*, s.ho_ten
      FROM phieu_tra_loi p
      JOIN sinh_vien s ON p.ma_sinh_vien = s.ma_sinh_vien
      WHERE id_khao_sat = ?
    `, [id_khao_sat]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy kết quả khảo sát" });
  }
};
