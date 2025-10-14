import pool from "../config/db.js";

// 📘 Lấy danh sách khảo sát (sinh viên / giảng viên)
export const getKhaoSat = async (req, res) => {
  try {
    const role = req.user.role;
    const doi_tuong = role === "admin" ? null : role === "giangvien" ? "giangvien" : "sinhvien";

    let sql = "SELECT * FROM khao_sat";
    if (doi_tuong) sql += " WHERE doi_tuong IN (?, 'tatca')";
    const [rows] = await pool.query(sql, [doi_tuong]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách khảo sát" });
  }
};

// ➕ Tạo khảo sát (Admin hoặc Giảng viên)
export const createKhaoSat = async (req, res) => {
  try {
    const { tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai, nguoi_tao } = req.body;

    await pool.query(`
      INSERT INTO khao_sat (tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai, nguoi_tao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai, nguoi_tao]);

    res.status(201).json({ message: "Tạo khảo sát thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi tạo khảo sát" });
  }
};
