import pool from "../config/db.js";

// 📘 Lấy danh sách lớp học phần
export const getAllLopHocPhan = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT lhp.*, mh.ten_mon, gv.ho_ten AS ten_giang_vien, hk.ten_hoc_ky
      FROM lop_hoc_phan lhp
      LEFT JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      LEFT JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      LEFT JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách lớp học phần" });
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
      trang_thai
    } = req.body;

    await pool.query(
      `INSERT INTO lop_hoc_phan 
      (ma_lop_hp, ma_mon, ma_giang_vien, ma_hoc_ky, phong_hoc, lich_hoc, gioi_han_dang_ky, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ma_lop_hp,
        ma_mon,
        ma_giang_vien,
        ma_hoc_ky,
        phong_hoc || null,
        lich_hoc || null,
        gioi_han_dang_ky || null,
        trang_thai || "dangmo"
      ]
    );

    res.status(201).json({ message: "Thêm lớp học phần thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm lớp học phần" });
  }
};

// ✏️ Cập nhật lớp học phần
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
      trang_thai
    } = req.body;

    await pool.query(
      `UPDATE lop_hoc_phan 
       SET ma_mon=?, ma_giang_vien=?, ma_hoc_ky=?, phong_hoc=?, lich_hoc=?, gioi_han_dang_ky=?, trang_thai=? 
       WHERE ma_lop_hp=?`,
      [
        ma_mon,
        ma_giang_vien,
        ma_hoc_ky,
        phong_hoc,
        lich_hoc,
        gioi_han_dang_ky,
        trang_thai,
        ma_lop_hp
      ]
    );

    res.json({ message: "Cập nhật lớp học phần thành công" });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa lớp học phần" });
  }
};
