import pool from "../config/db.js";

// 📘 Lấy danh sách giảng viên
export const getAllGiangVien = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT gv.*, k.ten_khoa 
      FROM giang_vien gv 
      LEFT JOIN khoa k ON gv.ma_khoa = k.ma_khoa
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách giảng viên" });
  }
};

// ➕ Thêm giảng viên
export const createGiangVien = async (req, res) => {
  try {
    const {
      ma_giang_vien,
      id_tai_khoan,
      ho_ten,
      hoc_vi,
      chuc_vu,
      ma_khoa,
      email,
      dien_thoai,
      anh_dai_dien
    } = req.body;

    await pool.query(
      `INSERT INTO giang_vien 
        (ma_giang_vien, id_tai_khoan, ho_ten, hoc_vi, chuc_vu, ma_khoa, email, dien_thoai, anh_dai_dien)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ma_giang_vien,
        id_tai_khoan || null,
        ho_ten,
        hoc_vi,
        chuc_vu,
        ma_khoa,
        email,
        dien_thoai,
        anh_dai_dien || null
      ]
    );

    res.status(201).json({ message: "Thêm giảng viên thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm giảng viên" });
  }
};

// ✏️ Cập nhật giảng viên
export const updateGiangVien = async (req, res) => {
  try {
    const { ma_giang_vien } = req.params;
    const {
      ho_ten,
      hoc_vi,
      chuc_vu,
      ma_khoa,
      email,
      dien_thoai,
      anh_dai_dien
    } = req.body;

    await pool.query(
      `UPDATE giang_vien 
       SET ho_ten=?, hoc_vi=?, chuc_vu=?, ma_khoa=?, email=?, dien_thoai=?, anh_dai_dien=? 
       WHERE ma_giang_vien=?`,
      [ho_ten, hoc_vi, chuc_vu, ma_khoa, email, dien_thoai, anh_dai_dien, ma_giang_vien]
    );

    res.json({ message: "Cập nhật giảng viên thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật giảng viên" });
  }
};

// 🗑️ Xóa giảng viên
export const deleteGiangVien = async (req, res) => {
  try {
    const { ma_giang_vien } = req.params;
    await pool.query("DELETE FROM giang_vien WHERE ma_giang_vien = ?", [ma_giang_vien]);
    res.json({ message: "Xóa giảng viên thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa giảng viên" });
  }
};
