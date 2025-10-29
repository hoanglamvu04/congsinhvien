import pool from "../config/db.js";

// 📘 Lấy danh sách môn học (có tìm kiếm + join ngành)
export const getAllMonHoc = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const keyword = `%${q}%`;

    const [rows] = await pool.query(
      `
      SELECT mh.*, n.ten_nganh 
      FROM mon_hoc mh 
      LEFT JOIN nganh n ON mh.ma_nganh = n.ma_nganh
      WHERE mh.ma_mon LIKE ? OR mh.ten_mon LIKE ? OR n.ten_nganh LIKE ?
      ORDER BY mh.ma_mon ASC
      `,
      [keyword, keyword, keyword]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllMonHoc]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách môn học" });
  }
};

// ➕ Thêm môn học
export const createMonHoc = async (req, res) => {
  try {
    const {
      ma_mon,
      ten_mon,
      ma_nganh,
      loai_mon,
      so_tin_chi,
      don_gia_tin_chi,
      hoc_phan_tien_quyet,
      chi_nganh,
      mo_ta,
    } = req.body;

    if (!ma_mon || !ten_mon)
      return res.status(400).json({ error: "Thiếu mã hoặc tên môn học" });

    const [exist] = await pool.query("SELECT ma_mon FROM mon_hoc WHERE ma_mon = ?", [ma_mon]);
    if (exist.length)
      return res.status(409).json({ error: "Mã môn học đã tồn tại" });

    await pool.query(
      `
      INSERT INTO mon_hoc 
      (ma_mon, ten_mon, ma_nganh, loai_mon, so_tin_chi, don_gia_tin_chi, hoc_phan_tien_quyet, chi_nganh, mo_ta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ma_mon,
        ten_mon,
        ma_nganh || null,
        loai_mon || null,
        so_tin_chi || 0,
        don_gia_tin_chi || 0,
        hoc_phan_tien_quyet || null,
        chi_nganh || 0,
        mo_ta || null,
      ]
    );

    res.status(201).json({ message: "✅ Thêm môn học thành công" });
  } catch (error) {
    console.error("[createMonHoc]", error);
    res.status(500).json({ error: "Lỗi khi thêm môn học" });
  }
};

// ✏️ Cập nhật môn học
export const updateMonHoc = async (req, res) => {
  try {
    const { ma_mon } = req.params;
    const {
      ten_mon,
      ma_nganh,
      loai_mon,
      so_tin_chi,
      don_gia_tin_chi,
      hoc_phan_tien_quyet,
      chi_nganh,
      mo_ta,
    } = req.body;

    await pool.query(
      `
      UPDATE mon_hoc 
      SET ten_mon=?, ma_nganh=?, loai_mon=?, so_tin_chi=?, don_gia_tin_chi=?, 
          hoc_phan_tien_quyet=?, chi_nganh=?, mo_ta=? 
      WHERE ma_mon=?
      `,
      [
        ten_mon,
        ma_nganh,
        loai_mon,
        so_tin_chi,
        don_gia_tin_chi,
        hoc_phan_tien_quyet,
        chi_nganh,
        mo_ta,
        ma_mon,
      ]
    );

    res.json({ message: "✅ Cập nhật môn học thành công" });
  } catch (error) {
    console.error("[updateMonHoc]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật môn học" });
  }
};

// 🗑️ Xóa môn học
export const deleteMonHoc = async (req, res) => {
  try {
    const { ma_mon } = req.params;
    await pool.query("DELETE FROM mon_hoc WHERE ma_mon = ?", [ma_mon]);
    res.json({ message: "🗑️ Xóa môn học thành công" });
  } catch (error) {
    console.error("[deleteMonHoc]", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Không thể xóa do có dữ liệu liên quan" });
    res.status(500).json({ error: "Lỗi khi xóa môn học" });
  }
};
