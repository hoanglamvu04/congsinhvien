import pool from "../config/db.js";

// 📘 Admin xem toàn bộ danh sách điểm rèn luyện
export const getAllDiemRenLuyen = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT drl.*, sv.ho_ten AS ten_sinh_vien, sv.ma_sinh_vien, hk.ten_hoc_ky
      FROM diem_ren_luyen drl
      JOIN sinh_vien sv ON drl.ma_sinh_vien = sv.ma_sinh_vien
      JOIN hoc_ky hk ON drl.ma_hoc_ky = hk.ma_hoc_ky
      ORDER BY hk.ma_hoc_ky DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllDiemRenLuyen]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách điểm rèn luyện" });
  }
};

// 📘 Sinh viên xem điểm của chính mình
export const getDiemRenLuyen = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;
    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }

    const [rows] = await pool.query(`
      SELECT drl.*, hk.ten_hoc_ky
      FROM diem_ren_luyen drl
      JOIN hoc_ky hk ON drl.ma_hoc_ky = hk.ma_hoc_ky
      WHERE drl.ma_sinh_vien = ?
      ORDER BY hk.ma_hoc_ky DESC
    `, [ma_sv]);

    res.json(rows);
  } catch (error) {
    console.error("[getDiemRenLuyen]", error);
    res.status(500).json({ error: "Lỗi khi lấy điểm rèn luyện" });
  }
};
export const getDiemRenLuyenBySinhVien = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT drl.*, hk.ten_hoc_ky
      FROM diem_ren_luyen drl
      JOIN hoc_ky hk ON drl.ma_hoc_ky = hk.ma_hoc_ky
      WHERE drl.ma_sinh_vien = ?
      ORDER BY hk.ma_hoc_ky DESC
    `, [id]);

    res.json(rows);
  } catch (error) {
    console.error("❌ Lỗi khi lấy điểm rèn luyện:", error);
    res.status(500).json({ error: "Không thể lấy điểm rèn luyện sinh viên" });
  }
};
// ➕ Cập nhật hoặc thêm mới (Admin / Cố vấn)
export const upsertDiemRenLuyen = async (req, res) => {
  try {
    const {
      ma_sinh_vien,
      ma_hoc_ky,
      diem_tu_danh_gia,
      diem_co_van,
      diem_chung_ket,
      xep_loai
    } = req.body;

    await pool.query(`
      INSERT INTO diem_ren_luyen (ma_sinh_vien, ma_hoc_ky, diem_tu_danh_gia, diem_co_van, diem_chung_ket, xep_loai)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        diem_tu_danh_gia=VALUES(diem_tu_danh_gia),
        diem_co_van=VALUES(diem_co_van),
        diem_chung_ket=VALUES(diem_chung_ket),
        xep_loai=VALUES(xep_loai)
    `, [ma_sinh_vien, ma_hoc_ky, diem_tu_danh_gia, diem_co_van, diem_chung_ket, xep_loai]);

    res.json({ message: "✅ Cập nhật điểm rèn luyện thành công" });
  } catch (error) {
    console.error("[upsertDiemRenLuyen]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật điểm rèn luyện" });
  }
};

// 🗑️ Xóa (Admin)
export const deleteDiemRenLuyen = async (req, res) => {
  try {
    const { id_drl } = req.params;
    await pool.query("DELETE FROM diem_ren_luyen WHERE id_drl = ?", [id_drl]);
    res.json({ message: "🗑️ Xóa điểm rèn luyện thành công" });
  } catch (error) {
    console.error("[deleteDiemRenLuyen]", error);
    res.status(500).json({ error: "Lỗi khi xóa điểm rèn luyện" });
  }
};
