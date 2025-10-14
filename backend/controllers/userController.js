import pool from "../config/db.js";

// Lấy thông tin sinh viên hiện tại (theo token)
export const getStudentInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      "SELECT id_tai_khoan, ten_dang_nhap, vai_tro, trang_thai, ngay_tao FROM tai_khoan WHERE id_tai_khoan = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi lấy thông tin sinh viên" });
  }
};
        