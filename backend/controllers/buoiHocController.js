import pool from "../config/db.js";

export const getBuoiHocByLopHp = async (req, res) => {
  try {
    const { ma_lop_hp } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM buoi_hoc WHERE ma_lop_hp = ? ORDER BY ngay_hoc ASC",
      [ma_lop_hp]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error("[getBuoiHocByLopHp]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách buổi học" });
  }
};
