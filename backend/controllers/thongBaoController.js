import pool from "../config/db.js";

/**
 * 📨 Tạo thông báo (Admin / Phòng đào tạo / Khoa)
 */
export const createThongBao = async (req, res) => {
  try {
    const {
      tieu_de,
      noi_dung,
      doi_tuong,
      ma_doi_tuong,
      tep_dinh_kem,
      trang_thai,
    } = req.body;

    const nguoi_gui = req.user?.username || "Hệ thống";
    const filter = req.filter || {}; // lấy khoa nếu có

    await pool.query(
      `
      INSERT INTO thong_bao (tieu_de, noi_dung, nguoi_gui, doi_tuong, ma_doi_tuong, ma_khoa, tep_dinh_kem, trang_thai, ngay_gui)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        tieu_de,
        noi_dung,
        nguoi_gui,
        doi_tuong,
        ma_doi_tuong || null,
        filter.ma_khoa || null,
        tep_dinh_kem || null,
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
 * 📢 Lấy thông báo dành cho người dùng (Sinh viên)
 */
export const getThongBaoByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const [svRows] = await pool.query(
      "SELECT ma_sinh_vien, ma_lop, ma_khoa FROM sinh_vien WHERE id_tai_khoan = ?",
      [userId]
    );

    if (!svRows.length)
      return res.status(404).json({ error: "Không tìm thấy sinh viên" });

    const { ma_sinh_vien, ma_lop, ma_khoa } = svRows[0];

    const [rows] = await pool.query(
      `
      SELECT * FROM thong_bao
      WHERE trang_thai = 'hienthi'
        AND (
          doi_tuong = 'tatca'
          OR (doi_tuong = 'lop' AND ma_doi_tuong = ?)
          OR (doi_tuong = 'sinhvien' AND ma_doi_tuong = ?)
          OR (doi_tuong = 'khoa' AND ma_doi_tuong = ?)
        )
      ORDER BY ngay_gui DESC
      `,
      [ma_lop, ma_sinh_vien, ma_khoa]
    );

    res.json({ data: rows });
  } catch (err) {
    console.error("[getThongBaoByUser]", err);
    res.status(500).json({ error: "Lỗi khi lấy thông báo" });
  }
};

/**
 * 🧭 Lấy thông báo theo khoa (dùng filterByDepartment)
 */
export const getThongBaoTheoKhoa = async (req, res) => {
  try {
    const filter = req.filter || {};
    const params = [];
    let sql = `
      SELECT tb.*, k.ten_khoa
      FROM thong_bao tb
      LEFT JOIN khoa k ON tb.ma_khoa = k.ma_khoa
      WHERE 1=1
    `;

    if (!filter.all && filter.ma_khoa) {
      sql += " AND tb.ma_khoa = ?";
      params.push(filter.ma_khoa);
    }

    sql += " ORDER BY tb.ngay_gui DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    console.error("[getThongBaoTheoKhoa]", err);
    res.status(500).json({ error: "Lỗi khi lấy thông báo theo khoa" });
  }
};

/**
 * 🧾 Lấy toàn bộ thông báo (Admin)
 */
export const getAllThongBao = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tb.*, k.ten_khoa
      FROM thong_bao tb
      LEFT JOIN khoa k ON tb.ma_khoa = k.ma_khoa
      ORDER BY tb.ngay_gui DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    console.error("[getAllThongBao]", err);
    res.status(500).json({ error: "Lỗi khi lấy toàn bộ thông báo" });
  }
};

/**
 * 🧑‍🏫 Giảng viên gửi thông báo đến lớp học phần
 */
export const createThongBaoGiangVien = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ma_lop_hp, tieu_de, noi_dung, tep_dinh_kem } = req.body;

    if (!ma_lop_hp || !tieu_de || !noi_dung) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc." });
    }

    const [gvRows] = await pool.query(
      "SELECT ma_giang_vien, ho_ten FROM giang_vien WHERE id_tai_khoan = ?",
      [userId]
    );
    if (!gvRows.length)
      return res.status(404).json({ error: "Không tìm thấy giảng viên." });

    const { ma_giang_vien, ho_ten } = gvRows[0];

    const [check] = await pool.query(
      "SELECT * FROM lop_hoc_phan WHERE ma_lop_hp = ? AND ma_giang_vien = ?",
      [ma_lop_hp, ma_giang_vien]
    );
    if (!check.length)
      return res
        .status(403)
        .json({ error: "Không có quyền gửi thông báo cho lớp này." });

    await pool.query(
      `
      INSERT INTO thong_bao (tieu_de, noi_dung, nguoi_gui, doi_tuong, ma_doi_tuong, tep_dinh_kem, trang_thai, ngay_gui)
      VALUES (?, ?, ?, 'lophocphan', ?, ?, 'hienthi', NOW())
      `,
      [tieu_de, noi_dung, ho_ten, ma_lop_hp, tep_dinh_kem || null]
    );

    res.status(201).json({ message: "✅ Gửi thông báo thành công." });
  } catch (err) {
    console.error("[createThongBaoGiangVien]", err);
    res.status(500).json({ error: "Lỗi khi giảng viên gửi thông báo." });
  }
};

/**
 * ❌ Xóa thông báo (Admin/PDT/Khoa)
 */
export const deleteThongBao = async (req, res) => {
  try {
    const { id_thong_bao } = req.params;
    await pool.query("DELETE FROM thong_bao WHERE id_thong_bao = ?", [
      id_thong_bao,
    ]);
    res.json({ message: "🗑️ Đã xóa thông báo." });
  } catch (err) {
    console.error("[deleteThongBao]", err);
    res.status(500).json({ error: "Lỗi khi xóa thông báo." });
  }
};
