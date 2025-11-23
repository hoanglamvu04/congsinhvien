import pool from "../config/db.js";

// 🧩 Hàm hỗ trợ tính ngày học theo tuần học
function getNgayHocTheoTuan(ngayBatDauHocKy, thuTrongTuan, soTuan) {
  // Chuyển về đối tượng Date
  const startDate = new Date(ngayBatDauHocKy);
  // Dịch sang tuần tương ứng (soTuan - 1)
  startDate.setDate(startDate.getDate() + (soTuan - 1) * 7);
  // Tính offset thứ (2=Monday → offset=0)
  const offset = thuTrongTuan - 2;
  startDate.setDate(startDate.getDate() + offset);
  return startDate.toISOString().slice(0, 10);
}

// 📘 Admin xem toàn bộ thời khóa biểu
export const getAllTkb = async (req, res) => {
  try {
    const { keyword } = req.query;
    const search = `%${keyword || ""}%`;
    const [rows] = await pool.query(
      `
      SELECT tkb.*, mh.ten_mon, gv.ho_ten AS ten_giang_vien, lhp.ma_lop_hp
      FROM thoi_khoa_bieu tkb
      LEFT JOIN lop_hoc_phan lhp ON tkb.ma_lop_hp = lhp.ma_lop_hp
      LEFT JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      LEFT JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      WHERE mh.ten_mon LIKE ? OR gv.ho_ten LIKE ? OR lhp.ma_lop_hp LIKE ? OR tkb.phong_hoc LIKE ?
      ORDER BY tkb.ngay_hoc ASC, tkb.tiet_bat_dau ASC
      `,
      [search, search, search, search]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error("❌ Lỗi khi lấy TKB:", error);
    res.status(500).json({ error: "Lỗi khi lấy thời khóa biểu" });
  }
};

// 📘 Sinh viên xem lịch học của chính mình (CÓ LỌC)
export const getTkbBySinhVien = async (req, res) => {
  try {
    const userId = req.user.id;

    const [svRows] = await pool.query(
      "SELECT ma_sinh_vien FROM sinh_vien WHERE id_tai_khoan = ?",
      [userId]
    );
    if (svRows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy sinh viên." });

    const ma_sinh_vien = svRows[0].ma_sinh_vien;

    // ===== ⚡ Query Params =====
    const { hocky, mon, tuan_start, tuan_end } = req.query;

    let query = `
      SELECT bh.*, mh.ten_mon, gv.ho_ten AS ten_giang_vien, lhp.ma_lop_hp, lhp.ma_hoc_ky AS hoc_ky
      FROM buoi_hoc bh
      JOIN thoi_khoa_bieu tkb ON tkb.id_tkb = bh.id_tkb
      JOIN lop_hoc_phan lhp ON tkb.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      JOIN dang_ky_mon dk ON dk.ma_lop_hp = lhp.ma_lop_hp
      WHERE dk.ma_sinh_vien = ?
    `;

    const params = [ma_sinh_vien];

    if (hocky) {
      query += " AND lhp.ma_hoc_ky = ? ";
      params.push(hocky);
    }

    if (mon) {
      query += " AND mh.ten_mon = ? ";
      params.push(mon);
    }

    // lọc theo ngày tuần
    if (tuan_start && tuan_end) {
      query += " AND bh.ngay_hoc BETWEEN ? AND ? ";
      params.push(tuan_start, tuan_end);
    }

    query += `
      ORDER BY bh.ngay_hoc ASC, bh.tiet_bat_dau ASC
    `;

    const [rows] = await pool.query(query, params);

    res.json({ data: rows });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch học sinh viên:", error);
    res.status(500).json({ error: "Lỗi khi lấy lịch học thực tế." });
  }
};


// 📘 Giảng viên xem lịch giảng dạy
export const getTkbByGiangVien = async (req, res) => {
  try {
    const userId = req.user.id;
    const [gvRows] = await pool.query("SELECT ma_giang_vien FROM giang_vien WHERE id_tai_khoan = ?", [userId]);
    if (gvRows.length === 0) return res.status(404).json({ message: "Không tìm thấy giảng viên." });
    const ma_giang_vien = gvRows[0].ma_giang_vien;

    const [rows] = await pool.query(
      `
      SELECT tkb.*, mh.ten_mon, lhp.ma_lop_hp, gv.ho_ten AS ten_giang_vien
      FROM thoi_khoa_bieu tkb
      JOIN lop_hoc_phan lhp ON tkb.ma_lop_hp = lhp.ma_lop_hp
      JOIN mon_hoc mh ON lhp.ma_mon = mh.ma_mon
      JOIN giang_vien gv ON lhp.ma_giang_vien = gv.ma_giang_vien
      WHERE gv.ma_giang_vien = ?
      ORDER BY tkb.ngay_hoc ASC, tkb.tiet_bat_dau ASC
      `,
      [ma_giang_vien]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch giảng dạy:", error);
    res.status(500).json({ error: "Lỗi khi lấy lịch giảng dạy của giảng viên." });
  }
};

// ➕ Admin thêm thời khóa biểu và tự sinh buổi học
export const createTkb = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      ma_lop_hp,
      thu_trong_tuan,
      tiet_bat_dau,
      tiet_ket_thuc,
      phong_hoc,
      trang_thai,
      tuan_bat_dau,
      tuan_ket_thuc,
    } = req.body;

    // 🔹 Lấy ngày bắt đầu học kỳ qua lớp học phần
    const [[info]] = await conn.query(
      `SELECT hk.ngay_bat_dau, hk.ngay_ket_thuc
       FROM lop_hoc_phan lhp
       JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
       WHERE lhp.ma_lop_hp = ? LIMIT 1`,
      [ma_lop_hp]
    );

    if (!info) return res.status(400).json({ error: "Không xác định được học kỳ của lớp học phần." });

    // 🔹 Chèn bản ghi TKB chính
    const [result] = await conn.query(
      `
      INSERT INTO thoi_khoa_bieu 
      (ma_lop_hp, thu_trong_tuan, tiet_bat_dau, tiet_ket_thuc, phong_hoc, trang_thai, tuan_bat_dau, tuan_ket_thuc)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [ma_lop_hp, thu_trong_tuan, tiet_bat_dau, tiet_ket_thuc, phong_hoc, trang_thai || "hoc", tuan_bat_dau, tuan_ket_thuc]
    );

    const id_tkb = result.insertId;

    // 🔹 Sinh tự động buổi học theo tuần
    for (let tuan = tuan_bat_dau; tuan <= tuan_ket_thuc; tuan++) {
      const ngayHoc = getNgayHocTheoTuan(info.ngay_bat_dau, thu_trong_tuan, tuan);
      await conn.query(
        `
        INSERT INTO buoi_hoc (id_tkb, ma_lop_hp, ngay_hoc, thu_trong_tuan, tiet_bat_dau, tiet_ket_thuc, phong_hoc, tuan_hoc, trang_thai)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'chua_hoc')
        `,
        [id_tkb, ma_lop_hp, ngayHoc, thu_trong_tuan, tiet_bat_dau, tiet_ket_thuc, phong_hoc, tuan]
      );
    }

    res.status(201).json({ message: "✅ Thêm thời khóa biểu và sinh buổi học tự động thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm TKB:", error);
    res.status(500).json({ error: "Lỗi khi thêm thời khóa biểu" });
  } finally {
    conn.release();
  }
};

// ✏️ Cập nhật TKB
export const updateTkb = async (req, res) => {
  try {
    const { id_tkb } = req.params;
    const {
      ma_lop_hp,
      thu_trong_tuan,
      tiet_bat_dau,
      tiet_ket_thuc,
      phong_hoc,
      trang_thai,
      tuan_bat_dau,
      tuan_ket_thuc,
    } = req.body;

    await pool.query(
      `
      UPDATE thoi_khoa_bieu
      SET ma_lop_hp=?, thu_trong_tuan=?, tiet_bat_dau=?, tiet_ket_thuc=?, phong_hoc=?, trang_thai=?, tuan_bat_dau=?, tuan_ket_thuc=?
      WHERE id_tkb=?
      `,
      [ma_lop_hp, thu_trong_tuan, tiet_bat_dau, tiet_ket_thuc, phong_hoc, trang_thai, tuan_bat_dau, tuan_ket_thuc, id_tkb]
    );

    res.json({ message: "✅ Cập nhật thời khóa biểu thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật TKB:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật thời khóa biểu" });
  }
};

// 🗑️ Xóa thời khóa biểu và buổi học liên quan
export const deleteTkb = async (req, res) => {
  try {
    const { id_tkb } = req.params;
    await pool.query("DELETE FROM buoi_hoc WHERE id_tkb = ?", [id_tkb]);
    await pool.query("DELETE FROM thoi_khoa_bieu WHERE id_tkb = ?", [id_tkb]);
    res.json({ message: "🗑️ Xóa thời khóa biểu và buổi học thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa TKB:", error);
    res.status(500).json({ error: "Lỗi khi xóa thời khóa biểu" });
  }
};
export const regenerateBuoiHoc = async (req, res) => {
  const { id_tkb } = req.params;
  const conn = await pool.getConnection();
  try {
    // 🔹 Lấy thông tin thời khóa biểu
    const [[tkb]] = await conn.query(
      `SELECT tkb.*, hk.ngay_bat_dau 
       FROM thoi_khoa_bieu tkb
       JOIN lop_hoc_phan lhp ON tkb.ma_lop_hp = lhp.ma_lop_hp
       JOIN hoc_ky hk ON lhp.ma_hoc_ky = hk.ma_hoc_ky
       WHERE id_tkb=?`,
      [id_tkb]
    );
    if (!tkb) return res.status(404).json({ message: "Không tìm thấy TKB." });

    // 🔹 Xóa buổi cũ
    await conn.query("DELETE FROM buoi_hoc WHERE id_tkb = ?", [id_tkb]);

    // 🔹 Sinh lại buổi học mới
    for (let tuan = tkb.tuan_bat_dau; tuan <= tkb.tuan_ket_thuc; tuan++) {
      const ngayHoc = getNgayHocTheoTuan(tkb.ngay_bat_dau, tkb.thu_trong_tuan, tuan);
      await conn.query(
        `INSERT INTO buoi_hoc 
         (id_tkb, ma_lop_hp, ngay_hoc, thu_trong_tuan, tiet_bat_dau, tiet_ket_thuc, phong_hoc, tuan_hoc, trang_thai)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'chua_hoc')`,
        [id_tkb, tkb.ma_lop_hp, ngayHoc, tkb.thu_trong_tuan, tkb.tiet_bat_dau, tkb.tiet_ket_thuc, tkb.phong_hoc, tuan]
      );
    }

    res.json({ message: "🔁 Đã tái tạo lại buổi học thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi tái tạo buổi học" });
  } finally {
    conn.release();
  }
};
