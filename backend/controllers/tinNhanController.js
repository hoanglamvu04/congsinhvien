import pool from "../config/db.js";

// 📩 Gửi tin nhắn
export const guiTinNhan = async (req, res) => {
  try {
    const { nguoi_gui, nguoi_nhan, noi_dung, tep_dinh_kem } = req.body;

    if (!nguoi_gui || !nguoi_nhan || !noi_dung)
      return res.status(400).json({ error: "Thiếu người gửi, người nhận hoặc nội dung" });

    await pool.query(
      `
      INSERT INTO tin_nhan (nguoi_gui, nguoi_nhan, noi_dung, tep_dinh_kem, thoi_gian_gui, da_doc, trang_thai)
      VALUES (?, ?, ?, ?, NOW(), 0, 'binhthuong')
      `,
      [nguoi_gui, nguoi_nhan, noi_dung, tep_dinh_kem || null]
    );

    res.status(201).json({ message: "📨 Gửi tin nhắn thành công" });
  } catch (err) {
    console.error("[guiTinNhan]", err);
    res.status(500).json({ error: "Lỗi khi gửi tin nhắn" });
  }
};


// 💬 Lấy hội thoại giữa 2 người (sinh viên ↔ giảng viên hoặc bất kỳ)
export const getHoiThoai = async (req, res) => {
  try {
    const { nguoi_nhan } = req.params;
    const nguoi_gui = req.user.ten_dang_nhap;

    const [rows] = await pool.query(
      `
      SELECT t.*, g.ten_dang_nhap AS ten_gui, n.ten_dang_nhap AS ten_nhan
      FROM tin_nhan t
      JOIN tai_khoan g ON t.nguoi_gui = g.ten_dang_nhap
      JOIN tai_khoan n ON t.nguoi_nhan = n.ten_dang_nhap
      WHERE (t.nguoi_gui = ? AND t.nguoi_nhan = ?)
         OR (t.nguoi_gui = ? AND t.nguoi_nhan = ?)
      ORDER BY t.thoi_gian_gui ASC
      `,
      [nguoi_gui, nguoi_nhan, nguoi_nhan, nguoi_gui]
    );

    res.json({ data: rows });
  } catch (err) {
    console.error("[getHoiThoai]", err);
    res.status(500).json({ error: "Lỗi khi lấy hội thoại" });
  }
};

// 🧾 Admin xem tất cả tin nhắn
export const getAllTinNhan = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.*, 
        g.ten_dang_nhap AS ten_gui, 
        n.ten_dang_nhap AS ten_nhan
      FROM tin_nhan t
      JOIN tai_khoan g ON t.nguoi_gui = g.ten_dang_nhap
      JOIN tai_khoan n ON t.nguoi_nhan = n.ten_dang_nhap
      ORDER BY t.thoi_gian_gui DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    console.error("[getAllTinNhan]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách tin nhắn" });
  }
};

// ✅ Đánh dấu tin nhắn đã đọc
export const danhDauDaDoc = async (req, res) => {
  try {
    const { nguoi_nhan } = req.params;
    const nguoi_gui = req.user.ten_dang_nhap;
    await pool.query(
      `
      UPDATE tin_nhan 
      SET da_doc = 1
      WHERE nguoi_gui = ? AND nguoi_nhan = ?
      `,
      [nguoi_nhan, nguoi_gui]
    );
    res.json({ message: "Đã đánh dấu tin nhắn là đã đọc" });
  } catch (err) {
    console.error("[danhDauDaDoc]", err);
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái tin nhắn" });
  }
};

// 🗑️ Xóa tin nhắn (Admin)
export const deleteTinNhan = async (req, res) => {
  try {
    const { id_tin_nhan } = req.params;
    await pool.query("DELETE FROM tin_nhan WHERE id_tin_nhan = ?", [id_tin_nhan]);
    res.json({ message: "Đã xóa tin nhắn" });
  } catch (err) {
    console.error("[deleteTinNhan]", err);
    res.status(500).json({ error: "Lỗi khi xóa tin nhắn" });
  }
};

// 📊 Thống kê
export const getThongKeTinNhan = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS tong_tin_nhan,
        SUM(CASE WHEN da_doc = 0 THEN 1 ELSE 0 END) AS chua_doc,
        SUM(CASE WHEN da_doc = 1 THEN 1 ELSE 0 END) AS da_doc
      FROM tin_nhan
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error("[getThongKeTinNhan]", err);
    res.status(500).json({ error: "Lỗi khi thống kê tin nhắn" });
  }
};
