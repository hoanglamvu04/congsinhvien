import pool from "../config/db.js";

// 📘 Lấy danh sách học kỳ (có tìm kiếm)
export const getAllHocKy = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const keyword = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT * FROM hoc_ky 
       WHERE ma_hoc_ky LIKE ? 
          OR ten_hoc_ky LIKE ? 
          OR nam_hoc LIKE ?`,
      [keyword, keyword, keyword]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllHocKy]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách học kỳ" });
  }
};

// ➕ Thêm học kỳ
export const createHocKy = async (req, res) => {
  try {
    const { ma_hoc_ky, ten_hoc_ky, nam_hoc, da_khoa } = req.body;

    if (!ma_hoc_ky || !ten_hoc_ky || !nam_hoc)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    const [exist] = await pool.query("SELECT 1 FROM hoc_ky WHERE ma_hoc_ky = ?", [ma_hoc_ky]);
    if (exist.length) return res.status(409).json({ error: "Mã học kỳ đã tồn tại" });

    await pool.query(
      `INSERT INTO hoc_ky (ma_hoc_ky, ten_hoc_ky, nam_hoc, da_khoa)
       VALUES (?, ?, ?, ?)`,
      [ma_hoc_ky, ten_hoc_ky, nam_hoc, da_khoa ? 1 : 0]
    );
    res.status(201).json({ message: "Thêm học kỳ thành công" });
  } catch (error) {
    console.error("[createHocKy]", error);
    res.status(500).json({ error: "Lỗi khi thêm học kỳ" });
  }
};

// ✏️ Cập nhật học kỳ
export const updateHocKy = async (req, res) => {
  try {
    const { ma_hoc_ky } = req.params;
    const { ten_hoc_ky, nam_hoc, da_khoa } = req.body;

    const [exist] = await pool.query("SELECT * FROM hoc_ky WHERE ma_hoc_ky=?", [ma_hoc_ky]);
    if (!exist.length) return res.status(404).json({ error: "Không tìm thấy học kỳ" });

    await pool.query(
      `UPDATE hoc_ky 
       SET ten_hoc_ky=?, nam_hoc=?, da_khoa=? 
       WHERE ma_hoc_ky=?`,
      [ten_hoc_ky, nam_hoc, da_khoa ? 1 : 0, ma_hoc_ky]
    );

    res.json({ message: "Cập nhật học kỳ thành công" });
  } catch (error) {
    console.error("[updateHocKy]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật học kỳ" });
  }
};

// 🗑️ Xóa học kỳ
export const deleteHocKy = async (req, res) => {
  try {
    const { ma_hoc_ky } = req.params;
    await pool.query("DELETE FROM hoc_ky WHERE ma_hoc_ky=?", [ma_hoc_ky]);
    res.json({ message: "Xóa học kỳ thành công" });
  } catch (error) {
    console.error("[deleteHocKy]", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Không thể xóa do dữ liệu liên quan" });
    res.status(500).json({ error: "Lỗi khi xóa học kỳ" });
  }
};
