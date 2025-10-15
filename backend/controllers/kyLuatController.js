import pool from "../config/db.js";

/**
 * 📘 Lấy danh sách kỷ luật
 * - Sinh viên: chỉ thấy của mình
 * - Admin: xem tất cả hoặc tìm kiếm
 */
export const getAllKyLuat = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === "admin";
    const { q = "" } = req.query;
    const keyword = `%${q}%`;

    let sql = `
      SELECT kl.*, sv.ho_ten
      FROM ky_luat kl
      LEFT JOIN sinh_vien sv ON kl.ma_sinh_vien = sv.ma_sinh_vien
    `;
    const params = [];

    if (isAdmin) {
      sql += `
        WHERE kl.ma_sinh_vien LIKE ?
           OR sv.ho_ten LIKE ?
           OR kl.hinh_thuc LIKE ?
           OR kl.ly_do LIKE ?
           OR kl.nguoi_ra_quyet_dinh LIKE ?
      `;
      params.push(keyword, keyword, keyword, keyword, keyword);
    } else {
      sql += " WHERE kl.ma_sinh_vien = ?";
      params.push(user.ma_sinh_vien);
    }

    sql += " ORDER BY kl.ngay_quyet_dinh DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllKyLuat]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách kỷ luật" });
  }
};

/**
 * ➕ Thêm kỷ luật (Admin)
 */
export const createKyLuat = async (req, res) => {
  try {
    const { ma_sinh_vien, ngay_quyet_dinh, hinh_thuc, ly_do, nguoi_ra_quyet_dinh } = req.body;

    if (!ma_sinh_vien || !ngay_quyet_dinh || !hinh_thuc)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    await pool.query(
      `
      INSERT INTO ky_luat (ma_sinh_vien, ngay_quyet_dinh, hinh_thuc, ly_do, nguoi_ra_quyet_dinh)
      VALUES (?, ?, ?, ?, ?)
      `,
      [ma_sinh_vien, ngay_quyet_dinh, hinh_thuc, ly_do, nguoi_ra_quyet_dinh]
    );

    res.status(201).json({ message: "Thêm kỷ luật thành công" });
  } catch (error) {
    console.error("[createKyLuat]", error);
    res.status(500).json({ error: "Lỗi khi thêm kỷ luật" });
  }
};

/**
 * ✏️ Cập nhật kỷ luật (Admin)
 */
export const updateKyLuat = async (req, res) => {
  try {
    const { id_ky_luat } = req.params;
    const { ma_sinh_vien, ngay_quyet_dinh, hinh_thuc, ly_do, nguoi_ra_quyet_dinh } = req.body;

    const [exist] = await pool.query("SELECT * FROM ky_luat WHERE id_ky_luat=?", [id_ky_luat]);
    if (!exist.length) return res.status(404).json({ error: "Không tìm thấy bản ghi" });

    await pool.query(
      `
      UPDATE ky_luat
      SET ma_sinh_vien=?, ngay_quyet_dinh=?, hinh_thuc=?, ly_do=?, nguoi_ra_quyet_dinh=?
      WHERE id_ky_luat=?
      `,
      [ma_sinh_vien, ngay_quyet_dinh, hinh_thuc, ly_do, nguoi_ra_quyet_dinh, id_ky_luat]
    );

    res.json({ message: "Cập nhật kỷ luật thành công" });
  } catch (error) {
    console.error("[updateKyLuat]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật kỷ luật" });
  }
};

/**
 * 🗑️ Xóa kỷ luật (Admin)
 */
export const deleteKyLuat = async (req, res) => {
  try {
    const { id_ky_luat } = req.params;
    await pool.query("DELETE FROM ky_luat WHERE id_ky_luat=?", [id_ky_luat]);
    res.json({ message: "Xóa kỷ luật thành công" });
  } catch (error) {
    console.error("[deleteKyLuat]", error);
    res.status(500).json({ error: "Lỗi khi xóa kỷ luật" });
  }
};
