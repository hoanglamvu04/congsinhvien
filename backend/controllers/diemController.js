import pool from "../config/db.js";
import { quyDoiDiem, xepLoaiHocLuc } from "../utils/gradeUtils.js";

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

// 🎓 Sinh viên xem điểm (hỗ trợ lọc theo query)
export const getMyDiem = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[sv]] = await pool.query(
      "SELECT ma_sinh_vien FROM sinh_vien WHERE id_tai_khoan = ?",
      [userId]
    );
    if (!sv) return res.status(404).json({ message: "Không tìm thấy sinh viên" });

    const maSV = sv.ma_sinh_vien;

    // --- Query params ---
    const { hocky, namhoc } = req.query;

    let sql = `
      SELECT 
        d.id_diem, d.ma_sinh_vien, d.ma_lop_hp, d.lan_hoc,
        d.diem_hs1, d.diem_hs2, d.diem_thi, d.diem_tong,
        d.diem_thang_4, d.ket_qua,
        mh.ten_mon, mh.so_tin_chi,
        lhp.ma_lop_hp,
        hk.ten_hoc_ky, hk.nam_hoc
      FROM diem d
      JOIN lop_hoc_phan lhp ON d.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      WHERE d.ma_sinh_vien = ?
    `;

    const params = [maSV];

    if (hocky) {
      sql += " AND hk.ten_hoc_ky = ? ";
      params.push(hocky);
    }

    if (namhoc) {
      sql += " AND hk.nam_hoc = ? ";
      params.push(namhoc);
    }

    sql += " ORDER BY hk.nam_hoc DESC, hk.ten_hoc_ky DESC, mh.ten_mon ASC ";

    const [rows] = await pool.query(sql, params);

    // 📌 lấy lịch sử thi lại
    const [thiLai] = await pool.query(
      `SELECT id_diem, lan_thi, diem_thi, ngay_thi, ghi_chu
       FROM diem_lan_thi
       WHERE id_diem IN (SELECT id_diem FROM diem WHERE ma_sinh_vien = ?)`,
      [maSV]
    );

    const mapThi = {};
    thiLai.forEach((r) => {
      if (!mapThi[r.id_diem]) mapThi[r.id_diem] = [];
      mapThi[r.id_diem].push(r);
    });

    const data = rows.map((r) => ({
      ...r,
      lan_thi: mapThi[r.id_diem] || [],
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("[getMyDiem]", err);
    res.status(500).json({ error: "Lỗi khi lấy điểm" });
  }
};


export const getDiemBySinhVien = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT d.*, mh.ten_mon, mh.so_tin_chi, lhp.ma_lop_hp, hk.ten_hoc_ky
      FROM diem d
      JOIN lop_hoc_phan lhp ON d.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      WHERE d.ma_sinh_vien = ?
      ORDER BY hk.ma_hoc_ky DESC
    `, [id]);
    const data = await Promise.all(rows.map(async (r) => {
      const [thi] = await pool.query(
        "SELECT lan_thi, diem_thi, ngay_thi, ghi_chu FROM diem_lan_thi WHERE id_diem = ? ORDER BY lan_thi ASC",
        [r.id_diem]
      );
      const diemTong = parseFloat(r.diem_tong) || 0;
      const { he4, chu } = quyDoiDiem(diemTong);
      const ketQua = diemTong >= 4.0 ? "Dat" : "KhongDat";
      return { ...r, diem_chu: chu, diem_thang_4: he4, ket_qua: r.ket_qua || ketQua, lan_thi: thi };
    }));
    res.json(data);
  } catch (error) {
    console.error("[getDiemBySinhVien]", error);
    res.status(500).json({ error: "Không thể lấy điểm sinh viên" });
  }
};

export const addLanThi = async (req, res) => {
  try {
    const { id_diem, diem_thi, ghi_chu } = req.body;
    const [[max]] = await pool.query("SELECT MAX(lan_thi) AS maxLan FROM diem_lan_thi WHERE id_diem = ?", [id_diem]);
    const nextLan = (max?.maxLan || 0) + 1;
    await pool.query("INSERT INTO diem_lan_thi (id_diem, lan_thi, diem_thi, ngay_thi, ghi_chu) VALUES (?, ?, ?, NOW(), ?)", [id_diem, nextLan, diem_thi, ghi_chu || null]);
    const diemTong = parseFloat(diem_thi);
    const { he4, chu } = quyDoiDiem(diemTong);
    const ketQua = diemTong >= 4 ? "Dat" : "KhongDat";
    await pool.query("UPDATE diem SET diem_thi=?, diem_tong=?, diem_thang_4=?, diem_chu=?, ket_qua=?, lan_thi_cuoi=? WHERE id_diem=?", [diem_thi, diemTong, he4, chu, ketQua, nextLan, id_diem]);
    res.json({ message: "✅ Đã thêm điểm thi lại và cập nhật điểm chính" });
  } catch (err) {
    console.error("[addLanThi]", err);
    res.status(500).json({ error: "Lỗi khi thêm lần thi mới" });
  }
};

export const getLanThiByDiem = async (req, res) => {
  try {
    const { id_diem } = req.params;
    const [rows] = await pool.query("SELECT * FROM diem_lan_thi WHERE id_diem = ? ORDER BY lan_thi ASC", [id_diem]);
    res.json({ data: rows });
  } catch (err) {
    console.error("[getLanThiByDiem]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách lần thi" });
  }
};

export const getMyDiemSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const [svRows] = await pool.query("SELECT ma_sinh_vien FROM sinh_vien WHERE id_tai_khoan = ?", [userId]);
    if (!svRows.length) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
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
    const data = rows.map((r) => {
      const diemTong = parseFloat(r.diem_tong) || 0;
      const { he4, chu } = quyDoiDiem(diemTong);
      const ketQua = diemTong >= 4.0 ? "Dat" : "KhongDat";
      return { ...r, diem_chu: chu, diem_thang_4: he4, ket_qua: r.ket_qua || ketQua };
    });
    const tongTinChiHocTap = data.reduce((s, r) => s + (r.so_tin_chi || 0), 0);
    const dat = data.filter((r) => r.ket_qua === "Dat");
    const tongTinChiTichLuy = dat.reduce((s, r) => s + (r.so_tin_chi || 0), 0);
    const tongDiem = dat.reduce((s, r) => s + (parseFloat(r.diem_tong) || 0) * (r.so_tin_chi || 0), 0);
    const gpa10 = tongTinChiTichLuy ? parseFloat((tongDiem / tongTinChiTichLuy).toFixed(2)) : 0;
    const gpa4 = parseFloat(quyDoiDiem(gpa10).he4.toFixed(2));
    const xepLoai = xepLoaiHocLuc(gpa4);
    res.json({
      summary: {
        tin_chi_tich_luy: `${tongTinChiTichLuy} / ${tongTinChiHocTap}`,
        gpa_he_10: gpa10,
        gpa_he_4: gpa4,
        xep_loai: xepLoai,
      },
      data,
    });
  } catch (err) {
    console.error("[getMyDiemSummary]", err);
    res.status(500).json({ error: "Lỗi khi tổng hợp điểm" });
  }
};
// 📘 Điểm theo khoa (dành cho nhân viên khoa)
export const getDiemTheoKhoa = async (req, res) => {
  try {
    const { ma_khoa, keyword, ma_nganh, ma_lop, ma_hoc_ky } = req.query;
    const filter = req.filter || {}; // lấy từ middleware filterByDepartment
    const params = [];

    let sql = `
      SELECT 
        d.*, 
        sv.ma_sinh_vien, sv.ho_ten AS ten_sinh_vien, 
        mh.ten_mon, mh.so_tin_chi, 
        n.ten_nganh, k.ten_khoa, 
        hk.ten_hoc_ky, hk.nam_hoc, 
        lhp.ma_lop_hp
      FROM diem d
      JOIN sinh_vien sv ON d.ma_sinh_vien = sv.ma_sinh_vien
      JOIN lop_hoc_phan lhp ON d.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
      LEFT JOIN nganh n ON sv.ma_nganh = n.ma_nganh
      LEFT JOIN khoa k ON sv.ma_khoa = k.ma_khoa
      LEFT JOIN phong_ban pb ON k.ma_phong = pb.ma_phong
      WHERE 1=1
    `;

    // 🔍 Lọc theo khoa
    if (ma_khoa) {
      sql += " AND sv.ma_khoa = ?";
      params.push(ma_khoa);
    }

    // 🔍 Lọc theo ngành
    if (ma_nganh) {
      sql += " AND sv.ma_nganh = ?";
      params.push(ma_nganh);
    }

    // 🔍 Lọc theo lớp
    if (ma_lop) {
      sql += " AND sv.ma_lop = ?";
      params.push(ma_lop);
    }

    // 🔍 Lọc theo học kỳ
    if (ma_hoc_ky) {
      sql += " AND hk.ma_hoc_ky = ?";
      params.push(ma_hoc_ky);
    }

    // 🔍 Lọc theo keyword (tên hoặc mã sinh viên)
    if (keyword) {
      sql += " AND (sv.ho_ten LIKE ? OR sv.ma_sinh_vien LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 🔒 Giới hạn theo khoa/phòng của nhân viên
    if (!filter.all && filter.ma_phong) {
      sql += " AND k.ma_phong = ?";
      params.push(filter.ma_phong);
    }

    sql += " ORDER BY hk.nam_hoc DESC, hk.ten_hoc_ky DESC, sv.ho_ten ASC";

    const [rows] = await pool.query(sql, params);

    // Quy đổi điểm sang thang 4, chữ và xếp loại (nếu cần)
    const data = rows.map((r) => {
      const diemTong = parseFloat(r.diem_tong) || 0;
      const { he4, chu } = quyDoiDiem(diemTong);
      const ketQua = diemTong >= 4 ? "Đạt" : "Không đạt";
      return { ...r, diem_chu: chu, diem_thang_4: he4, ket_qua: ketQua };
    });

    res.json({ data });
  } catch (error) {
    console.error("[getDiemTheoKhoa]", error);
    res.status(500).json({ error: "Lỗi khi lấy điểm theo khoa" });
  }
};

export const getDiemByGiangVien = async (req, res) => {
  try {
    const userId = req.user.id;
    const [gv] = await pool.query("SELECT ma_giang_vien FROM giang_vien WHERE id_tai_khoan = ?", [userId]);
    if (!gv.length) return res.status(404).json({ error: "Không tìm thấy giảng viên." });
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

export const updateDiemByGiangVien = async (req, res) => {
  try {
    const userId = req.user.id;
    const [gv] = await pool.query("SELECT ma_giang_vien FROM giang_vien WHERE id_tai_khoan = ?", [userId]);
    if (!gv.length) return res.status(404).json({ error: "Không tìm thấy giảng viên." });
    const ma_gv = gv[0].ma_giang_vien;
    const { ma_sinh_vien, ma_lop_hp, diem_hs1, diem_hs2, diem_thi, diem_tong, ket_qua, trang_thai } = req.body;
    const [check] = await pool.query("SELECT * FROM lop_hoc_phan WHERE ma_lop_hp = ? AND ma_giang_vien = ?", [ma_lop_hp, ma_gv]);
    if (!check.length) return res.status(403).json({ error: "Không có quyền với lớp này." });
    const { he4 } = quyDoiDiem(diem_tong);
    const ketQuaAuto = he4 > 0 ? "Dat" : "KhongDat";
    await pool.query(`
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
    `, [ma_sinh_vien, ma_lop_hp, diem_hs1, diem_hs2, diem_thi, diem_tong, he4, ket_qua || ketQuaAuto, trang_thai]);
    res.json({ message: "✅ Cập nhật điểm thành công." });
  } catch (err) {
    console.error("[updateDiemByGiangVien]", err);
    res.status(500).json({ error: "Lỗi khi giảng viên cập nhật điểm." });
  }
};

export const upsertDiem = async (req, res) => {
  try {
    const { ma_sinh_vien, ma_lop_hp, lan_hoc, diem_hs1, diem_hs2, diem_thi, diem_tong, ket_qua, trang_thai } = req.body;
    const { he4 } = quyDoiDiem(diem_tong);
    const ketQuaAuto = he4 > 0 ? "Dat" : "KhongDat";
    await pool.query(`
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
    `, [ma_sinh_vien, ma_lop_hp, lan_hoc, diem_hs1, diem_hs2, diem_thi, diem_tong, he4, ket_qua || ketQuaAuto, trang_thai]);
    res.json({ message: "✅ Cập nhật điểm thành công" });
  } catch (err) {
    console.error("[upsertDiem]", err);
    res.status(500).json({ error: "Lỗi khi cập nhật điểm" });
  }
};

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

export const getDiemChiTiet = async (req, res) => {
  try {
    const { id_diem } = req.params;
    const [rows] = await pool.query("SELECT * FROM diem_chi_tiet WHERE id_diem = ? ORDER BY id_ct ASC", [id_diem]);
    res.json({ data: rows });
  } catch (err) {
    console.error("[getDiemChiTiet]", err);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết điểm" });
  }
};

export const upsertDiemChiTiet = async (req, res) => {
  try {
    const { id_diem, ten_bai_kt, loai_he_so, diem } = req.body;
    await pool.query("INSERT INTO diem_chi_tiet (id_diem, ten_bai_kt, loai_he_so, diem) VALUES (?, ?, ?, ?)", [id_diem, ten_bai_kt, loai_he_so, diem]);
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
