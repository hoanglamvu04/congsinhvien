import pool from "../config/db.js";

// 📩 Gửi tin nhắn
export const guiTinNhan = async (req, res) => {
  try {
    const { nguoi_nhan, noi_dung, tep_dinh_kem } = req.body;
    const user = req.user;

    // ✅ Lấy tên đăng nhập người gửi dựa vào role
    let nguoi_gui = null;

    if (user.ma_sinh_vien) {
      const [tk] = await pool.query(
        `SELECT ten_dang_nhap FROM tai_khoan 
         WHERE id_tai_khoan = (SELECT id_tai_khoan FROM sinh_vien WHERE ma_sinh_vien = ?)`,
        [user.ma_sinh_vien]
      );
      if (tk.length > 0) nguoi_gui = tk[0].ten_dang_nhap;
    } else if (user.ma_giang_vien) {
      const [tk] = await pool.query(
        `SELECT ten_dang_nhap FROM tai_khoan 
         WHERE id_tai_khoan = (SELECT id_tai_khoan FROM giang_vien WHERE ma_giang_vien = ?)`,
        [user.ma_giang_vien]
      );
      if (tk.length > 0) nguoi_gui = tk[0].ten_dang_nhap;
    }

    if (!nguoi_gui || !nguoi_nhan || !noi_dung) {
      return res
        .status(400)
        .json({ error: "Thiếu người gửi, người nhận hoặc nội dung" });
    }

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



export const getHoiThoai = async (req, res) => {
  try {
    const { nguoi_nhan } = req.params;
    const user = req.user;

    // ✅ Lấy tên đăng nhập thật của người đang đăng nhập
    let tenDangNhap = null;
    if (user.ma_sinh_vien) {
      const [tk] = await pool.query(
        `SELECT ten_dang_nhap 
         FROM tai_khoan 
         WHERE id_tai_khoan = (SELECT id_tai_khoan FROM sinh_vien WHERE ma_sinh_vien = ?)`,
        [user.ma_sinh_vien]
      );
      if (tk.length > 0) tenDangNhap = tk[0].ten_dang_nhap;
    } else if (user.ma_giang_vien) {
      const [tk] = await pool.query(
        `SELECT ten_dang_nhap 
         FROM tai_khoan 
         WHERE id_tai_khoan = (SELECT id_tai_khoan FROM giang_vien WHERE ma_giang_vien = ?)`,
        [user.ma_giang_vien]
      );
      if (tk.length > 0) tenDangNhap = tk[0].ten_dang_nhap;
    }

    if (!tenDangNhap)
      return res.status(403).json({ error: "Không xác định được tài khoản đăng nhập" });

    // ✅ Kiểm tra có quyền xem hội thoại không
    const [check] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM tin_nhan
       WHERE (nguoi_gui = ? AND nguoi_nhan = ?)
          OR (nguoi_gui = ? AND nguoi_nhan = ?)`,
      [tenDangNhap, nguoi_nhan, nguoi_nhan, tenDangNhap]
    );
    if (check[0].count === 0)
      return res.status(403).json({ error: "Không có quyền xem hội thoại này" });

    // ✅ Lấy toàn bộ tin nhắn
    const [rows] = await pool.query(
      `SELECT * FROM tin_nhan
       WHERE (nguoi_gui = ? AND nguoi_nhan = ?)
          OR (nguoi_gui = ? AND nguoi_nhan = ?)
       ORDER BY thoi_gian_gui ASC`,
      [tenDangNhap, nguoi_nhan, nguoi_nhan, tenDangNhap]
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


// 📬 Lấy toàn bộ tin nhắn của người dùng hiện tại (SV hoặc GV)
export const getTinNhanCaNhan = async (req, res) => {
  try {
    const user = req.user;
    let tenDangNhap = null;

    if (user.ma_sinh_vien) {
      const [tk] = await pool.query(
        `SELECT ten_dang_nhap FROM tai_khoan WHERE ten_dang_nhap = ? OR id_tai_khoan = (
           SELECT id_tai_khoan FROM sinh_vien WHERE ma_sinh_vien = ?
         )`,
        [user.ma_sinh_vien, user.ma_sinh_vien]
      );
      if (tk.length > 0) tenDangNhap = tk[0].ten_dang_nhap;
    } else if (user.ma_giang_vien) {
      const [tk] = await pool.query(
        `SELECT ten_dang_nhap FROM tai_khoan WHERE ten_dang_nhap = ? OR id_tai_khoan = (
           SELECT id_tai_khoan FROM giang_vien WHERE ma_giang_vien = ?
         )`,
        [user.ma_giang_vien, user.ma_giang_vien]
      );
      if (tk.length > 0) tenDangNhap = tk[0].ten_dang_nhap;
    }

    if (!tenDangNhap) return res.json({ data: [] });

    // ✅ Truy vấn chính
    const [rows] = await pool.query(
      `
      SELECT t.*, g.ten_dang_nhap AS nguoi_gui, n.ten_dang_nhap AS nguoi_nhan
      FROM tin_nhan t
      JOIN tai_khoan g ON t.nguoi_gui = g.ten_dang_nhap
      JOIN tai_khoan n ON t.nguoi_nhan = n.ten_dang_nhap
      WHERE t.nguoi_gui = ? OR t.nguoi_nhan = ?
      ORDER BY t.thoi_gian_gui DESC
      `,
      [tenDangNhap, tenDangNhap]
    );

    res.json({ data: rows });
  } catch (err) {
    console.error("[getTinNhanCaNhan]", err);
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn cá nhân" });
  }
};


export const danhDauDaDoc = async (req, res) => {
  try {
    const { nguoi_nhan } = req.params;
    const user = req.user;
    const nguoi_gui =
      user.ma_sinh_vien || user.ma_giang_vien || user.ten_dang_nhap;

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
