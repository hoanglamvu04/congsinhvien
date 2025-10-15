import pool from "../config/db.js";

/**
 * 📘 Lấy danh sách giao dịch
 * - Admin: xem tất cả, có thể tìm kiếm theo mã SV / học kỳ / trạng thái / phương thức
 * - Sinh viên: chỉ xem giao dịch của mình
 */
export const getAllGiaoDich = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === "admin";
    const { q = "" } = req.query;
    const keyword = `%${q}%`;

    let sql = `
      SELECT gd.*, hp.ma_hoc_ky, hp.ma_sinh_vien, hk.ten_hoc_ky
      FROM giao_dich gd
      JOIN hoc_phi hp ON gd.id_hoc_phi = hp.id_hoc_phi
      JOIN hoc_ky hk ON hp.ma_hoc_ky = hk.ma_hoc_ky
    `;
    const params = [];

    if (isAdmin) {
      sql += `
        WHERE hp.ma_sinh_vien LIKE ?
           OR hk.ten_hoc_ky LIKE ?
           OR gd.phuong_thuc LIKE ?
           OR gd.trang_thai LIKE ?
      `;
      params.push(keyword, keyword, keyword, keyword);
    } else {
      sql += " WHERE hp.ma_sinh_vien = ?";
      params.push(user.ma_sinh_vien);
    }

    sql += " ORDER BY gd.ngay_giao_dich DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllGiaoDich]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách giao dịch" });
  }
};

/**
 * ➕ Tạo giao dịch mới (Sinh viên nộp học phí)
 */
export const createGiaoDich = async (req, res) => {
  try {
    const { id_hoc_phi, so_tien, phuong_thuc } = req.body;

    if (!id_hoc_phi || !so_tien || !phuong_thuc)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    await pool.query(
      `
      INSERT INTO giao_dich (id_hoc_phi, ngay_giao_dich, so_tien, phuong_thuc, trang_thai)
      VALUES (?, NOW(), ?, ?, 'cho_duyet')
      `,
      [id_hoc_phi, so_tien, phuong_thuc]
    );

    res.status(201).json({ message: "Tạo giao dịch thành công, đang chờ duyệt" });
  } catch (error) {
    console.error("[createGiaoDich]", error);
    res.status(500).json({ error: "Lỗi khi tạo giao dịch" });
  }
};

/**
 * ✏️ Duyệt / Cập nhật trạng thái giao dịch (Admin)
 */
export const updateTrangThaiGiaoDich = async (req, res) => {
  try {
    const { id_giao_dich, trang_thai } = req.body;
    if (!id_giao_dich || !trang_thai)
      return res.status(400).json({ error: "Thiếu thông tin cập nhật" });

    const [exist] = await pool.query("SELECT * FROM giao_dich WHERE id_giao_dich = ?", [id_giao_dich]);
    if (!exist.length) return res.status(404).json({ error: "Không tìm thấy giao dịch" });

    await pool.query("UPDATE giao_dich SET trang_thai = ? WHERE id_giao_dich = ?", [
      trang_thai,
      id_giao_dich,
    ]);

    res.json({ message: "Cập nhật trạng thái giao dịch thành công" });
  } catch (error) {
    console.error("[updateTrangThaiGiaoDich]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật giao dịch" });
  }
};

/**
 * 🗑️ Xóa giao dịch (Admin)
 */
export const deleteGiaoDich = async (req, res) => {
  try {
    const { id_giao_dich } = req.params;
    await pool.query("DELETE FROM giao_dich WHERE id_giao_dich=?", [id_giao_dich]);
    res.json({ message: "Xóa giao dịch thành công" });
  } catch (error) {
    console.error("[deleteGiaoDich]", error);
    res.status(500).json({ error: "Lỗi khi xóa giao dịch" });
  }
};
