import pool from "../config/db.js";

// 📘 Lấy điểm theo sinh viên (dành cho sinh viên hoặc giảng viên xem)
export const getDiemBySinhVien = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;

    // Nếu là admin hoặc giảng viên có thể truyền ma_sinh_vien qua query
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

// ➕ Thêm hoặc cập nhật điểm (Admin/Giảng viên)
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

    res.json({ message: "Cập nhật điểm thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật điểm" });
  }
};
