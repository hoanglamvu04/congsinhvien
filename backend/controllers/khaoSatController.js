import pool from "../config/db.js";

/**
 * 📘 Lấy danh sách khảo sát (Admin / Giảng viên / Sinh viên)
 */
export const getAllKhaoSat = async (req, res) => {
  try {
    const { role } = req.user;
    const { q = "" } = req.query;
    const keyword = `%${q}%`;

    let sql = "SELECT * FROM khao_sat";
    const params = [];

    if (role !== "admin") {
      const doi_tuong = role === "giangvien" ? "giangvien" : "sinhvien";
      sql += " WHERE (doi_tuong IN (?, 'tatca'))";
      params.push(doi_tuong);
    } else if (q) {
      sql += " WHERE tieu_de LIKE ? OR noi_dung LIKE ? OR doi_tuong LIKE ? OR trang_thai LIKE ?";
      params.push(keyword, keyword, keyword, keyword);
    }

    sql += " ORDER BY ngay_bat_dau DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllKhaoSat]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách khảo sát" });
  }
};

/**
 * ➕ Tạo khảo sát (Admin / Giảng viên)
 */
export const createKhaoSat = async (req, res) => {
  try {
    const { tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai, nguoi_tao } =
      req.body;

    if (!tieu_de || !noi_dung || !ngay_bat_dau || !ngay_ket_thuc)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    await pool.query(
      `
      INSERT INTO khao_sat (tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai, nguoi_tao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai, nguoi_tao]
    );

    res.status(201).json({ message: "Tạo khảo sát thành công" });
  } catch (error) {
    console.error("[createKhaoSat]", error);
    res.status(500).json({ error: "Lỗi khi tạo khảo sát" });
  }
};

/**
 * ✏️ Cập nhật khảo sát (Admin)
 */
export const updateKhaoSat = async (req, res) => {
  try {
    const { id_khao_sat } = req.params;
    const { tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai } = req.body;

    const [exist] = await pool.query("SELECT * FROM khao_sat WHERE id_khao_sat=?", [id_khao_sat]);
    if (!exist.length) return res.status(404).json({ error: "Không tìm thấy bản ghi" });

    await pool.query(
      `
      UPDATE khao_sat
      SET tieu_de=?, noi_dung=?, ngay_bat_dau=?, ngay_ket_thuc=?, doi_tuong=?, trang_thai=?
      WHERE id_khao_sat=?
      `,
      [tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai, id_khao_sat]
    );

    res.json({ message: "Cập nhật khảo sát thành công" });
  } catch (error) {
    console.error("[updateKhaoSat]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật khảo sát" });
  }
};

/**
 * 🗑️ Xóa khảo sát (Admin)
 */
export const deleteKhaoSat = async (req, res) => {
  try {
    const { id_khao_sat } = req.params;
    await pool.query("DELETE FROM khao_sat WHERE id_khao_sat=?", [id_khao_sat]);
    res.json({ message: "Xóa khảo sát thành công" });
  } catch (error) {
    console.error("[deleteKhaoSat]", error);
    res.status(500).json({ error: "Lỗi khi xóa khảo sát" });
  }
};
