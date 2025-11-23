import pool from "../config/db.js";

/**
 * 📘 Lấy toàn bộ danh sách học phí theo học kỳ
 */
export const getAllHocPhi = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT hp.*, hk.ten_hoc_ky 
      FROM hoc_phi hp
      JOIN hoc_ky hk ON hp.ma_hoc_ky = hk.ma_hoc_ky
      ORDER BY hk.ten_hoc_ky DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllHocPhi]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách học phí" });
  }
};

/**
 * 📘 Lấy học phí theo mã học kỳ
 */
export const getHocPhiByHocKy = async (req, res) => {
  try {
    const { ma_hoc_ky } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM hoc_phi WHERE ma_hoc_ky = ?",
      [ma_hoc_ky]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Không tìm thấy học phí học kỳ này" });
    res.json(rows[0]);
  } catch (error) {
    console.error("[getHocPhiByHocKy]", error);
    res.status(500).json({ error: "Lỗi khi lấy học phí học kỳ" });
  }
};

/**
 * ➕ Thêm mới học phí cho học kỳ
 */
export const createHocPhi = async (req, res) => {
  try {
    const { ma_hoc_ky, tong_tien_phai_nop, han_nop, ghi_chu } = req.body;

    if (!ma_hoc_ky || !tong_tien_phai_nop)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    // Kiểm tra trùng học kỳ
    const [exist] = await pool.query(
      "SELECT 1 FROM hoc_phi WHERE ma_hoc_ky = ?",
      [ma_hoc_ky]
    );
    if (exist.length)
      return res.status(409).json({ error: "Học phí học kỳ này đã tồn tại" });

    await pool.query(
      `INSERT INTO hoc_phi (ma_hoc_ky, tong_tien_phai_nop, han_nop, ghi_chu, trang_thai)
       VALUES (?, ?, ?, ?, 'ap_dung')`,
      [ma_hoc_ky, tong_tien_phai_nop, han_nop, ghi_chu]
    );

    res.status(201).json({ message: "✅ Thêm học phí thành công" });
  } catch (error) {
    console.error("[createHocPhi]", error);
    res.status(500).json({ error: "Lỗi khi thêm học phí" });
  }
};

/**
 * ✏️ Cập nhật thông tin học phí
 */
export const updateHocPhi = async (req, res) => {
  try {
    const { id_hoc_phi } = req.params;
    const { tong_tien_phai_nop, han_nop, ghi_chu, trang_thai } = req.body;

    const [exist] = await pool.query(
      "SELECT * FROM hoc_phi WHERE id_hoc_phi = ?",
      [id_hoc_phi]
    );
    if (!exist.length)
      return res.status(404).json({ error: "Không tìm thấy học phí cần cập nhật" });

    await pool.query(
      `UPDATE hoc_phi
       SET tong_tien_phai_nop=?, han_nop=?, ghi_chu=?, trang_thai=?
       WHERE id_hoc_phi=?`,
      [tong_tien_phai_nop, han_nop, ghi_chu, trang_thai, id_hoc_phi]
    );

    res.json({ message: "✅ Cập nhật học phí thành công" });
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
    const { id_hoc_phi } = req.params;
    await pool.query("DELETE FROM hoc_phi WHERE id_hoc_phi = ?", [id_hoc_phi]);
    res.json({ message: "🗑️ Xóa học phí thành công" });
  } catch (error) {
    console.error("[deleteHocPhi]", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "Không thể xóa vì đang có giao dịch liên quan đến học phí này",
      });
    }
    res.status(500).json({ error: "Lỗi khi xóa học phí" });
  }
};

/**
 * 📊 Thống kê học phí sinh viên (từ bảng giao_dich_hoc_phi)
 */
export const getThongKeHocPhi = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        sv.ma_sinh_vien,
        sv.ho_ten,
        hk.ten_hoc_ky,
        hp.tong_tien_phai_nop,
        IFNULL(SUM(gd.so_tien_nop), 0) AS tong_tien_da_nop,
        (hp.tong_tien_phai_nop - IFNULL(SUM(gd.so_tien_nop), 0)) AS con_no,
        CASE 
          WHEN SUM(gd.so_tien_nop) >= hp.tong_tien_phai_nop THEN 'Đã hoàn thành'
          WHEN SUM(gd.so_tien_nop) > 0 THEN 'Còn nợ'
          ELSE 'Chưa nộp'
        END AS trang_thai
      FROM hoc_phi hp
      JOIN hoc_ky hk ON hp.ma_hoc_ky = hk.ma_hoc_ky
      LEFT JOIN giao_dich_hoc_phi gd ON hp.id_hoc_phi = gd.id_hoc_phi
      LEFT JOIN sinh_vien sv ON gd.ma_sinh_vien = sv.ma_sinh_vien
      GROUP BY sv.ma_sinh_vien, hp.id_hoc_phi
      ORDER BY hk.ten_hoc_ky DESC
    `);

    res.json({ data: rows });
  } catch (error) {
    console.error("[getThongKeHocPhi]", error);
    res.status(500).json({ error: "Lỗi khi thống kê học phí" });
  }
};
