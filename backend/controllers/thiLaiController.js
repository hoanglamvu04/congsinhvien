import pool from "../config/db.js";

// 📘 Lấy danh sách thi lại theo sinh viên
export const getThiLaiBySinhVien = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;
    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }

    const [rows] = await pool.query(`
      SELECT tl.*, mh.ten_mon
      FROM thi_lai tl
      JOIN lop_hoc_phan lhp ON tl.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      WHERE tl.ma_sinh_vien = ?
    `, [ma_sv]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách thi lại" });
  }
};

// ➕ Ghi điểm thi lại (Giảng viên hoặc Admin)
export const createThiLai = async (req, res) => {
  try {
    const {
      ma_sinh_vien,
      ma_lop_hp,
      diem_thi_lai,
      ngay_thi_lai,
      le_phi_thi_lai,
      duoc_cap_nhat
    } = req.body;

    await pool.query(`
      INSERT INTO thi_lai (ma_sinh_vien, ma_lop_hp, diem_thi_lai, ngay_thi_lai, le_phi_thi_lai, duoc_cap_nhat)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [ma_sinh_vien, ma_lop_hp, diem_thi_lai, ngay_thi_lai, le_phi_thi_lai, duoc_cap_nhat || 0]);

    res.status(201).json({ message: "Thêm điểm thi lại thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm điểm thi lại" });
  }
};
