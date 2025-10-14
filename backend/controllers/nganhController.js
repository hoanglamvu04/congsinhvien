import pool from "../config/db.js";

// Lấy tất cả ngành
export const getAllNganh = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ng.*, k.ten_khoa 
      FROM nganh ng
      LEFT JOIN khoa k ON ng.ma_khoa = k.ma_khoa
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách ngành" });
  }
};

// Thêm ngành
export const createNganh = async (req, res) => {
  try {
    const { ma_nganh, ten_nganh, ma_khoa, loai_nganh, mo_ta } = req.body;
    await pool.query(
      "INSERT INTO nganh (ma_nganh, ten_nganh, ma_khoa, loai_nganh, mo_ta) VALUES (?, ?, ?, ?, ?)",
      [ma_nganh, ten_nganh, ma_khoa, loai_nganh, mo_ta]
    );
    res.status(201).json({ message: "Thêm ngành thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm ngành" });
  }
};

// Cập nhật ngành
export const updateNganh = async (req, res) => {
  try {
    const { ma_nganh } = req.params;
    const { ten_nganh, loai_nganh, mo_ta } = req.body;
    await pool.query(
      "UPDATE nganh SET ten_nganh = ?, loai_nganh = ?, mo_ta = ? WHERE ma_nganh = ?",
      [ten_nganh, loai_nganh, mo_ta, ma_nganh]
    );
    res.json({ message: "Cập nhật ngành thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật ngành" });
  }
};

// Xóa ngành
export const deleteNganh = async (req, res) => {
  try {
    const { ma_nganh } = req.params;
    await pool.query("DELETE FROM nganh WHERE ma_nganh = ?", [ma_nganh]);
    res.json({ message: "Xóa ngành thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa ngành" });
  }
};
