import pool from "../config/db.js";

// 📘 Admin hoặc sinh viên xem toàn bộ thời khóa biểu (tùy quyền)
export const getAllTkb = async (req, res) => {
  try {
    const { keyword } = req.query;
    const search = `%${keyword || ""}%`;

    const [rows] = await pool.query(
      `
      SELECT tkb.*, mh.ten_mon, gv.ho_ten AS ten_giang_vien, lhp.ma_lop_hp
      FROM thoi_khoa_bieu tkb
      LEFT JOIN lop_hoc_phan lhp ON tkb.ma_lop_hp = lhp.ma_lop_hp
      LEFT JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      LEFT JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      WHERE mh.ten_mon LIKE ? OR gv.ho_ten LIKE ? OR lhp.ma_lop_hp LIKE ? OR tkb.phong_hoc LIKE ?
      ORDER BY tkb.ngay_hoc ASC, tkb.tiet_bat_dau ASC
      `,
      [search, search, search, search]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy thời khóa biểu" });
  }
};
// 📘 Sinh viên xem lịch học của chính mình
export const getTkbBySinhVien = async (req, res) => {
  try {
    const userId = req.user.id; // id_tai_khoan được decode từ token
    // Lấy mã sinh viên tương ứng với tài khoản
    const [svRows] = await pool.query(
      "SELECT ma_sinh_vien FROM sinh_vien WHERE id_tai_khoan = ?",
      [userId]
    );

    if (svRows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy sinh viên." });

    const ma_sinh_vien = svRows[0].ma_sinh_vien;

    // Truy xuất lịch học của sinh viên dựa vào các lớp học phần đã đăng ký
    const [rows] = await pool.query(
      `
      SELECT tkb.*, mh.ten_mon, gv.ho_ten AS ten_giang_vien, lhp.ma_lop_hp
      FROM thoi_khoa_bieu tkb
      JOIN lop_hoc_phan lhp ON tkb.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      JOIN dang_ky_mon dk ON dk.ma_lop_hp = lhp.ma_lop_hp
      WHERE dk.ma_sinh_vien = ?
      ORDER BY tkb.ngay_hoc ASC, tkb.tiet_bat_dau ASC
      `,
      [ma_sinh_vien]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thời khóa biểu sinh viên:", error);
    res.status(500).json({ error: "Lỗi khi lấy thời khóa biểu của sinh viên." });
  }
};

// ➕ Admin thêm buổi học
export const createTkb = async (req, res) => {
  try {
    const {
      ma_lop_hp,
      tuan_hoc,
      ngay_hoc,
      thu_trong_tuan,
      tiet_bat_dau,
      tiet_ket_thuc,
      phong_hoc,
      trang_thai,
    } = req.body;

    await pool.query(
      `
      INSERT INTO thoi_khoa_bieu 
      (ma_lop_hp, tuan_hoc, ngay_hoc, thu_trong_tuan, tiet_bat_dau, tiet_ket_thuc, phong_hoc, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ma_lop_hp,
        tuan_hoc,
        ngay_hoc,
        thu_trong_tuan,
        tiet_bat_dau,
        tiet_ket_thuc,
        phong_hoc,
        trang_thai || "hoc",
      ]
    );

    res.status(201).json({ message: "✅ Thêm buổi học thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm thời khóa biểu" });
  }
};

// ✏️ Cập nhật buổi học
export const updateTkb = async (req, res) => {
  try {
    const { id_tkb } = req.params;
    const {
      ma_lop_hp,
      tuan_hoc,
      ngay_hoc,
      thu_trong_tuan,
      tiet_bat_dau,
      tiet_ket_thuc,
      phong_hoc,
      trang_thai,
    } = req.body;

    await pool.query(
      `
      UPDATE thoi_khoa_bieu 
      SET ma_lop_hp=?, tuan_hoc=?, ngay_hoc=?, thu_trong_tuan=?, tiet_bat_dau=?, tiet_ket_thuc=?, phong_hoc=?, trang_thai=?
      WHERE id_tkb=?
      `,
      [
        ma_lop_hp,
        tuan_hoc,
        ngay_hoc,
        thu_trong_tuan,
        tiet_bat_dau,
        tiet_ket_thuc,
        phong_hoc,
        trang_thai,
        id_tkb,
      ]
    );

    res.json({ message: "✅ Cập nhật thời khóa biểu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật thời khóa biểu" });
  }
};

// 🗑️ Xóa buổi học
export const deleteTkb = async (req, res) => {
  try {
    const { id_tkb } = req.params;
    await pool.query("DELETE FROM thoi_khoa_bieu WHERE id_tkb = ?", [id_tkb]);
    res.json({ message: "🗑️ Xóa buổi học thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa buổi học" });
  }
};
