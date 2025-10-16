import pool from "../config/db.js";

/**
 * 📘 Tạo thông báo (Admin)
 */
export const createThongBao = async (req, res) => {
  try {
    const {
      tieu_de,
      noi_dung,
      nguoi_gui,
      doi_tuong,
      ma_doi_tuong,
      tep_dinh_kem,
      trang_thai,
    } = req.body;

    await pool.query(
      `
      INSERT INTO thong_bao (tieu_de, noi_dung, nguoi_gui, doi_tuong, ma_doi_tuong, tep_dinh_kem, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tieu_de,
        noi_dung,
        nguoi_gui,
        doi_tuong,
        ma_doi_tuong,
        tep_dinh_kem,
        trang_thai || "hienthi",
      ]
    );

    res.status(201).json({ message: "✅ Tạo thông báo thành công" });
  } catch (err) {
    console.error("[createThongBao]", err);
    res.status(500).json({ error: "Lỗi khi tạo thông báo" });
  }
};

/**
 * 📢 Lấy thông báo dành cho sinh viên hiện tại
 * Gồm:
 * - Thông báo toàn trường (tatca)
 * - Thông báo theo lớp (lop + ma_lop)
 * - Thông báo cá nhân (sinhvien + ma_sinh_vien)
 */
export const getThongBaoByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy mã sinh viên + mã lớp của người dùng
    const [svRows] = await pool.query(
      "SELECT ma_sinh_vien, ma_lop FROM sinh_vien WHERE id_tai_khoan = ?",
      [userId]
    );

    if (svRows.length === 0)
      return res.status(404).json({ error: "Không tìm thấy sinh viên." });

    const { ma_sinh_vien, ma_lop } = svRows[0];

    // Truy xuất tất cả thông báo liên quan
    const [rows] = await pool.query(
      `
      SELECT * FROM thong_bao
      WHERE trang_thai = 'hienthi'
        AND (
          doi_tuong = 'tatca'
          OR (doi_tuong = 'lop' AND ma_doi_tuong = ?)
          OR (doi_tuong = 'sinhvien' AND ma_doi_tuong = ?)
        )
      ORDER BY ngay_gui DESC
      `,
      [ma_lop, ma_sinh_vien]
    );

    res.json({ data: rows });
  } catch (err) {
    console.error("[getThongBaoByUser]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách thông báo" });
  }
};

/**
 * 📘 Lấy toàn bộ thông báo (Admin)
 */
export const getAllThongBao = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM thong_bao ORDER BY ngay_gui DESC"
    );
    res.json({ data: rows });
  } catch (err) {
    console.error("[getAllThongBao]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách toàn bộ thông báo" });
  }
};
