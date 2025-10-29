import pool from "../config/db.js";
import { quyDoiDiem, xepLoaiHocLuc } from "../utils/gradeUtils.js";

// =======================
// 🧱 ADMIN / GIẢNG VIÊN / SINH VIÊN
// =======================

// 📘 Admin: Lấy toàn bộ điểm
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
  } catch (err) {
    console.error("[getAllDiem]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách điểm" });
  }
};

// 📘 Sinh viên xem điểm của mình
export const getMyDiem = async (req, res) => {
  try {
    const userId = req.user.id;
    const [svRows] = await pool.query(
      "SELECT ma_sinh_vien FROM sinh_vien WHERE id_tai_khoan = ?",
      [userId]
    );
    if (!svRows.length)
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });

    const ma_sinh_vien = svRows[0].ma_sinh_vien;

    const [rows] = await pool.query(`
      SELECT d.*, mh.ten_mon, lhp.ma_lop_hp, hk.ten_hoc_ky
      FROM diem d
      JOIN lop_hoc_phan lhp ON d.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      WHERE d.ma_sinh_vien = ?
      ORDER BY hk.ten_hoc_ky DESC, mh.ten_mon ASC
    `, [ma_sinh_vien]);

    res.json({ data: rows });
  } catch (err) {
    console.error("[getMyDiem]", err);
    res.status(500).json({ error: "Lỗi khi lấy điểm sinh viên" });
  }
};

// 📊 Tổng hợp kết quả học tập (sinh viên)
export const getMyDiemSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const [svRows] = await pool.query(
      "SELECT ma_sinh_vien FROM sinh_vien WHERE id_tai_khoan = ?",
      [userId]
    );
    if (!svRows.length)
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });

    const ma_sinh_vien = svRows[0].ma_sinh_vien;

    const [rows] = await pool.query(`
      SELECT d.*, mh.ten_mon, mh.so_tin_chi, lhp.ma_lop_hp,
             hk.ten_hoc_ky, hk.nam_hoc
      FROM diem d
      JOIN lop_hoc_phan lhp ON d.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      WHERE d.ma_sinh_vien = ?
      ORDER BY hk.ten_hoc_ky ASC
    `, [ma_sinh_vien]);

    if (!rows.length) return res.json({ data: [], summary: null });

    // === QUY ĐỔI & XÁC ĐỊNH KẾT QUẢ ===
    const data = rows.map((r) => {
      const diemTong = parseFloat(r.diem_tong) || 0;
      const { he4, chu } = quyDoiDiem(diemTong);
      const ketQua = diemTong >= 4.0 ? "Dat" : "KhongDat";

      return {
        ...r,
        diem_chu: chu,
        diem_thang_4: he4,
        ket_qua: r.ket_qua || ketQua,
      };
    });

    // === TÍNH GPA + TÍN CHỈ ===
    const tongTinChiHocTap = data.reduce((s, r) => s + (r.so_tin_chi || 0), 0);
    const dat = data.filter((r) => r.ket_qua === "Dat");
    const tongTinChiTichLuy = dat.reduce((s, r) => s + (r.so_tin_chi || 0), 0);
    const tongDiem = dat.reduce(
      (s, r) => s + (parseFloat(r.diem_tong) || 0) * (r.so_tin_chi || 0),
      0
    );

    const gpa10 = tongTinChiTichLuy
      ? (tongDiem / tongTinChiTichLuy).toFixed(2)
      : 0;
    const gpa4 = quyDoiDiem(gpa10).he4;
    const xepLoai = xepLoaiHocLuc(gpa4);

    res.json({
      summary: {
        tin_chi_tich_luy: `${tongTinChiTichLuy} / ${tongTinChiHocTap}`,
        gpa_he_10: gpa10,
        gpa_he_4: gpa4.toFixed(2),
        xep_loai: xepLoai,
      },
      data,
    });
  } catch (err) {
    console.error("[getMyDiemSummary]", err);
    res.status(500).json({ error: "Lỗi khi tổng hợp điểm" });
  }
};

// 📘 Giảng viên xem điểm lớp mình
export const getDiemByGiangVien = async (req, res) => {
  try {
    const userId = req.user.id;
    const [gv] = await pool.query(
      "SELECT ma_giang_vien FROM giang_vien WHERE id_tai_khoan = ?",
      [userId]
    );
    if (!gv.length)
      return res.status(404).json({ error: "Không tìm thấy giảng viên." });

    const ma_gv = gv[0].ma_giang_vien;
    const [rows] = await pool.query(`
      SELECT d.*, sv.ho_ten AS ten_sinh_vien, mh.ten_mon, lhp.ma_lop_hp, hk.ten_hoc_ky
      FROM diem d
      JOIN sinh_vien sv ON d.ma_sinh_vien = sv.ma_sinh_vien
      JOIN lop_hoc_phan lhp ON d.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      WHERE lhp.ma_giang_vien = ?
    `, [ma_gv]);

    res.json({ data: rows });
  } catch (err) {
    console.error("[getDiemByGiangVien]", err);
    res.status(500).json({ error: "Lỗi khi lấy điểm của giảng viên" });
  }
};

// ✏️ Giảng viên cập nhật điểm lớp mình
export const updateDiemByGiangVien = async (req, res) => {
  try {
    const userId = req.user.id;
    const [gv] = await pool.query(
      "SELECT ma_giang_vien FROM giang_vien WHERE id_tai_khoan = ?",
      [userId]
    );
    if (!gv.length)
      return res.status(404).json({ error: "Không tìm thấy giảng viên." });

    const ma_gv = gv[0].ma_giang_vien;
    const {
      ma_sinh_vien,
      ma_lop_hp,
      diem_hs1,
      diem_hs2,
      diem_thi,
      diem_tong,
      ket_qua,
      trang_thai,
    } = req.body;

    const [check] = await pool.query(
      "SELECT * FROM lop_hoc_phan WHERE ma_lop_hp = ? AND ma_giang_vien = ?",
      [ma_lop_hp, ma_gv]
    );
    if (!check.length)
      return res.status(403).json({ error: "Không có quyền với lớp này." });

    const { he4 } = quyDoiDiem(diem_tong);
    const ketQuaAuto = he4 > 0 ? "Dat" : "KhongDat";

    await pool.query(
      `
      INSERT INTO diem (ma_sinh_vien, ma_lop_hp, diem_hs1, diem_hs2, diem_thi, diem_tong, diem_thang_4, ket_qua, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        diem_hs1=VALUES(diem_hs1),
        diem_hs2=VALUES(diem_hs2),
        diem_thi=VALUES(diem_thi),
        diem_tong=VALUES(diem_tong),
        diem_thang_4=VALUES(diem_thang_4),
        ket_qua=VALUES(ket_qua),
        trang_thai=VALUES(trang_thai)
    `,
      [
        ma_sinh_vien,
        ma_lop_hp,
        diem_hs1,
        diem_hs2,
        diem_thi,
        diem_tong,
        he4,
        ket_qua || ketQuaAuto,
        trang_thai,
      ]
    );

    res.json({ message: "✅ Cập nhật điểm thành công." });
  } catch (err) {
    console.error("[updateDiemByGiangVien]", err);
    res.status(500).json({ error: "Lỗi khi giảng viên cập nhật điểm." });
  }
};

// ➕ Admin thêm hoặc cập nhật điểm
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
      ket_qua,
      trang_thai,
    } = req.body;

    const { he4 } = quyDoiDiem(diem_tong);
    const ketQuaAuto = he4 > 0 ? "Dat" : "KhongDat";

    await pool.query(
      `
      INSERT INTO diem (ma_sinh_vien, ma_lop_hp, lan_hoc, diem_hs1, diem_hs2, diem_thi, diem_tong, diem_thang_4, ket_qua, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        diem_hs1=VALUES(diem_hs1),
        diem_hs2=VALUES(diem_hs2),
        diem_thi=VALUES(diem_thi),
        diem_tong=VALUES(diem_tong),
        diem_thang_4=VALUES(diem_thang_4),
        ket_qua=VALUES(ket_qua),
        trang_thai=VALUES(trang_thai)
    `,
      [
        ma_sinh_vien,
        ma_lop_hp,
        lan_hoc,
        diem_hs1,
        diem_hs2,
        diem_thi,
        diem_tong,
        he4,
        ket_qua || ketQuaAuto,
        trang_thai,
      ]
    );

    res.json({ message: "✅ Cập nhật điểm thành công" });
  } catch (err) {
    console.error("[upsertDiem]", err);
    res.status(500).json({ error: "Lỗi khi cập nhật điểm" });
  }
};

// 🗑️ Xóa điểm
export const deleteDiem = async (req, res) => {
  try {
    const { id_diem } = req.params;
    await pool.query("DELETE FROM diem WHERE id_diem = ?", [id_diem]);
    res.json({ message: "Đã xóa điểm." });
  } catch (err) {
    console.error("[deleteDiem]", err);
    res.status(500).json({ error: "Lỗi khi xóa điểm." });
  }
};

// =======================
// 🧮 CHI TIẾT ĐIỂM
// =======================
export const getDiemChiTiet = async (req, res) => {
  try {
    const { id_diem } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM diem_chi_tiet WHERE id_diem = ? ORDER BY id_ct ASC",
      [id_diem]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error("[getDiemChiTiet]", err);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết điểm" });
  }
};

export const upsertDiemChiTiet = async (req, res) => {
  try {
    const { id_diem, ten_bai_kt, loai_he_so, diem } = req.body;
    await pool.query(
      `
      INSERT INTO diem_chi_tiet (id_diem, ten_bai_kt, loai_he_so, diem)
      VALUES (?, ?, ?, ?)
    `,
      [id_diem, ten_bai_kt, loai_he_so, diem]
    );
    res.json({ message: "✅ Lưu điểm chi tiết thành công" });
  } catch (err) {
    console.error("[upsertDiemChiTiet]", err);
    res.status(500).json({ error: "Lỗi khi lưu điểm chi tiết" });
  }
};

export const deleteDiemChiTiet = async (req, res) => {
  try {
    const { id_ct } = req.params;
    await pool.query("DELETE FROM diem_chi_tiet WHERE id_ct = ?", [id_ct]);
    res.json({ message: "Đã xóa chi tiết điểm" });
  } catch (err) {
    console.error("[deleteDiemChiTiet]", err);
    res.status(500).json({ error: "Lỗi khi xóa chi tiết điểm" });
  }
};
