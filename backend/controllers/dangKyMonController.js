import pool from "../config/db.js";

// 📘 Xem danh sách môn đã đăng ký
export const getMonDaDangKy = async (req, res) => {
  try {
    const user = req.user;
    const [rows] = await pool.query(
      `
      SELECT dk.*, mh.ten_mon, lhp.phong_hoc, hk.ten_hoc_ky, gv.ho_ten AS giang_vien
      FROM dang_ky_mon dk
      JOIN lop_hoc_phan lhp ON dk.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      LEFT JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      WHERE dk.ma_sinh_vien = ? AND dk.trang_thai = 'dangky'
      ORDER BY hk.ten_hoc_ky DESC
      `,
      [user.ma_sinh_vien]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error("[getMonDaDangKy]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách môn đã đăng ký" });
  }
};

// ➕ Sinh viên đăng ký lớp học phần
export const dangKyMon = async (req, res) => {
  try {
    const user = req.user;
    const { ma_lop_hp, loai_dang_ky } = req.body;

    // Kiểm tra trùng đăng ký
    const [exist] = await pool.query(
      `SELECT * FROM dang_ky_mon 
       WHERE ma_sinh_vien=? AND ma_lop_hp=? AND trang_thai='dangky'`,
      [user.ma_sinh_vien, ma_lop_hp]
    );
    if (exist.length)
      return res.status(409).json({ error: "Bạn đã đăng ký lớp học phần này rồi" });

    // Kiểm tra trạng thái lớp
    const [lop] = await pool.query(
      `SELECT trang_thai, gioi_han_dang_ky, 
              (SELECT COUNT(*) FROM dang_ky_mon WHERE ma_lop_hp=lhp.ma_lop_hp AND trang_thai='dangky') AS da_dang_ky
       FROM lop_hoc_phan lhp WHERE ma_lop_hp=?`,
      [ma_lop_hp]
    );
    if (!lop.length) return res.status(404).json({ error: "Không tìm thấy lớp học phần" });
    if (lop[0].trang_thai === "dong")
      return res.status(400).json({ error: "Lớp học phần đã đóng đăng ký" });
    if (lop[0].gioi_han_dang_ky && lop[0].da_dang_ky >= lop[0].gioi_han_dang_ky)
      return res.status(400).json({ error: "Lớp học phần đã đầy" });

    await pool.query(
      `INSERT INTO dang_ky_mon (ma_sinh_vien, ma_lop_hp, lan_hoc, loai_dang_ky, trang_thai)
       VALUES (?, ?, 1, ?, 'dangky')`,
      [user.ma_sinh_vien, ma_lop_hp, loai_dang_ky || "hoc_moi"]
    );

    res.status(201).json({ message: "✅ Đăng ký môn học thành công!" });
  } catch (error) {
    console.error("[dangKyMon]", error);
    res.status(500).json({ error: "Lỗi khi đăng ký môn học" });
  }
};

// 🗑️ Hủy đăng ký
export const huyDangKy = async (req, res) => {
  try {
    const user = req.user;
    const { ma_lop_hp } = req.params;

    const [affected] = await pool.query(
      "UPDATE dang_ky_mon SET trang_thai='huy' WHERE ma_sinh_vien=? AND ma_lop_hp=?",
      [user.ma_sinh_vien, ma_lop_hp]
    );

    if (!affected.affectedRows)
      return res.status(404).json({ error: "Không tìm thấy đăng ký cần hủy" });

    res.json({ message: "✅ Hủy đăng ký thành công" });
  } catch (error) {
    console.error("[huyDangKy]", error);
    res.status(500).json({ error: "Lỗi khi hủy đăng ký" });
  }
};
export const getAllDangKy = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT dk.ma_sinh_vien, sv.ho_ten AS ten_sinh_vien, 
             dk.ma_lop_hp, dk.loai_dang_ky, dk.trang_thai, ngay_dang_ky,
             mh.ten_mon, hk.ten_hoc_ky, gv.ho_ten AS giang_vien
      FROM dang_ky_mon dk
      JOIN sinh_vien sv ON dk.ma_sinh_vien = sv.ma_sinh_vien
      JOIN lop_hoc_phan lhp ON dk.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      LEFT JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      ORDER BY dk.ma_sinh_vien, mh.ten_mon
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllDangKy]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách đăng ký môn học" });
  }
};
