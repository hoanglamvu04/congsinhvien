import pool from "../config/db.js";

// 📘 Admin xem toàn bộ danh sách thi lại
export const getAllThiLai = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tl.*, sv.ho_ten AS ten_sinh_vien, sv.ma_sinh_vien,
             mh.ten_mon, lhp.ma_lop_hp
      FROM thi_lai tl
      JOIN sinh_vien sv ON tl.ma_sinh_vien = sv.ma_sinh_vien
      JOIN lop_hoc_phan lhp ON tl.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      ORDER BY tl.ngay_thi_lai DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllThiLai]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách thi lại" });
  }
};

// 📘 Lấy danh sách thi lại theo sinh viên
export const getThiLaiBySinhVien = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;
    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }

    const [rows] = await pool.query(`
      SELECT tl.*, mh.ten_mon, lhp.ma_lop_hp
      FROM thi_lai tl
      JOIN lop_hoc_phan lhp ON tl.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      WHERE tl.ma_sinh_vien = ?
      ORDER BY tl.ngay_thi_lai DESC
    `, [ma_sv]);

    res.json(rows);
  } catch (error) {
    console.error("[getThiLaiBySinhVien]", error);
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
    console.error("[createThiLai]", error);
    res.status(500).json({ error: "Lỗi khi thêm điểm thi lại" });
  }
};

// ✏️ Cập nhật điểm thi lại
export const updateThiLai = async (req, res) => {
  try {
    const { id_thi_lai } = req.params;
    const {
      diem_thi_lai,
      ngay_thi_lai,
      le_phi_thi_lai,
      duoc_cap_nhat
    } = req.body;

    await pool.query(`
      UPDATE thi_lai
      SET diem_thi_lai=?, ngay_thi_lai=?, le_phi_thi_lai=?, duoc_cap_nhat=?
      WHERE id_thi_lai=?
    `, [diem_thi_lai, ngay_thi_lai, le_phi_thi_lai, duoc_cap_nhat, id_thi_lai]);

    res.json({ message: "Cập nhật điểm thi lại thành công" });
  } catch (error) {
    console.error("[updateThiLai]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật điểm thi lại" });
  }
};

// 🗑️ Xóa điểm thi lại
export const deleteThiLai = async (req, res) => {
  try {
    const { id_thi_lai } = req.params;
    await pool.query("DELETE FROM thi_lai WHERE id_thi_lai = ?", [id_thi_lai]);
    res.json({ message: "Xóa điểm thi lại thành công" });
  } catch (error) {
    console.error("[deleteThiLai]", error);
    res.status(500).json({ error: "Lỗi khi xóa điểm thi lại" });
  }
};
