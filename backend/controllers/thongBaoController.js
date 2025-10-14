import pool from "../config/db.js";

// 📘 Tạo thông báo (Admin)
export const createThongBao = async (req, res) => {
  try {
    const { tieu_de, noi_dung, nguoi_gui, doi_tuong, ma_doi_tuong, tep_dinh_kem, trang_thai } = req.body;

    await pool.query(`
      INSERT INTO thong_bao (tieu_de, noi_dung, nguoi_gui, doi_tuong, ma_doi_tuong, tep_dinh_kem, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [tieu_de, noi_dung, nguoi_gui, doi_tuong, ma_doi_tuong, tep_dinh_kem, trang_thai]);

    res.status(201).json({ message: "Tạo thông báo thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi tạo thông báo" });
  }
};

// 📘 Lấy thông báo theo đối tượng
export const getThongBaoByUser = async (req, res) => {
  try {
    const user = req.user;
    let { ma_doi_tuong } = user;
    let doi_tuong = user.role === "sinhvien" ? "sinhvien" : "giangvien";

    const [rows] = await pool.query(`
      SELECT * FROM thong_bao
      WHERE (doi_tuong = 'tatca' OR (doi_tuong = ? AND ma_doi_tuong = ?))
      AND trang_thai = 'hienthi'
      ORDER BY ngay_gui DESC
    `, [doi_tuong, ma_doi_tuong]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách thông báo" });
  }
};
