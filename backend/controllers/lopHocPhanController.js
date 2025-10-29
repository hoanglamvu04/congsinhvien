import pool from "../config/db.js";

export const getAllLopHocPhan = async (req, res) => {
  try {
    const { q, trang_thai } = req.query;

    let sql = `
      SELECT lhp.*, 
             mh.ten_mon, 
             gv.ho_ten AS ten_giang_vien, 
             hk.ten_hoc_ky, 
             hk.ma_hoc_ky,
             (SELECT COUNT(*) 
              FROM dang_ky_mon dk 
              WHERE dk.ma_lop_hp = lhp.ma_lop_hp 
              AND dk.trang_thai = 'dangky') AS so_luong_da_dang_ky
      FROM lop_hoc_phan lhp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      LEFT JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      WHERE 1=1
    `;
    const params = [];

    if (q) {
      sql += ` AND (mh.ten_mon LIKE ? OR gv.ho_ten LIKE ? OR lhp.ma_lop_hp LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (trang_thai) {
      sql += ` AND lhp.trang_thai = ?`;
      params.push(trang_thai);
    }

    sql += ` ORDER BY hk.ma_hoc_ky DESC, mh.ten_mon ASC`;

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    console.error("[getAllLopHocPhan]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách lớp học phần" });
  }
};
// 📘 Giảng viên xem danh sách lớp mình dạy
export const getLopHocPhanByGiangVien = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy mã giảng viên
    const [gv] = await pool.query("SELECT ma_giang_vien FROM giang_vien WHERE id_tai_khoan=?", [userId]);
    if (!gv.length) return res.status(404).json({ error: "Không tìm thấy giảng viên" });

    const ma_giang_vien = gv[0].ma_giang_vien;

    const [rows] = await pool.query(
      `SELECT lhp.*, mh.ten_mon, hk.ten_hoc_ky
       FROM lop_hoc_phan lhp
       JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
       JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
       WHERE lhp.ma_giang_vien = ?
       ORDER BY hk.ma_hoc_ky DESC`,
      [ma_giang_vien]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error("[getLopHocPhanByGiangVien]", error);
    res.status(500).json({ error: "Lỗi khi lấy lớp học phần của giảng viên" });
  }
};

// 📘 Chi tiết lớp học phần (dành cho giảng viên)
export const getChiTietLopHocPhan = async (req, res) => {
  try {
    const { ma_lop_hp } = req.params;

    // 1️⃣ Thông tin lớp học phần
    const [lop] = await pool.query(
      `SELECT lhp.*, mh.ten_mon, hk.ten_hoc_ky, gv.ho_ten AS ten_giang_vien
       FROM lop_hoc_phan lhp
       JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
       JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
       JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
       WHERE lhp.ma_lop_hp = ?`,
      [ma_lop_hp]
    );

    if (!lop.length) return res.status(404).json({ error: "Không tìm thấy lớp học phần" });

    // 2️⃣ Danh sách sinh viên đăng ký
    const [sinhVien] = await pool.query(
      `SELECT sv.ma_sinh_vien, sv.ho_ten, sv.email, sv.dien_thoai
       FROM dang_ky_mon dk
       JOIN sinh_vien sv ON dk.ma_sinh_vien = sv.ma_sinh_vien
       WHERE dk.ma_lop_hp = ?`,
      [ma_lop_hp]
    );

    // 3️⃣ Lịch học (theo thời khóa biểu)
    const [lichHoc] = await pool.query(
      `SELECT ngay_hoc, thu_trong_tuan, tiet_bat_dau, tiet_ket_thuc, phong_hoc, trang_thai
       FROM thoi_khoa_bieu
       WHERE ma_lop_hp = ?
       ORDER BY ngay_hoc ASC`,
      [ma_lop_hp]
    );

    res.json({
      lop_hoc_phan: lop[0],
      danh_sach_sinh_vien: sinhVien,
      lich_hoc: lichHoc,
    });

  } catch (error) {
    console.error("[getChiTietLopHocPhan]", error);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết lớp học phần" });
  }
};

// ➕ Thêm lớp học phần
export const createLopHocPhan = async (req, res) => {
  try {
    const {
      ma_lop_hp,
      ma_mon,
      ma_giang_vien,
      ma_hoc_ky,
      phong_hoc,
      lich_hoc,
      gioi_han_dang_ky,
      trang_thai,
    } = req.body;

    if (!ma_lop_hp || !ma_mon || !ma_hoc_ky)
      return res.status(400).json({ error: "Thiếu mã lớp, môn hoặc học kỳ" });

    const [exist] = await pool.query("SELECT * FROM lop_hoc_phan WHERE ma_lop_hp = ?", [ma_lop_hp]);
    if (exist.length)
      return res.status(409).json({ error: "Mã lớp học phần đã tồn tại" });

    await pool.query(
      `INSERT INTO lop_hoc_phan 
        (ma_lop_hp, ma_mon, ma_giang_vien, ma_hoc_ky, phong_hoc, lich_hoc, gioi_han_dang_ky, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ma_lop_hp,
        ma_mon,
        ma_giang_vien || null,
        ma_hoc_ky,
        phong_hoc || null,
        lich_hoc || null,
        gioi_han_dang_ky || 0,
        trang_thai || "dangmo",
      ]
    );

    res.status(201).json({ message: "Thêm lớp học phần thành công" });
  } catch (error) {
    console.error("[createLopHocPhan]", error);
    res.status(500).json({ error: "Lỗi khi thêm lớp học phần" });
  }
};

export const updateLopHocPhan = async (req, res) => {
  try {
    const { ma_lop_hp } = req.params;
    const {
      ma_mon,
      ma_giang_vien,
      ma_hoc_ky,
      phong_hoc,
      lich_hoc,
      gioi_han_dang_ky,
      trang_thai,
      tien_do, // ✅ thêm
      so_luong_da_dang_ky, // ✅ thêm
    } = req.body;

    await pool.query(
      `UPDATE lop_hoc_phan 
       SET ma_mon=?, ma_giang_vien=?, ma_hoc_ky=?, phong_hoc=?, lich_hoc=?, gioi_han_dang_ky=?, trang_thai=?, tien_do=?, so_luong_da_dang_ky=? 
       WHERE ma_lop_hp=?`,
      [
        ma_mon,
        ma_giang_vien,
        ma_hoc_ky,
        phong_hoc,
        lich_hoc,
        gioi_han_dang_ky,
        trang_thai,
        tien_do || "chuahoctap",
        so_luong_da_dang_ky || 0,
        ma_lop_hp,
      ]
    );

    res.json({ message: "✅ Cập nhật lớp học phần thành công" });
  } catch (error) {
    console.error("[updateLopHocPhan]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật lớp học phần" });
  }
};

// 🗑️ Xóa lớp học phần
export const deleteLopHocPhan = async (req, res) => {
  try {
    const { ma_lop_hp } = req.params;
    await pool.query("DELETE FROM lop_hoc_phan WHERE ma_lop_hp = ?", [ma_lop_hp]);
    res.json({ message: "Xóa lớp học phần thành công" });
  } catch (error) {
    console.error("[deleteLopHocPhan]", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Không thể xóa do có dữ liệu liên quan" });
    res.status(500).json({ error: "Lỗi khi xóa lớp học phần" });
  }
};
