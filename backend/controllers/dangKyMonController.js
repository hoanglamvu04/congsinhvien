import pool from "../config/db.js";

// 📘 Sinh viên xem danh sách môn đã đăng ký
export const getMonDaDangKy = async (req, res) => {
  try {
    const user = req.user;
    const [rows] = await pool.query(`
      SELECT dk.*, mh.ten_mon, lhp.phong_hoc, hk.ten_hoc_ky, gv.ho_ten AS giang_vien
      FROM dang_ky_mon dk
      JOIN lop_hoc_phan lhp ON dk.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      LEFT JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      WHERE dk.ma_sinh_vien = ? AND dk.trang_thai = 'dangky'
    `, [user.ma_sinh_vien]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách môn đã đăng ký" });
  }
};

// ➕ Sinh viên đăng ký lớp học phần
export const dangKyMon = async (req, res) => {
  try {
    const user = req.user;
    const { ma_lop_hp, loai_dang_ky } = req.body;

    await pool.query(
      `INSERT INTO dang_ky_mon (ma_sinh_vien, ma_lop_hp, lan_hoc, loai_dang_ky, trang_thai)
       VALUES (?, ?, 1, ?, 'dangky')`,
      [user.ma_sinh_vien, ma_lop_hp, loai_dang_ky || 'hoc_moi']
    );

    res.status(201).json({ message: "Đăng ký môn học thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi đăng ký môn học" });
  }
};

// 🗑️ Hủy đăng ký
export const huyDangKy = async (req, res) => {
  try {
    const user = req.user;
    const { ma_lop_hp } = req.params;
    await pool.query(
      "UPDATE dang_ky_mon SET trang_thai='huy' WHERE ma_sinh_vien=? AND ma_lop_hp=?",
      [user.ma_sinh_vien, ma_lop_hp]
    );
    res.json({ message: "Hủy đăng ký thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi hủy đăng ký" });
  }
};
