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
    const [rows] = await pool.query(`
      SELECT id_thong_bao, tieu_de, noi_dung, nguoi_gui, doi_tuong, ma_doi_tuong,
             tep_dinh_kem, trang_thai, ngay_gui
      FROM thong_bao
      ORDER BY ngay_gui DESC
    `);
    res.json(rows); // ← trả về mảng trực tiếp (FE đang dùng res.data)
  } catch (err) {
    console.error("[getAllThongBao]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách toàn bộ thông báo" });
  }
};

/**
 * 🧑‍🏫 Giảng viên gửi thông báo đến lớp học phần mình dạy
 */
export const createThongBaoGiangVien = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ma_lop_hp, tieu_de, noi_dung, tep_dinh_kem } = req.body;

    if (!ma_lop_hp || !tieu_de || !noi_dung) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc." });
    }

    // 🔍 Lấy mã giảng viên theo tài khoản
    const [gvRows] = await pool.query(
      "SELECT ma_giang_vien, ho_ten FROM giang_vien WHERE id_tai_khoan = ?",
      [userId]
    );

    if (gvRows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy giảng viên." });
    }

    const { ma_giang_vien, ho_ten } = gvRows[0];

    // 🔍 Kiểm tra xem lớp có thuộc giảng viên này không
    const [check] = await pool.query(
      "SELECT * FROM lop_hoc_phan WHERE ma_lop_hp = ? AND ma_giang_vien = ?",
      [ma_lop_hp, ma_giang_vien]
    );

    if (check.length === 0) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền gửi thông báo cho lớp này." });
    }

    // ✅ Gửi thông báo
    await pool.query(
      `
      INSERT INTO thong_bao (tieu_de, noi_dung, nguoi_gui, doi_tuong, ma_doi_tuong, tep_dinh_kem, trang_thai)
      VALUES (?, ?, ?, 'lophocphan', ?, ?, 'hienthi')
      `,
      [tieu_de, noi_dung, ho_ten, ma_lop_hp, tep_dinh_kem || null]
    );

    res.status(201).json({ message: "✅ Gửi thông báo thành công." });
  } catch (err) {
    console.error("[createThongBaoGiangVien]", err);
    res.status(500).json({ error: "Lỗi khi giảng viên gửi thông báo." });
  }
};
