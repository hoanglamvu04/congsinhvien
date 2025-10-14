import pool from "../config/db.js";

// 🧩 Lấy danh sách khoa
export const getAllKhoa = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM khoa");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách khoa" });
  }
};

// 🧩 Thêm khoa mới
export const createKhoa = async (req, res) => {
  try {
    const { ma_khoa, ten_khoa, mo_ta } = req.body;
    await pool.query(
      "INSERT INTO khoa (ma_khoa, ten_khoa, mo_ta) VALUES (?, ?, ?)",
      [ma_khoa, ten_khoa, mo_ta]
    );
    res.status(201).json({ message: "Thêm khoa thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm khoa" });
  }
};

// 🧩 Sửa khoa
export const updateKhoa = async (req, res) => {
  try {
    const { ma_khoa } = req.params;
    const { ten_khoa, mo_ta } = req.body;
    await pool.query(
      "UPDATE khoa SET ten_khoa = ?, mo_ta = ? WHERE ma_khoa = ?",
      [ten_khoa, mo_ta, ma_khoa]
    );
    res.json({ message: "Cập nhật khoa thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật khoa" });
  }
};

// 🧩 Xóa khoa
export const deleteKhoa = async (req, res) => {
  try {
    const { ma_khoa } = req.params;
    await pool.query("DELETE FROM khoa WHERE ma_khoa = ?", [ma_khoa]);
    res.json({ message: "Xóa khoa thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa khoa" });
  }
};
