import pool from "../config/db.js";

// 📘 Lấy danh sách lớp học phần (có tìm kiếm)
export const getAllLopHocPhan = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const keyword = `%${q}%`;

    const [rows] = await pool.query(
      `SELECT lhp.*, 
              mh.ten_mon, 
              gv.ho_ten AS ten_giang_vien, 
              hk.ten_hoc_ky
       FROM lop_hoc_phan lhp
       LEFT JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
       LEFT JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
       LEFT JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
       WHERE lhp.ma_lop_hp LIKE ? 
          OR mh.ten_mon LIKE ? 
          OR gv.ho_ten LIKE ? 
          OR hk.ten_hoc_ky LIKE ?`,
      [keyword, keyword, keyword, keyword]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllLopHocPhan]", error);
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
      trang_thai,
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
        ma_lop_hp,
      ]
    );

    res.json({ message: "Cập nhật lớp học phần thành công" });
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
