import pool from "../config/db.js";

/**
 * 📘 Lấy danh sách điểm danh của 1 lớp học phần
 * (chỉ giảng viên dạy lớp hoặc admin xem được)
 */
export const getDiemDanhByLopHp = async (req, res) => {
  try {
    const { ma_lop_hp } = req.params;
    const user = req.user;

    // 🔒 Nếu là giảng viên -> chỉ xem lớp mình dạy
    if (user.role === "giangvien") {
      const [check] = await pool.query(
        "SELECT 1 FROM lop_hoc_phan WHERE ma_lop_hp=? AND ma_giang_vien=?",
        [ma_lop_hp, user.ma_giang_vien]
      );
      if (!check.length)
        return res
          .status(403)
          .json({ error: "Bạn không có quyền xem lớp học phần này" });
    }

    const [rows] = await pool.query(
      `
      SELECT dd.*, sv.ho_ten, tkb.ngay_hoc, tkb.tiet_bat_dau, tkb.tiet_ket_thuc
      FROM diem_danh dd
      JOIN sinh_vien sv ON dd.ma_sinh_vien = sv.ma_sinh_vien
      JOIN thoi_khoa_bieu tkb ON dd.id_tkb = tkb.id_tkb
      WHERE dd.ma_lop_hp = ?
      ORDER BY tkb.ngay_hoc ASC, sv.ho_ten ASC
      `,
      [ma_lop_hp]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error("[getDiemDanhByLopHp]", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách điểm danh" });
  }
};

/**
 * ➕ Giảng viên điểm danh (thêm hoặc cập nhật)
 */
export const upsertDiemDanh = async (req, res) => {
  try {
    const user = req.user;
    const ma_giang_vien = user.ma_giang_vien;
    const { ma_lop_hp, id_tkb, ma_sinh_vien, trang_thai, so_tiet_vang, ghi_chu } =
      req.body;

    if (!ma_lop_hp || !id_tkb || !ma_sinh_vien)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    // Kiểm tra giảng viên có dạy lớp này không
    const [check] = await pool.query(
      "SELECT 1 FROM lop_hoc_phan WHERE ma_lop_hp=? AND ma_giang_vien=?",
      [ma_lop_hp, ma_giang_vien]
    );
    if (!check.length)
      return res.status(403).json({ error: "Không có quyền điểm danh lớp này" });

    await pool.query(
      `
      INSERT INTO diem_danh 
      (ma_lop_hp, id_tkb, ma_sinh_vien, ma_giang_vien, trang_thai, so_tiet_vang, ghi_chu)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        trang_thai=VALUES(trang_thai),
        so_tiet_vang=VALUES(so_tiet_vang),
        ghi_chu=VALUES(ghi_chu),
        thoi_gian_diem_danh=NOW()
      `,
      [
        ma_lop_hp,
        id_tkb,
        ma_sinh_vien,
        ma_giang_vien,
        trang_thai || "comat",
        so_tiet_vang || 0,
        ghi_chu || null,
      ]
    );

    res.json({ message: "✅ Cập nhật điểm danh thành công" });
  } catch (error) {
    console.error("[upsertDiemDanh]", error);
    res.status(500).json({ error: "Lỗi khi cập nhật điểm danh" });
  }
};

/**
 * 🗑️ Xóa bản ghi điểm danh
 */
export const deleteDiemDanh = async (req, res) => {
  try {
    const { id_diem_danh } = req.params;
    await pool.query("DELETE FROM diem_danh WHERE id_diem_danh=?", [id_diem_danh]);
    res.json({ message: "🗑️ Xóa điểm danh thành công" });
  } catch (error) {
    console.error("[deleteDiemDanh]", error);
    res.status(500).json({ error: "Lỗi khi xóa điểm danh" });
  }
};

/**
 * 📊 Thống kê chuyên cần của lớp học phần
 */
export const getThongKeChuyenCan = async (req, res) => {
  try {
    const { ma_lop_hp } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        dd.ma_sinh_vien,
        sv.ho_ten,
        COUNT(dd.id_diem_danh) AS tong_buoi,
        SUM(
          CASE 
            WHEN dd.trang_thai='comat' THEN 1
            WHEN dd.trang_thai IN ('tre','vesom') THEN 0.5
            WHEN dd.trang_thai='nghicohep' THEN 0.5
            ELSE 0
          END
        ) AS buoi_duoc_tinh,
        ROUND(
          (
            SUM(
              CASE 
                WHEN dd.trang_thai='comat' THEN 1
                WHEN dd.trang_thai IN ('tre','vesom') THEN 0.5
                WHEN dd.trang_thai='nghicohep' THEN 0.5
                ELSE 0
              END
            ) / COUNT(dd.id_diem_danh)
          ) * 100, 1
        ) AS ti_le_chuyen_can
      FROM diem_danh dd
      JOIN sinh_vien sv ON dd.ma_sinh_vien = sv.ma_sinh_vien
      WHERE dd.ma_lop_hp = ?
      GROUP BY dd.ma_sinh_vien, sv.ho_ten
      ORDER BY sv.ho_ten
      `,
      [ma_lop_hp]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error("[getThongKeChuyenCan]", error);
    res.status(500).json({ error: "Lỗi khi thống kê chuyên cần" });
  }
};

/**
 * 📘 Lấy lịch điểm danh theo buổi (giảng viên xem từng ngày)
 */
export const getDiemDanhByBuoi = async (req, res) => {
  try {
    const { id_tkb } = req.params;

    const [rows] = await pool.query(
      `
      SELECT dd.*, sv.ho_ten, sv.ma_sinh_vien
      FROM diem_danh dd
      JOIN sinh_vien sv ON dd.ma_sinh_vien = sv.ma_sinh_vien
      WHERE dd.id_tkb = ?
      ORDER BY sv.ho_ten
      `,
      [id_tkb]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error("[getDiemDanhByBuoi]", error);
    res.status(500).json({ error: "Lỗi khi lấy điểm danh buổi học" });
  }
};
