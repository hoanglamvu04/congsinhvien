import pool from "../config/db.js";

// Lấy tất cả lớp
export const getAllLop = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, n.ten_nganh 
      FROM lop l 
      LEFT JOIN nganh n ON l.ma_nganh = n.ma_nganh
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách lớp" });
  }
};

// Thêm lớp
export const createLop = async (req, res) => {
  try {
    const { ma_lop, ten_lop, ma_nganh, khoa_hoc, co_van, trang_thai } = req.body;
    await pool.query(
      "INSERT INTO lop (ma_lop, ten_lop, ma_nganh, khoa_hoc, co_van, trang_thai) VALUES (?, ?, ?, ?, ?, ?)",
      [ma_lop, ten_lop, ma_nganh, khoa_hoc, co_van, trang_thai || "hoatdong"]
    );
    res.status(201).json({ message: "Thêm lớp thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm lớp" });
  }
};

// Cập nhật lớp
export const updateLop = async (req, res) => {
  try {
    const { ma_lop } = req.params;
    const { ten_lop, khoa_hoc, co_van, trang_thai } = req.body;
    await pool.query(
      "UPDATE lop SET ten_lop=?, khoa_hoc=?, co_van=?, trang_thai=? WHERE ma_lop=?",
      [ten_lop, khoa_hoc, co_van, trang_thai, ma_lop]
    );
    res.json({ message: "Cập nhật lớp thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật lớp" });
  }
};

// Xóa lớp
export const deleteLop = async (req, res) => {
  try {
    const { ma_lop } = req.params;
    await pool.query("DELETE FROM lop WHERE ma_lop = ?", [ma_lop]);
    res.json({ message: "Xóa lớp thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa lớp" });
  }
};
