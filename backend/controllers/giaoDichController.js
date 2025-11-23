import pool from "../config/db.js";

/**
 * 📘 Lấy danh sách giao dịch nộp học phí
 * - Admin xem toàn bộ
 * - Sinh viên chỉ xem các giao dịch của mình
 */
export const getAllGiaoDichHocPhi = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === "admin";

    let sql = `
      SELECT 
        gd.id_gd,
        gd.ma_sinh_vien,
        sv.ho_ten,
        hk.ten_hoc_ky,
        hp.tong_tien_phai_nop,
        gd.so_tien_nop,
        gd.ngay_nop,
        gd.phuong_thuc,
        gd.trang_thai,
        gd.ghi_chu
      FROM giao_dich_hoc_phi gd
      JOIN sinh_vien sv ON gd.ma_sinh_vien = sv.ma_sinh_vien
      JOIN hoc_phi hp ON gd.id_hoc_phi = hp.id_hoc_phi
      JOIN hoc_ky hk ON hp.ma_hoc_ky = hk.ma_hoc_ky
    `;

    const params = [];
    if (!isAdmin) {
      sql += " WHERE gd.ma_sinh_vien = ?";
      params.push(user.ma_sinh_vien);
    }

    sql += " ORDER BY gd.ngay_nop DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllGiaoDichHocPhi]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách giao dịch học phí" });
  }
};

/**
 * ➕ Thêm giao dịch nộp học phí
 * Ghi nhận mỗi lần sinh viên nộp tiền
 */
export const createGiaoDichHocPhi = async (req, res) => {
  try {
    const {
      ma_sinh_vien,
      id_hoc_phi,
      so_tien_nop,
      phuong_thuc = "tien_mat",
      trang_thai = "thanh_cong",
      ghi_chu = null,
    } = req.body;

    if (!ma_sinh_vien || !id_hoc_phi || !so_tien_nop)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    // Kiểm tra sinh viên tồn tại
    const [sv] = await pool.query(
      "SELECT 1 FROM sinh_vien WHERE ma_sinh_vien = ?",
      [ma_sinh_vien]
    );
    if (!sv.length)
      return res.status(404).json({ error: "Không tìm thấy sinh viên" });

    // Kiểm tra học phí tồn tại
    const [hp] = await pool.query(
      "SELECT 1 FROM hoc_phi WHERE id_hoc_phi = ?",
      [id_hoc_phi]
    );
    if (!hp.length)
      return res.status(404).json({ error: "Không tìm thấy học phí học kỳ" });

    await pool.query(
      `INSERT INTO giao_dich_hoc_phi
       (ma_sinh_vien, id_hoc_phi, so_tien_nop, ngay_nop, phuong_thuc, trang_thai, ghi_chu)
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?)`,
      [ma_sinh_vien, id_hoc_phi, so_tien_nop, phuong_thuc, trang_thai, ghi_chu]
    );

    res.status(201).json({ message: "✅ Ghi nhận giao dịch học phí thành công" });
  } catch (error) {
    console.error("[createGiaoDichHocPhi]", error);
    res.status(500).json({ error: "Lỗi khi ghi nhận giao dịch học phí" });
  }
};

/**
 * 🗑️ Xóa giao dịch học phí
 */
export const deleteGiaoDichHocPhi = async (req, res) => {
  try {
    const { id_gd } = req.params;
    await pool.query("DELETE FROM giao_dich_hoc_phi WHERE id_gd = ?", [id_gd]);
    res.json({ message: "🗑️ Đã xóa giao dịch học phí thành công" });
  } catch (error) {
    console.error("[deleteGiaoDichHocPhi]", error);
    res.status(500).json({ error: "Lỗi khi xóa giao dịch học phí" });
  }
};
