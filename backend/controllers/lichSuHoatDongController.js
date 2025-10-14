import pool from "../config/db.js";

// 🧩 Hàm ghi log (có thể import vào bất kỳ controller nào khác)
export const ghiLog = async (tai_khoan_thuc_hien, hanh_dong, bang_tac_dong, khoa_chinh_bi_anh_huong) => {
  try {
    await pool.query(
      `INSERT INTO lich_su_hoat_dong (tai_khoan_thuc_hien, hanh_dong, bang_tac_dong, khoa_chinh_bi_anh_huong)
       VALUES (?, ?, ?, ?)`,
      [tai_khoan_thuc_hien, hanh_dong, bang_tac_dong, khoa_chinh_bi_anh_huong]
    );
  } catch (error) {
    console.error("❌ Lỗi khi ghi log:", error);
  }
};

// 📘 Lấy danh sách log (chỉ admin)
export const getAllLogs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM lich_su_hoat_dong ORDER BY thoi_gian DESC LIMIT 200"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách lịch sử hoạt động" });
  }
};

// 📘 Lọc log theo tài khoản
export const getLogByUser = async (req, res) => {
  try {
    const { tai_khoan_thuc_hien } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM lich_su_hoat_dong WHERE tai_khoan_thuc_hien = ? ORDER BY thoi_gian DESC",
      [tai_khoan_thuc_hien]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy lịch sử của người dùng" });
  }
};
