import pool from "../config/db.js";

export const guiPhanHoi = async (req, res) => {
  try {
    const { nguoi_nhan, chu_de, noi_dung } = req.body;
    const ma_sinh_vien = req.user.ma_sinh_vien;
    await pool.query(
      `INSERT INTO phan_hoi (ma_sinh_vien, nguoi_nhan, chu_de, noi_dung, trang_thai, ngay_gui)
       VALUES (?, ?, ?, ?, 'choduyet', NOW())`,
      [ma_sinh_vien, nguoi_nhan, chu_de, noi_dung]
    );
    res.status(201).json({ message: "Phản hồi đã được gửi" });
  } catch (err) {
    console.error("[guiPhanHoi]", err);
    res.status(500).json({ error: "Lỗi khi gửi phản hồi" });
  }
};

export const traLoiPhanHoi = async (req, res) => {
  try {
    const { id_phan_hoi, phan_hoi_tu_nguoi_nhan } = req.body;
    await pool.query(
      `UPDATE phan_hoi
       SET phan_hoi_tu_nguoi_nhan=?, trang_thai='dagiaiquyet', ngay_phan_hoi=NOW()
       WHERE id_phan_hoi=?`,
      [phan_hoi_tu_nguoi_nhan, id_phan_hoi]
    );
    res.json({ message: "Trả lời phản hồi thành công" });
  } catch (err) {
    console.error("[traLoiPhanHoi]", err);
    res.status(500).json({ error: "Lỗi khi trả lời phản hồi" });
  }
};

export const getAllPhanHoi = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const keyword = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT p.*, sv.ho_ten
       FROM phan_hoi p
       JOIN sinh_vien sv ON p.ma_sinh_vien = sv.ma_sinh_vien
       WHERE sv.ho_ten LIKE ? OR p.chu_de LIKE ? OR p.noi_dung LIKE ?
       ORDER BY p.id_phan_hoi DESC`,
      [keyword, keyword, keyword]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error("[getAllPhanHoi]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách phản hồi" });
  }
};

export const getPhanHoiBySinhVien = async (req, res) => {
  try {
    const ma_sinh_vien = req.user.ma_sinh_vien;
    const [rows] = await pool.query(
      `SELECT * FROM phan_hoi WHERE ma_sinh_vien=? ORDER BY id_phan_hoi DESC`,
      [ma_sinh_vien]
    );
    res.json(rows);
  } catch (err) {
    console.error("[getPhanHoiBySinhVien]", err);
    res.status(500).json({ error: "Lỗi khi lấy phản hồi sinh viên" });
  }
};

export const createPhanHoiAdmin = async (req, res) => {
  try {
    const { ma_sinh_vien, nguoi_nhan, chu_de, noi_dung } = req.body;
    await pool.query(
      `INSERT INTO phan_hoi (ma_sinh_vien, nguoi_nhan, chu_de, noi_dung, trang_thai, ngay_gui)
       VALUES (?, ?, ?, ?, 'choduyet', NOW())`,
      [ma_sinh_vien, nguoi_nhan, chu_de, noi_dung]
    );
    res.status(201).json({ message: "Thêm phản hồi thủ công thành công" });
  } catch (err) {
    console.error("[createPhanHoiAdmin]", err);
    res.status(500).json({ error: "Lỗi khi thêm phản hồi" });
  }
};

export const updatePhanHoiAdmin = async (req, res) => {
  try {
    const { id_phan_hoi } = req.params;
    const { ma_sinh_vien, nguoi_nhan, chu_de, noi_dung, trang_thai } = req.body;
    await pool.query(
      `UPDATE phan_hoi
       SET ma_sinh_vien=?, nguoi_nhan=?, chu_de=?, noi_dung=?, trang_thai=?
       WHERE id_phan_hoi=?`,
      [ma_sinh_vien, nguoi_nhan, chu_de, noi_dung, trang_thai, id_phan_hoi]
    );
    res.json({ message: "Cập nhật phản hồi thành công" });
  } catch (err) {
    console.error("[updatePhanHoiAdmin]", err);
    res.status(500).json({ error: "Lỗi khi cập nhật phản hồi" });
  }
};

export const deletePhanHoi = async (req, res) => {
  try {
    const { id_phan_hoi } = req.params;
    await pool.query("DELETE FROM phan_hoi WHERE id_phan_hoi=?", [id_phan_hoi]);
    res.json({ message: "Xóa phản hồi thành công" });
  } catch (err) {
    console.error("[deletePhanHoi]", err);
    res.status(500).json({ error: "Lỗi khi xóa phản hồi" });
  }
};

export const getThongKePhanHoi = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS tong_phan_hoi,
        SUM(CASE WHEN trang_thai='choduyet' THEN 1 ELSE 0 END) AS cho_duyet,
        SUM(CASE WHEN trang_thai='dagiaiquyet' THEN 1 ELSE 0 END) AS da_giai_quyet
      FROM phan_hoi
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error("[getThongKePhanHoi]", err);
    res.status(500).json({ error: "Lỗi khi thống kê phản hồi" });
  }
};
