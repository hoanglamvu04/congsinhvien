import pool from "../config/db.js";

// 📘 Lấy danh sách thi lại (Admin)
export const getAllThiLai = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tl.*, sv.ho_ten AS ten_sinh_vien, mh.ten_mon, lhp.ma_lop_hp
      FROM thi_lai tl
      JOIN sinh_vien sv ON tl.ma_sinh_vien = sv.ma_sinh_vien
      JOIN lop_hoc_phan lhp ON tl.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      ORDER BY tl.ngay_thi_lai DESC, tl.trang_thai ASC
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllThiLai]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách thi lại" });
  }
};

// 📘 Sinh viên xem danh sách thi lại của mình
export const getThiLaiBySinhVien = async (req, res) => {
  try {
    const user = req.user;
    let ma_sv = user.ma_sinh_vien;
    if (user.role !== "sinhvien" && req.query.ma_sinh_vien) {
      ma_sv = req.query.ma_sinh_vien;
    }

    const [rows] = await pool.query(`
      SELECT tl.*, mh.ten_mon, lhp.ma_lop_hp
      FROM thi_lai tl
      JOIN lop_hoc_phan lhp ON tl.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      WHERE tl.ma_sinh_vien = ?
      ORDER BY tl.ngay_thi_lai DESC
    `, [ma_sv]);

    res.json({ data: rows });
  } catch (error) {
    console.error("[getThiLaiBySinhVien]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách thi lại" });
  }
};

// ➕ Thêm thủ công (Admin)
export const createThiLai = async (req, res) => {
  try {
    const { ma_sinh_vien, ma_lop_hp, ngay_thi_lai, le_phi_thi_lai } = req.body;

    // Lấy điểm cũ
    const [diem] = await pool.query(
      "SELECT diem_tong FROM diem WHERE ma_sinh_vien=? AND ma_lop_hp=?",
      [ma_sinh_vien, ma_lop_hp]
    );
    const diem_cu = diem[0]?.diem_tong || null;

    await pool.query(`
      INSERT INTO thi_lai (ma_sinh_vien, ma_lop_hp, lan_thi, diem_cu, ngay_thi_lai, le_phi_thi_lai, duoc_cap_nhat)
      VALUES (?, ?, 1, ?, ?, ?, 0)
      ON DUPLICATE KEY UPDATE ngay_thi_lai=VALUES(ngay_thi_lai), le_phi_thi_lai=VALUES(le_phi_thi_lai)
    `, [ma_sinh_vien, ma_lop_hp, diem_cu, ngay_thi_lai, le_phi_thi_lai]);

    res.json({ message: "✅ Thêm thủ công thi lại thành công" });
  } catch (error) {
    console.error("[createThiLai]", error);
    res.status(500).json({ error: "Lỗi khi thêm thủ công thi lại" });
  }
};

// 🤖 Quét tự động (thêm sinh viên có điểm <5 vào danh sách thi lại)
export const autoDetectThiLai = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ma_sinh_vien, ma_lop_hp, diem_tong
      FROM diem
      WHERE diem_tong < 5
        AND diem_hs1 IS NOT NULL
        AND diem_hs2 IS NOT NULL
        AND diem_thi IS NOT NULL
    `);

    let count = 0;
    for (const r of rows) {
      await pool.query(`
        INSERT IGNORE INTO thi_lai (ma_sinh_vien, ma_lop_hp, lan_thi, diem_cu)
        VALUES (?, ?, 1, ?)
      `, [r.ma_sinh_vien, r.ma_lop_hp, r.diem_tong]);
      count++;
    }

    res.json({ message: `✅ Đã thêm ${count} sinh viên vào diện thi lại.` });
  } catch (error) {
    console.error("[autoDetectThiLai]", error);
    res.status(500).json({ error: "Lỗi khi quét danh sách thi lại" });
  }
};

// ✏️ Cập nhật điểm thi lại
export const updateThiLai = async (req, res) => {
  try {
    const { id_thi_lai } = req.params;
    const { diem_thi_lai, ngay_thi_lai, le_phi_thi_lai } = req.body;

    const ket_qua = parseFloat(diem_thi_lai) >= 5 ? "dat" : "khongdat";
    const trang_thai = "da_thi";

    await pool.query(`
      UPDATE thi_lai
      SET diem_thi_lai=?, ngay_thi_lai=?, le_phi_thi_lai=?, ket_qua=?, trang_thai=?
      WHERE id_thi_lai=?
    `, [diem_thi_lai, ngay_thi_lai, le_phi_thi_lai, ket_qua, trang_thai, id_thi_lai]);

    // ✅ Nếu thi lại đạt, cập nhật lại điểm tổng học phần
    if (parseFloat(diem_thi_lai) >= 5) {
      const [record] = await pool.query("SELECT ma_sinh_vien, ma_lop_hp FROM thi_lai WHERE id_thi_lai=?", [id_thi_lai]);
      const r = record[0];
      await pool.query(`
        UPDATE diem
        SET diem_tong=?, ket_qua='dat', trang_thai='hoan_tat'
        WHERE ma_sinh_vien=? AND ma_lop_hp=?
      `, [diem_thi_lai, r.ma_sinh_vien, r.ma_lop_hp]);
    }

    res.json({ message: "✅ Cập nhật điểm thi lại thành công" });
  } catch (error) {
    console.error("[updateThiLai]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật điểm thi lại" });
  }
};

// 🗑️ Xóa thi lại
export const deleteThiLai = async (req, res) => {
  try {
    const { id_thi_lai } = req.params;
    await pool.query("DELETE FROM thi_lai WHERE id_thi_lai = ?", [id_thi_lai]);
    res.json({ message: "🗑️ Đã xóa thi lại" });
  } catch (error) {
    console.error("[deleteThiLai]", error);
    res.status(500).json({ error: "Lỗi khi xóa thi lại" });
  }
};
