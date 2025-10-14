import pool from "../config/db.js";

// 📘 Lấy danh sách học kỳ
export const getAllHocKy = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM hoc_ky");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách học kỳ" });
  }
};

// ➕ Thêm học kỳ
export const createHocKy = async (req, res) => {
  try {
    const { ma_hoc_ky, ten_hoc_ky, nam_hoc, da_khoa } = req.body;
    await pool.query(
      `INSERT INTO hoc_ky (ma_hoc_ky, ten_hoc_ky, nam_hoc, da_khoa)
       VALUES (?, ?, ?, ?)`,
      [ma_hoc_ky, ten_hoc_ky, nam_hoc, da_khoa || 0]
    );
    res.status(201).json({ message: "Thêm học kỳ thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm học kỳ" });
  }
};

// ✏️ Cập nhật học kỳ
export const updateHocKy = async (req, res) => {
  try {
    const { ma_hoc_ky } = req.params;
    const { ten_hoc_ky, nam_hoc, da_khoa } = req.body;

    await pool.query(
      `UPDATE hoc_ky SET ten_hoc_ky=?, nam_hoc=?, da_khoa=? WHERE ma_hoc_ky=?`,
      [ten_hoc_ky, nam_hoc, da_khoa, ma_hoc_ky]
    );

    res.json({ message: "Cập nhật học kỳ thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật học kỳ" });
  }
};

// 🗑️ Xóa học kỳ
export const deleteHocKy = async (req, res) => {
  try {
    const { ma_hoc_ky } = req.params;
    await pool.query("DELETE FROM hoc_ky WHERE ma_hoc_ky = ?", [ma_hoc_ky]);
    res.json({ message: "Xóa học kỳ thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa học kỳ" });
  }
};
