import pool from "../config/db.js";

// 📘 Sinh viên xem thời khóa biểu
export const getThoiKhoaBieu = async (req, res) => {
  try {
    const user = req.user;
    const [rows] = await pool.query(`
      SELECT tkb.*, mh.ten_mon, gv.ho_ten AS giang_vien, lhp.ma_lop_hp
      FROM thoi_khoa_bieu tkb
      JOIN lop_hoc_phan lhp ON tkb.ma_lop_hp = lhp.ma_lop_hp
      JOIN dang_ky_mon dk ON dk.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      LEFT JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      WHERE dk.ma_sinh_vien = ? AND dk.trang_thai = 'dangky'
      ORDER BY tkb.ngay_hoc, tkb.tiet_bat_dau
    `, [user.ma_sinh_vien]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy thời khóa biểu" });
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
      trang_thai
    } = req.body;

    await pool.query(
      `INSERT INTO thoi_khoa_bieu 
       (ma_lop_hp, tuan_hoc, ngay_hoc, thu_trong_tuan, tiet_bat_dau, tiet_ket_thuc, phong_hoc, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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

    res.status(201).json({ message: "Thêm buổi học vào thời khóa biểu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm thời khóa biểu" });
  }
};
