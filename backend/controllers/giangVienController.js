import pool from "../config/db.js";

// 📘 Lấy danh sách giảng viên (tìm kiếm + join khoa)
export const getAllGiangVien = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const keyword = `%${q}%`;

    const [rows] = await pool.query(
      `SELECT gv.*, k.ten_khoa 
       FROM giang_vien gv 
       LEFT JOIN khoa k ON gv.ma_khoa = k.ma_khoa
       WHERE gv.ma_giang_vien LIKE ? 
          OR gv.ho_ten LIKE ? 
          OR gv.hoc_vi LIKE ? 
          OR gv.chuc_vu LIKE ? 
          OR k.ten_khoa LIKE ? 
          OR gv.email LIKE ?`,
      [keyword, keyword, keyword, keyword, keyword, keyword]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllGiangVien]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách giảng viên" });
  }
};

// ➕ Thêm giảng viên (Admin)
export const createGiangVien = async (req, res) => {
  try {
    const {
      ma_giang_vien,
      id_tai_khoan,
      ho_ten,
      hoc_vi,
      chuc_vu,
      ma_khoa,
      email,
      dien_thoai,
      anh_dai_dien,
    } = req.body;

    if (!ma_giang_vien || !ho_ten || !ma_khoa)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc!" });

    const [exist] = await pool.query("SELECT 1 FROM giang_vien WHERE ma_giang_vien=?", [ma_giang_vien]);
    if (exist.length) return res.status(409).json({ error: "Mã giảng viên đã tồn tại!" });

    await pool.query(
      `INSERT INTO giang_vien 
        (ma_giang_vien, id_tai_khoan, ho_ten, hoc_vi, chuc_vu, ma_khoa, email, dien_thoai, anh_dai_dien)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ma_giang_vien,
        id_tai_khoan || null,
        ho_ten,
        hoc_vi || "",
        chuc_vu || "",
        ma_khoa,
        email || "",
        dien_thoai || "",
        anh_dai_dien || null,
      ]
    );

    res.status(201).json({ message: "Thêm giảng viên thành công" });
  } catch (error) {
    console.error("[createGiangVien]", error);
    res.status(500).json({ error: "Lỗi khi thêm giảng viên" });
  }
};

// ✏️ Cập nhật giảng viên (Admin)
export const updateGiangVien = async (req, res) => {
  try {
    const { ma_giang_vien } = req.params;
    const { ho_ten, hoc_vi, chuc_vu, ma_khoa, email, dien_thoai, anh_dai_dien } = req.body;

    const [exist] = await pool.query("SELECT * FROM giang_vien WHERE ma_giang_vien=?", [ma_giang_vien]);
    if (!exist.length) return res.status(404).json({ error: "Không tìm thấy giảng viên" });

    await pool.query(
      `UPDATE giang_vien 
       SET ho_ten=?, hoc_vi=?, chuc_vu=?, ma_khoa=?, email=?, dien_thoai=?, anh_dai_dien=? 
       WHERE ma_giang_vien=?`,
      [ho_ten, hoc_vi, chuc_vu, ma_khoa, email, dien_thoai, anh_dai_dien || null, ma_giang_vien]
    );

    res.json({ message: "Cập nhật giảng viên thành công" });
  } catch (error) {
    console.error("[updateGiangVien]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật giảng viên" });
  }
};

// 🗑️ Xóa giảng viên (Admin)
export const deleteGiangVien = async (req, res) => {
  try {
    const { ma_giang_vien } = req.params;
    await pool.query("DELETE FROM giang_vien WHERE ma_giang_vien=?", [ma_giang_vien]);
    res.json({ message: "Xóa giảng viên thành công" });
  } catch (error) {
    console.error("[deleteGiangVien]", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Không thể xóa do dữ liệu liên quan" });
    res.status(500).json({ error: "Lỗi khi xóa giảng viên" });
  }
};

// 📘 Giảng viên xem thông tin cá nhân
export const getThongTinCaNhan = async (req, res) => {
  try {
    const ma_giang_vien = req.user.ma_giang_vien;
    const [rows] = await pool.query(
      `SELECT gv.*, k.ten_khoa 
       FROM giang_vien gv 
       LEFT JOIN khoa k ON gv.ma_khoa = k.ma_khoa
       WHERE gv.ma_giang_vien = ?`,
      [ma_giang_vien]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Không tìm thấy thông tin giảng viên" });

    res.json(rows[0]);
  } catch (error) {
    console.error("[getThongTinCaNhan]", error);
    res.status(500).json({ error: "Lỗi khi lấy thông tin giảng viên" });
  }
};

// ✏️ Giảng viên cập nhật thông tin cá nhân giới hạn
export const updateThongTinCaNhan = async (req, res) => {
  try {
    const ma_giang_vien = req.user.ma_giang_vien;
    const { email, dien_thoai, anh_dai_dien } = req.body;

    await pool.query(
      `UPDATE giang_vien 
       SET email=?, dien_thoai=?, anh_dai_dien=? 
       WHERE ma_giang_vien=?`,
      [email, dien_thoai, anh_dai_dien || null, ma_giang_vien]
    );

    res.json({ message: "Cập nhật thông tin cá nhân thành công" });
  } catch (error) {
    console.error("[updateThongTinCaNhan]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật thông tin cá nhân" });
  }
};
