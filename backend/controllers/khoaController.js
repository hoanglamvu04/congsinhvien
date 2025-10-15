import pool from "../config/db.js";

// ✅ Hàm trợ giúp
const SORTABLE = ["ma_khoa", "ten_khoa", "created_at"];
const safeOrderBy = (col, dir) => {
  const c = SORTABLE.includes(col) ? col : "ten_khoa";
  const d = dir?.toLowerCase() === "desc" ? "DESC" : "ASC";
  return `${c} ${d}`;
};

// 🧩 Lấy danh sách khoa (tìm kiếm + phân trang + sắp xếp)
export const getAllKhoa = async (req, res) => {
  try {
    const { q = "", page = 1, limit = 10, sortBy = "ten_khoa", order = "asc" } = req.query;

    const _page = parseInt(page) || 1;
    const _limit = parseInt(limit) || 10;
    const offset = (_page - 1) * _limit;
    const keyword = `%${q}%`;
    const orderBy = safeOrderBy(sortBy, order);

    const [countRes] = await pool.query(
      "SELECT COUNT(*) AS total FROM khoa WHERE ma_khoa LIKE ? OR ten_khoa LIKE ? OR mo_ta LIKE ?",
      [keyword, keyword, keyword]
    );
    const total = countRes[0].total;

    const [rows] = await pool.query(
      `SELECT ma_khoa, ten_khoa, mo_ta FROM khoa
       WHERE ma_khoa LIKE ? OR ten_khoa LIKE ? OR mo_ta LIKE ?
       ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [keyword, keyword, keyword, _limit, offset]
    );

    res.json({ data: rows, meta: { total, page: _page, pages: Math.ceil(total / _limit) } });
  } catch (err) {
    console.error("[getAllKhoa]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách khoa" });
  }
};

// 🧩 Lấy chi tiết 1 khoa
export const getKhoaById = async (req, res) => {
  try {
    const { ma_khoa } = req.params;
    const [rows] = await pool.query("SELECT * FROM khoa WHERE ma_khoa = ?", [ma_khoa]);
    if (rows.length === 0) return res.status(404).json({ error: "Không tìm thấy khoa" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[getKhoaById]", err);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết khoa" });
  }
};

// 🧩 Thêm khoa (Admin)
export const createKhoa = async (req, res) => {
  try {
    const { ma_khoa, ten_khoa, mo_ta } = req.body;
    if (!ma_khoa || !ten_khoa)
      return res.status(400).json({ error: "Thiếu mã khoa hoặc tên khoa" });

    const [exist] = await pool.query("SELECT * FROM khoa WHERE ma_khoa = ?", [ma_khoa]);
    if (exist.length > 0)
      return res.status(409).json({ error: "Mã khoa đã tồn tại" });

    await pool.query("INSERT INTO khoa (ma_khoa, ten_khoa, mo_ta) VALUES (?, ?, ?)", [
      ma_khoa,
      ten_khoa,
      mo_ta || null,
    ]);
    res.status(201).json({ message: "Thêm khoa thành công" });
  } catch (err) {
    console.error("[createKhoa]", err);
    res.status(500).json({ error: "Lỗi khi thêm khoa" });
  }
};

// 🧩 Cập nhật khoa (Admin)
export const updateKhoa = async (req, res) => {
  try {
    const { ma_khoa } = req.params;
    const { ten_khoa, mo_ta } = req.body;
    const [exist] = await pool.query("SELECT * FROM khoa WHERE ma_khoa = ?", [ma_khoa]);
    if (exist.length === 0)
      return res.status(404).json({ error: "Không tìm thấy khoa" });

    await pool.query("UPDATE khoa SET ten_khoa = ?, mo_ta = ? WHERE ma_khoa = ?", [
      ten_khoa,
      mo_ta || null,
      ma_khoa,
    ]);
    res.json({ message: "Cập nhật khoa thành công" });
  } catch (err) {
    console.error("[updateKhoa]", err);
    res.status(500).json({ error: "Lỗi khi cập nhật khoa" });
  }
};

// 🧩 Xóa khoa (Admin)
export const deleteKhoa = async (req, res) => {
  try {
    const { ma_khoa } = req.params;
    await pool.query("DELETE FROM khoa WHERE ma_khoa = ?", [ma_khoa]);
    res.json({ message: "Xóa khoa thành công" });
  } catch (err) {
    console.error("[deleteKhoa]", err);
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res
        .status(409)
        .json({ error: "Không thể xóa do có dữ liệu liên quan (FK constraint)" });
    }
    res.status(500).json({ error: "Lỗi khi xóa khoa" });
  }
};
