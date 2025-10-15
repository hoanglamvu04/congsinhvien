import pool from "../config/db.js";

/**
 * 📘 Lấy danh sách học phí (có tìm kiếm)
 * Admin có thể tìm theo mã sinh viên / học kỳ / trạng thái
 * Sinh viên chỉ thấy học phí của chính mình
 */
export const getAllHocPhi = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === "admin";
    const { q = "" } = req.query;
    const keyword = `%${q}%`;

    let sql = `
      SELECT hp.*, hk.ten_hoc_ky
      FROM hoc_phi hp
      JOIN hoc_ky hk ON hp.ma_hoc_ky = hk.ma_hoc_ky
    `;
    const params = [];

    if (isAdmin) {
      sql += `
        WHERE hp.ma_sinh_vien LIKE ?
           OR hp.ma_hoc_ky LIKE ?
           OR hp.trang_thai LIKE ?
      `;
      params.push(keyword, keyword, keyword);
    } else {
      // Sinh viên chỉ xem của chính mình
      sql += " WHERE hp.ma_sinh_vien = ?";
      params.push(user.ma_sinh_vien);
    }

    sql += " ORDER BY hk.ten_hoc_ky DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllHocPhi]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách học phí" });
  }
};

/**
 * ➕ Thêm học phí
 */
export const createHocPhi = async (req, res) => {
  try {
    const {
      ma_sinh_vien,
      ma_hoc_ky,
      tong_tien_phai_nop,
      tong_tien_da_nop,
      con_no,
      trang_thai,
    } = req.body;

    if (!ma_sinh_vien || !ma_hoc_ky)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    // Kiểm tra trùng
    const [exist] = await pool.query(
      "SELECT 1 FROM hoc_phi WHERE ma_sinh_vien=? AND ma_hoc_ky=?",
      [ma_sinh_vien, ma_hoc_ky]
    );
    if (exist.length)
      return res.status(409).json({ error: "Học phí học kỳ này đã tồn tại" });

    await pool.query(
      `INSERT INTO hoc_phi
       (ma_sinh_vien, ma_hoc_ky, tong_tien_phai_nop, tong_tien_da_nop, con_no, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        ma_sinh_vien,
        ma_hoc_ky,
        tong_tien_phai_nop,
        tong_tien_da_nop,
        con_no,
        trang_thai,
      ]
    );

    res.status(201).json({ message: "Thêm học phí thành công" });
  } catch (error) {
    console.error("[createHocPhi]", error);
    res.status(500).json({ error: "Lỗi khi thêm học phí" });
  }
};

/**
 * ✏️ Cập nhật học phí
 */
export const updateHocPhi = async (req, res) => {
  try {
    const { ma_sinh_vien, ma_hoc_ky } = req.params;
    const {
      tong_tien_phai_nop,
      tong_tien_da_nop,
      con_no,
      trang_thai,
    } = req.body;

    const [exist] = await pool.query(
      "SELECT * FROM hoc_phi WHERE ma_sinh_vien=? AND ma_hoc_ky=?",
      [ma_sinh_vien, ma_hoc_ky]
    );
    if (!exist.length)
      return res.status(404).json({ error: "Không tìm thấy bản ghi học phí" });

    await pool.query(
      `UPDATE hoc_phi
       SET tong_tien_phai_nop=?, tong_tien_da_nop=?, con_no=?, trang_thai=?
       WHERE ma_sinh_vien=? AND ma_hoc_ky=?`,
      [
        tong_tien_phai_nop,
        tong_tien_da_nop,
        con_no,
        trang_thai,
        ma_sinh_vien,
        ma_hoc_ky,
      ]
    );

    res.json({ message: "Cập nhật học phí thành công" });
  } catch (error) {
    console.error("[updateHocPhi]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật học phí" });
  }
};

/**
 * 🗑️ Xóa học phí
 */
export const deleteHocPhi = async (req, res) => {
  try {
    const { ma_sinh_vien, ma_hoc_ky } = req.params;

    await pool.query(
      "DELETE FROM hoc_phi WHERE ma_sinh_vien=? AND ma_hoc_ky=?",
      [ma_sinh_vien, ma_hoc_ky]
    );
    res.json({ message: "Xóa học phí thành công" });
  } catch (error) {
    console.error("[deleteHocPhi]", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Không thể xóa do dữ liệu liên quan" });
    res.status(500).json({ error: "Lỗi khi xóa học phí" });
  }
};
