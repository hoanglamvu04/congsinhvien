import pool from "../config/db.js";

// 📘 Lấy danh sách môn học
export const getAllMonHoc = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT mh.*, k.ten_khoa 
      FROM mon_hoc mh 
      LEFT JOIN khoa k ON mh.ma_khoa = k.ma_khoa
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách môn học" });
  }
};

// ➕ Thêm môn học
export const createMonHoc = async (req, res) => {
  try {
    const {
      ma_mon,
      ten_mon,
      ma_khoa,
      loai_mon,
      so_tin_chi,
      don_gia_tin_chi,
      hoc_phan_tien_quyet,
      chi_nganh,
      mo_ta
    } = req.body;

    await pool.query(
      `INSERT INTO mon_hoc 
        (ma_mon, ten_mon, ma_khoa, loai_mon, so_tin_chi, don_gia_tin_chi, hoc_phan_tien_quyet, chi_nganh, mo_ta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ma_mon,
        ten_mon,
        ma_khoa || null,
        loai_mon || null,
        so_tin_chi || null,
        don_gia_tin_chi || null,
        hoc_phan_tien_quyet || null,
        chi_nganh || 0,
        mo_ta || null,
      ]
    );

    res.status(201).json({ message: "Thêm môn học thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm môn học" });
  }
};

// ✏️ Cập nhật môn học
export const updateMonHoc = async (req, res) => {
  try {
    const { ma_mon } = req.params;
    const {
      ten_mon,
      ma_khoa,
      loai_mon,
      so_tin_chi,
      don_gia_tin_chi,
      hoc_phan_tien_quyet,
      chi_nganh,
      mo_ta
    } = req.body;

    await pool.query(
      `UPDATE mon_hoc 
       SET ten_mon=?, ma_khoa=?, loai_mon=?, so_tin_chi=?, don_gia_tin_chi=?, hoc_phan_tien_quyet=?, chi_nganh=?, mo_ta=?
       WHERE ma_mon=?`,
      [
        ten_mon,
        ma_khoa,
        loai_mon,
        so_tin_chi,
        don_gia_tin_chi,
        hoc_phan_tien_quyet,
        chi_nganh,
        mo_ta,
        ma_mon,
      ]
    );

    res.json({ message: "Cập nhật môn học thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật môn học" });
  }
};

// 🗑️ Xóa môn học
export const deleteMonHoc = async (req, res) => {
  try {
    const { ma_mon } = req.params;
    await pool.query("DELETE FROM mon_hoc WHERE ma_mon = ?", [ma_mon]);
    res.json({ message: "Xóa môn học thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa môn học" });
  }
};
