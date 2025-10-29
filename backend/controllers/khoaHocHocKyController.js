import pool from "../config/db.js";

/* ---------------------- 🧩 KHÓA HỌC CRUD ---------------------- */

// 📘 Lấy danh sách khóa học (kèm số học kỳ)
export const getAllKhoaHoc = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT kh.*, COUNT(hk.ma_hoc_ky) AS so_hoc_ky
      FROM khoa_hoc kh
      LEFT JOIN hoc_ky hk ON kh.ma_khoa_hoc = hk.ma_khoa_hoc
      GROUP BY kh.ma_khoa_hoc
      ORDER BY kh.nam_bat_dau DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllKhoaHoc]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách khóa học" });
  }
};

// ➕ Thêm khóa học
export const createKhoaHoc = async (req, res) => {
  try {
    const { ma_khoa_hoc, ten_khoa_hoc, nam_bat_dau, nam_ket_thuc } = req.body;
    if (!ma_khoa_hoc || !ten_khoa_hoc)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    const [exist] = await pool.query("SELECT 1 FROM khoa_hoc WHERE ma_khoa_hoc = ?", [ma_khoa_hoc]);
    if (exist.length) return res.status(409).json({ error: "Mã khóa học đã tồn tại" });

    await pool.query(
      `INSERT INTO khoa_hoc (ma_khoa_hoc, ten_khoa_hoc, nam_bat_dau, nam_ket_thuc)
       VALUES (?, ?, ?, ?)`,
      [ma_khoa_hoc, ten_khoa_hoc, nam_bat_dau || null, nam_ket_thuc || null]
    );

    res.status(201).json({ message: "✅ Thêm khóa học thành công" });
  } catch (error) {
    console.error("[createKhoaHoc]", error);
    res.status(500).json({ error: "Lỗi khi thêm khóa học" });
  }
};

// ✏️ Sửa khóa học
export const updateKhoaHoc = async (req, res) => {
  try {
    const { ma_khoa_hoc } = req.params;
    const { ten_khoa_hoc, nam_bat_dau, nam_ket_thuc } = req.body;

    const [exist] = await pool.query("SELECT * FROM khoa_hoc WHERE ma_khoa_hoc=?", [ma_khoa_hoc]);
    if (!exist.length) return res.status(404).json({ error: "Không tìm thấy khóa học" });

    await pool.query(
      `UPDATE khoa_hoc 
       SET ten_khoa_hoc=?, nam_bat_dau=?, nam_ket_thuc=? 
       WHERE ma_khoa_hoc=?`,
      [ten_khoa_hoc, nam_bat_dau || null, nam_ket_thuc || null, ma_khoa_hoc]
    );

    res.json({ message: "✅ Cập nhật khóa học thành công" });
  } catch (error) {
    console.error("[updateKhoaHoc]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật khóa học" });
  }
};

// 🗑️ Xóa khóa học
export const deleteKhoaHoc = async (req, res) => {
  try {
    const { ma_khoa_hoc } = req.params;
    await pool.query("DELETE FROM khoa_hoc WHERE ma_khoa_hoc=?", [ma_khoa_hoc]);
    res.json({ message: "🗑️ Xóa khóa học thành công" });
  } catch (error) {
    console.error("[deleteKhoaHoc]", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Không thể xóa vì còn học kỳ liên kết" });
    res.status(500).json({ error: "Lỗi khi xóa khóa học" });
  }
};

/* ---------------------- 🎓 HỌC KỲ CRUD ---------------------- */

// 📘 Lấy học kỳ theo khóa học (hoặc toàn bộ)
export const getAllHocKy = async (req, res) => {
  try {
    const { ma_khoa_hoc, q = "" } = req.query;
    const keyword = `%${q}%`;
    let sql = `
      SELECT hk.*, kh.ten_khoa_hoc
      FROM hoc_ky hk
      LEFT JOIN khoa_hoc kh ON hk.ma_khoa_hoc = kh.ma_khoa_hoc
      WHERE (hk.ma_hoc_ky LIKE ? OR hk.ten_hoc_ky LIKE ? OR hk.nam_hoc LIKE ?)
    `;
    const params = [keyword, keyword, keyword];

    if (ma_khoa_hoc) {
      sql += " AND hk.ma_khoa_hoc = ?";
      params.push(ma_khoa_hoc);
    }

    sql += " ORDER BY hk.nam_hoc DESC, hk.ma_hoc_ky ASC";
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllHocKy]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách học kỳ" });
  }
};

// ➕ Thêm học kỳ (thuộc 1 khóa học)
export const createHocKy = async (req, res) => {
  try {
    const { ma_hoc_ky, ten_hoc_ky, nam_hoc, ma_khoa_hoc, da_khoa, ngay_bat_dau, ngay_ket_thuc } = req.body;

    if (!ma_hoc_ky || !ten_hoc_ky || !nam_hoc)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    const [exist] = await pool.query("SELECT 1 FROM hoc_ky WHERE ma_hoc_ky = ?", [ma_hoc_ky]);
    if (exist.length) return res.status(409).json({ error: "Mã học kỳ đã tồn tại" });

    await pool.query(
      `INSERT INTO hoc_ky (ma_hoc_ky, ten_hoc_ky, nam_hoc, ma_khoa_hoc, da_khoa, ngay_bat_dau, ngay_ket_thuc)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ma_hoc_ky, ten_hoc_ky, nam_hoc, ma_khoa_hoc || null, da_khoa ? 1 : 0, ngay_bat_dau || null, ngay_ket_thuc || null]
    );

    res.status(201).json({ message: "✅ Thêm học kỳ thành công" });
  } catch (error) {
    console.error("[createHocKy]", error);
    res.status(500).json({ error: "Lỗi khi thêm học kỳ" });
  }
};

// ✏️ Cập nhật học kỳ
export const updateHocKy = async (req, res) => {
  try {
    const { ma_hoc_ky } = req.params;
    const { ten_hoc_ky, nam_hoc, ma_khoa_hoc, da_khoa, ngay_bat_dau, ngay_ket_thuc } = req.body;

    const [exist] = await pool.query("SELECT * FROM hoc_ky WHERE ma_hoc_ky=?", [ma_hoc_ky]);
    if (!exist.length) return res.status(404).json({ error: "Không tìm thấy học kỳ" });

    await pool.query(
      `UPDATE hoc_ky 
       SET ten_hoc_ky=?, nam_hoc=?, ma_khoa_hoc=?, da_khoa=?, ngay_bat_dau=?, ngay_ket_thuc=?
       WHERE ma_hoc_ky=?`,
      [ten_hoc_ky, nam_hoc, ma_khoa_hoc || null, da_khoa ? 1 : 0, ngay_bat_dau || null, ngay_ket_thuc || null, ma_hoc_ky]
    );

    res.json({ message: "✅ Cập nhật học kỳ thành công" });
  } catch (error) {
    console.error("[updateHocKy]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật học kỳ" });
  }
};

// 🗑️ Xóa học kỳ
export const deleteHocKy = async (req, res) => {
  try {
    const { ma_hoc_ky } = req.params;
    await pool.query("DELETE FROM hoc_ky WHERE ma_hoc_ky=?", [ma_hoc_ky]);
    res.json({ message: "🗑️ Xóa học kỳ thành công" });
  } catch (error) {
    console.error("[deleteHocKy]", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Không thể xóa do dữ liệu liên quan" });
    res.status(500).json({ error: "Lỗi khi xóa học kỳ" });
  }
};
