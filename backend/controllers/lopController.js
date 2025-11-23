import pool from "../config/db.js";

// ✅ Lấy danh sách lớp (kèm tên ngành, tìm kiếm)
export const getAllLop = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const keyword = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT l.*, n.ten_nganh 
       FROM lop l 
       LEFT JOIN nganh n ON l.ma_nganh = n.ma_nganh
       WHERE l.ma_lop LIKE ? 
          OR l.ten_lop LIKE ? 
          OR n.ten_nganh LIKE ? 
          OR l.khoa_hoc LIKE ? 
          OR l.co_van LIKE ?`,
      [keyword, keyword, keyword, keyword, keyword]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllLop]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách lớp" });
  }
};

// ✅ Thêm lớp (Admin)
export const createLop = async (req, res) => {
  try {
    const { ma_lop, ten_lop, ma_nganh, khoa_hoc, co_van, trang_thai } = req.body;

    if (!ma_lop || !ten_lop || !ma_nganh)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    const [exist] = await pool.query("SELECT * FROM lop WHERE ma_lop = ?", [ma_lop]);
    if (exist.length)
      return res.status(409).json({ error: "Mã lớp đã tồn tại" });

    await pool.query(
      "INSERT INTO lop (ma_lop, ten_lop, ma_nganh, khoa_hoc, co_van, trang_thai) VALUES (?, ?, ?, ?, ?, ?)",
      [ma_lop, ten_lop, ma_nganh, khoa_hoc || "", co_van || "", trang_thai || "hoatdong"]
    );
    res.status(201).json({ message: "Thêm lớp thành công" });
  } catch (error) {
    console.error("[createLop]", error);
    res.status(500).json({ error: "Lỗi khi thêm lớp" });
  }
};

// ✅ Cập nhật lớp (Admin)
export const updateLop = async (req, res) => {
  try {
    const { ma_lop } = req.params;
    const { ten_lop, ma_nganh, khoa_hoc, co_van, trang_thai } = req.body;

    const [exist] = await pool.query("SELECT * FROM lop WHERE ma_lop = ?", [ma_lop]);
    if (!exist.length)
      return res.status(404).json({ error: "Không tìm thấy lớp" });

    await pool.query(
      "UPDATE lop SET ten_lop=?, ma_nganh=?, khoa_hoc=?, co_van=?, trang_thai=? WHERE ma_lop=?",
      [ten_lop, ma_nganh, khoa_hoc, co_van, trang_thai, ma_lop]
    );
    res.json({ message: "Cập nhật lớp thành công" });
  } catch (error) {
    console.error("[updateLop]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật lớp" });
  }
};

// ✅ Xóa lớp (Admin)
export const deleteLop = async (req, res) => {
  try {
    const { ma_lop } = req.params;
    await pool.query("DELETE FROM lop WHERE ma_lop = ?", [ma_lop]);
    res.json({ message: "Xóa lớp thành công" });
  } catch (error) {
    console.error("[deleteLop]", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Không thể xóa do có dữ liệu liên quan" });
    res.status(500).json({ error: "Lỗi khi xóa lớp" });
  }
};

export const getLopTheoKhoa = async (req, res) => {
  try {
    const { ma_nganh } = req.params;
    const [rows] = await pool.query(
      "SELECT ma_lop, ten_lop FROM lop WHERE ma_nganh = ?",
      [ma_nganh]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách lớp theo khoa:", error);
    res.status(500).json({ error: "Không thể lấy danh sách lớp theo khoa" });
  }
};
export const getLopTheoNganh = async (req, res) => {
  try {
    const { ma_nganh } = req.params;
    const [rows] = await pool.query(
      "SELECT ma_lop, ten_lop FROM lop WHERE ma_nganh = ?",
      [ma_nganh]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lớp theo ngành:", error);
    res.status(500).json({ error: "Không thể lấy danh sách lớp" });
  }
};
