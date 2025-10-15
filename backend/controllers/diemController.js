import pool from "../config/db.js";

// 📘 Lấy toàn bộ điểm (Admin)
export const getAllDiem = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, sv.ho_ten AS ten_sinh_vien, sv.ma_sinh_vien,
             mh.ten_mon, lhp.ma_lop_hp, hk.ten_hoc_ky
      FROM diem d
      JOIN sinh_vien sv ON d.ma_sinh_vien = sv.ma_sinh_vien
      JOIN lop_hoc_phan lhp ON d.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      ORDER BY hk.ten_hoc_ky DESC, sv.ma_sinh_vien
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllDiem]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách điểm" });
  }
};

// 📘 Lấy điểm theo sinh viên (cũ)
export const getDiemBySinhVien = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;
    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }
    const [rows] = await pool.query(`
      SELECT d.*, mh.ten_mon, lhp.ma_lop_hp
      FROM diem d
      JOIN lop_hoc_phan lhp ON d.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      WHERE d.ma_sinh_vien = ?
    `, [ma_sv]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy điểm sinh viên" });
  }
};

// ➕ Thêm hoặc cập nhật điểm
export const upsertDiem = async (req, res) => {
  try {
    const {
      ma_sinh_vien,
      ma_lop_hp,
      lan_hoc,
      diem_hs1,
      diem_hs2,
      diem_thi,
      diem_tong,
      diem_thang_4,
      ket_qua,
      trang_thai
    } = req.body;

    await pool.query(`
      INSERT INTO diem 
      (ma_sinh_vien, ma_lop_hp, lan_hoc, diem_hs1, diem_hs2, diem_thi, diem_tong, diem_thang_4, ket_qua, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        diem_hs1=VALUES(diem_hs1),
        diem_hs2=VALUES(diem_hs2),
        diem_thi=VALUES(diem_thi),
        diem_tong=VALUES(diem_tong),
        diem_thang_4=VALUES(diem_thang_4),
        ket_qua=VALUES(ket_qua),
        trang_thai=VALUES(trang_thai)
    `, [
      ma_sinh_vien, ma_lop_hp, lan_hoc,
      diem_hs1, diem_hs2, diem_thi,
      diem_tong, diem_thang_4, ket_qua, trang_thai
    ]);

    res.json({ message: "✅ Cập nhật điểm thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật điểm" });
  }
};
// 🗑️ Xóa điểm
export const deleteDiem = async (req, res) => {
  try {
    const { id_diem } = req.params;
    await pool.query("DELETE FROM diem WHERE id_diem = ?", [id_diem]);
    res.json({ message: "Xóa điểm thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa điểm" });
  }
};
