import pool from "../config/db.js";

/**
 * 📘 Lấy danh sách khen thưởng
 * - Sinh viên: chỉ xem của mình
 * - Admin: xem toàn bộ hoặc tìm kiếm theo từ khóa
 */
export const getAllKhenThuong = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === "admin";
    const { q = "" } = req.query;
    const keyword = `%${q}%`;

    let sql = `
      SELECT kt.*, sv.ho_ten, k.ten_khoa
      FROM khen_thuong kt
      LEFT JOIN sinh_vien sv ON kt.ma_sinh_vien = sv.ma_sinh_vien
      LEFT JOIN khoa k ON kt.ma_khoa = k.ma_khoa
    `;
    const params = [];

    if (isAdmin) {
      sql += `
        WHERE kt.ma_sinh_vien LIKE ?
           OR sv.ho_ten LIKE ?
           OR k.ten_khoa LIKE ?
           OR kt.noi_dung LIKE ?
      `;
      params.push(keyword, keyword, keyword, keyword);
    } else {
      sql += " WHERE kt.ma_sinh_vien = ?";
      params.push(user.ma_sinh_vien);
    }

    sql += " ORDER BY ngay_khen_thuong DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllKhenThuong]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách khen thưởng" });
  }
};
export const getKhenThuongBySinhVien = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT kt.*
      FROM khen_thuong kt
      WHERE kt.ma_sinh_vien = ?
      ORDER BY kt.ngay_khen_thuong DESC
    `, [id]);

    res.json(rows);
  } catch (error) {
    console.error("❌ Lỗi khi lấy khen thưởng:", error);
    res.status(500).json({ error: "Không thể lấy thông tin khen thưởng" });
  }
};
/**
 * ➕ Thêm khen thưởng (Admin)
 */
export const createKhenThuong = async (req, res) => {
  try {
    const { ma_sinh_vien, ma_khoa, ngay_khen_thuong, noi_dung, so_tien } = req.body;

    if (!ma_sinh_vien || !ngay_khen_thuong || !noi_dung)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    await pool.query(
      `
      INSERT INTO khen_thuong (ma_sinh_vien, ma_khoa, ngay_khen_thuong, noi_dung, so_tien)
      VALUES (?, ?, ?, ?, ?)
      `,
      [ma_sinh_vien, ma_khoa || null, ngay_khen_thuong, noi_dung, so_tien || 0]
    );

    res.status(201).json({ message: "Thêm khen thưởng thành công" });
  } catch (error) {
    console.error("[createKhenThuong]", error);
    res.status(500).json({ error: "Lỗi khi thêm khen thưởng" });
  }
};

/**
 * ✏️ Cập nhật khen thưởng (Admin)
 */
export const updateKhenThuong = async (req, res) => {
  try {
    const { id_khen_thuong } = req.params;
    const { ma_sinh_vien, ma_khoa, ngay_khen_thuong, noi_dung, so_tien } = req.body;

    const [exist] = await pool.query("SELECT * FROM khen_thuong WHERE id_khen_thuong=?", [
      id_khen_thuong,
    ]);
    if (!exist.length) return res.status(404).json({ error: "Không tìm thấy bản ghi" });

    await pool.query(
      `
      UPDATE khen_thuong
      SET ma_sinh_vien=?, ma_khoa=?, ngay_khen_thuong=?, noi_dung=?, so_tien=?
      WHERE id_khen_thuong=?
      `,
      [ma_sinh_vien, ma_khoa, ngay_khen_thuong, noi_dung, so_tien, id_khen_thuong]
    );

    res.json({ message: "Cập nhật khen thưởng thành công" });
  } catch (error) {
    console.error("[updateKhenThuong]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật khen thưởng" });
  }
};

/**
 * 🗑️ Xóa khen thưởng (Admin)
 */
export const deleteKhenThuong = async (req, res) => {
  try {
    const { id_khen_thuong } = req.params;
    await pool.query("DELETE FROM khen_thuong WHERE id_khen_thuong=?", [id_khen_thuong]);
    res.json({ message: "Xóa khen thưởng thành công" });
  } catch (error) {
    console.error("[deleteKhenThuong]", error);
    res.status(500).json({ error: "Lỗi khi xóa khen thưởng" });
  }
};
