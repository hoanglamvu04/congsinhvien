import pool from "../config/db.js";

/**
 * 📘 Lấy danh sách khảo sát (Admin / Giảng viên / Sinh viên)
 */
export const getAllKhaoSat = async (req, res) => {
  try {
    const { role } = req.user;
    const { q = "" } = req.query;
    const keyword = `%${q}%`;

    let sql = `
      SELECT ks.*, k.ten_khoa 
      FROM khao_sat ks
      LEFT JOIN khoa k ON ks.ma_khoa = k.ma_khoa
    `;
    const params = [];

    if (role !== "admin") {
      // Nếu là giảng viên hoặc sinh viên → chỉ thấy khảo sát phù hợp hoặc 'tất cả'
      const doi_tuong = role === "giangvien" ? "giangvien" : "sinhvien";
      sql += " WHERE (ks.doi_tuong IN (?, 'tatca'))";
      params.push(doi_tuong);
    } else if (q) {
      sql += " WHERE (ks.tieu_de LIKE ? OR ks.noi_dung LIKE ? OR ks.doi_tuong LIKE ? OR ks.trang_thai LIKE ?)";
      params.push(keyword, keyword, keyword, keyword);
    }

    sql += " ORDER BY ks.ngay_bat_dau DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getAllKhaoSat]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách khảo sát" });
  }
};

/**
 * 📊 Lấy danh sách khảo sát theo khoa (Nhân viên khoa)
 */
export const getKhaoSatTheoKhoa = async (req, res) => {
  try {
    const { ma_khoa, keyword = "", trang_thai = "", doi_tuong = "" } = req.query;
    const filter = req.filter || {}; // từ middleware filterByDepartment
    const params = [];

    let sql = `
      SELECT ks.*, k.ten_khoa, pb.ten_phong
      FROM khao_sat ks
      LEFT JOIN khoa k ON ks.ma_khoa = k.ma_khoa
      LEFT JOIN phong_ban pb ON k.ma_phong = pb.ma_phong
      WHERE 1=1
    `;

    if (keyword) {
      sql += " AND (ks.tieu_de LIKE ? OR ks.noi_dung LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (trang_thai) {
      sql += " AND ks.trang_thai = ?";
      params.push(trang_thai);
    }

    if (doi_tuong) {
      sql += " AND ks.doi_tuong = ?";
      params.push(doi_tuong);
    }

    if (ma_khoa) {
      sql += " AND ks.ma_khoa = ?";
      params.push(ma_khoa);
    }

    if (!filter.all && filter.ma_phong) {
      sql += " AND k.ma_phong = ?";
      params.push(filter.ma_phong);
    }

    sql += " ORDER BY ks.ngay_bat_dau DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("[getKhaoSatTheoKhoa]", error);
    res.status(500).json({ error: "Lỗi khi lấy khảo sát theo khoa" });
  }
};

/**
 * ➕ Tạo khảo sát (Admin / Giảng viên / Khoa)
 */
export const createKhaoSat = async (req, res) => {
  try {
    const { role, ma_khoa } = req.user;
    const {
      tieu_de,
      noi_dung,
      ngay_bat_dau,
      ngay_ket_thuc,
      doi_tuong,
      trang_thai = "mo",
      nguoi_tao,
      ma_khoa: maKhoaBody,
    } = req.body;

    if (!tieu_de || !noi_dung || !ngay_bat_dau || !ngay_ket_thuc) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // 🏛️ Nếu là khoa → chỉ được tạo khảo sát cho khoa mình
    const maKhoaTao = role === "khoa" ? ma_khoa : maKhoaBody || null;
    const nguoiTaoFinal = nguoi_tao || req.user?.ho_ten || "Hệ thống";

    await pool.query(
      `
      INSERT INTO khao_sat 
        (tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai, nguoi_tao, ma_khoa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai, nguoiTaoFinal, maKhoaTao]
    );

    res.status(201).json({ message: "✅ Tạo khảo sát thành công" });
  } catch (error) {
    console.error("[createKhaoSat]", error);
    res.status(500).json({ error: "Lỗi khi tạo khảo sát" });
  }
};

/**
 * ✏️ Cập nhật khảo sát (Admin / Khoa)
 */
export const updateKhaoSat = async (req, res) => {
  try {
    const { id_khao_sat } = req.params;
    const { role, ma_khoa } = req.user;
    const {
      tieu_de,
      noi_dung,
      ngay_bat_dau,
      ngay_ket_thuc,
      doi_tuong,
      trang_thai,
      ma_khoa: maKhoaBody,
    } = req.body;

    const [exist] = await pool.query("SELECT * FROM khao_sat WHERE id_khao_sat=?", [id_khao_sat]);
    if (!exist.length) return res.status(404).json({ error: "Không tìm thấy bản ghi" });

    // ✅ Nếu là khoa → chỉ được sửa khảo sát thuộc khoa mình
    if (role === "khoa" && exist[0].ma_khoa !== ma_khoa) {
      return res.status(403).json({ error: "Không có quyền sửa khảo sát khoa khác" });
    }

    const maKhoaCapNhat = role === "khoa" ? ma_khoa : maKhoaBody || exist[0].ma_khoa;

    await pool.query(
      `
      UPDATE khao_sat
      SET tieu_de=?, noi_dung=?, ngay_bat_dau=?, ngay_ket_thuc=?, 
          doi_tuong=?, trang_thai=?, ma_khoa=?
      WHERE id_khao_sat=?
      `,
      [tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc, doi_tuong, trang_thai, maKhoaCapNhat, id_khao_sat]
    );

    res.json({ message: "✅ Cập nhật khảo sát thành công" });
  } catch (error) {
    console.error("[updateKhaoSat]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật khảo sát" });
  }
};

/**
 * 🗑️ Xóa khảo sát (Admin / Khoa)
 */
export const deleteKhaoSat = async (req, res) => {
  try {
    const { id_khao_sat } = req.params;
    const { role, ma_khoa } = req.user;

    const [rows] = await pool.query("SELECT ma_khoa FROM khao_sat WHERE id_khao_sat=?", [id_khao_sat]);
    if (!rows.length) return res.status(404).json({ error: "Không tìm thấy khảo sát" });

    // ✅ Nếu là khoa → chỉ được xóa khảo sát khoa mình
    if (role === "khoa" && rows[0].ma_khoa !== ma_khoa) {
      return res.status(403).json({ error: "Không có quyền xóa khảo sát khoa khác" });
    }

    await pool.query("DELETE FROM khao_sat WHERE id_khao_sat=?", [id_khao_sat]);
    res.json({ message: "🗑️ Xóa khảo sát thành công" });
  } catch (error) {
    console.error("[deleteKhaoSat]", error);
    res.status(500).json({ error: "Lỗi khi xóa khảo sát" });
  }
};
