import pool from "../config/db.js";

// ✅ Lấy danh sách ngành (có tìm kiếm, join khoa)
export const getAllNganh = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const keyword = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT ng.*, k.ten_khoa 
       FROM nganh ng
       LEFT JOIN khoa k ON ng.ma_khoa = k.ma_khoa
       WHERE ng.ma_nganh LIKE ? 
          OR ng.ten_nganh LIKE ? 
          OR k.ten_khoa LIKE ?
          OR ng.loai_nganh LIKE ?`,
      [keyword, keyword, keyword, keyword]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllNganh]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách ngành" });
  }
};

// ✅ Thêm ngành
export const createNganh = async (req, res) => {
  try {
    const { ma_nganh, ten_nganh, ma_khoa, loai_nganh, mo_ta } = req.body;

    if (!ma_nganh || !ten_nganh || !ma_khoa)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    const [exist] = await pool.query("SELECT * FROM nganh WHERE ma_nganh = ?", [ma_nganh]);
    if (exist.length)
      return res.status(409).json({ error: "Mã ngành đã tồn tại" });

    await pool.query(
      "INSERT INTO nganh (ma_nganh, ten_nganh, ma_khoa, loai_nganh, mo_ta) VALUES (?, ?, ?, ?, ?)",
      [ma_nganh, ten_nganh, ma_khoa, loai_nganh || null, mo_ta || null]
    );
    res.status(201).json({ message: "Thêm ngành thành công" });
  } catch (error) {
    console.error("[createNganh]", error);
    res.status(500).json({ error: "Lỗi khi thêm ngành" });
  }
};

// ✅ Cập nhật ngành
export const updateNganh = async (req, res) => {
  try {
    const { ma_nganh } = req.params;
    const { ten_nganh, loai_nganh, mo_ta, ma_khoa } = req.body;

    const [exist] = await pool.query("SELECT * FROM nganh WHERE ma_nganh = ?", [ma_nganh]);
    if (!exist.length) return res.status(404).json({ error: "Không tìm thấy ngành" });

    await pool.query(
      "UPDATE nganh SET ten_nganh=?, loai_nganh=?, mo_ta=?, ma_khoa=? WHERE ma_nganh=?",
      [ten_nganh, loai_nganh || null, mo_ta || null, ma_khoa || exist[0].ma_khoa, ma_nganh]
    );
    res.json({ message: "Cập nhật ngành thành công" });
  } catch (error) {
    console.error("[updateNganh]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật ngành" });
  }
};

// ✅ Xóa ngành
export const deleteNganh = async (req, res) => {
  try {
    const { ma_nganh } = req.params;
    await pool.query("DELETE FROM nganh WHERE ma_nganh = ?", [ma_nganh]);
    res.json({ message: "Xóa ngành thành công" });
  } catch (error) {
    console.error("[deleteNganh]", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({ error: "Không thể xóa do liên quan dữ liệu khác" });
    }
    res.status(500).json({ error: "Lỗi khi xóa ngành" });
  }
};
