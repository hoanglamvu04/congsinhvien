import pool from "../config/db.js";
import fs from "fs-extra";
import path from "path";

// 🧠 Hàm tạo đường dẫn thư mục ảnh tự động
const getStudentDir = (tenKhoa, tenNganh, tenLop, maSinhVien) => {
  const base = path.resolve("uploads/sinhvien");
  return path.join(base, tenKhoa, tenNganh, tenLop, maSinhVien);
};

// 📘 Lấy danh sách sinh viên
export const getAllSinhVien = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sv.*, l.ten_lop, n.ten_nganh, k.ten_khoa 
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.ma_lop = l.ma_lop
      LEFT JOIN nganh n ON sv.ma_nganh = n.ma_nganh
      LEFT JOIN khoa k ON sv.ma_khoa = k.ma_khoa
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách sinh viên" });
  }
};

// 📘 Lấy thông tin sinh viên theo token
export const getSinhVienByToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `
      SELECT sv.*, l.ten_lop, n.ten_nganh, k.ten_khoa, tk.ten_dang_nhap
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.ma_lop = l.ma_lop
      LEFT JOIN nganh n ON sv.ma_nganh = n.ma_nganh
      LEFT JOIN khoa k ON sv.ma_khoa = k.ma_khoa
      JOIN tai_khoan tk ON sv.id_tai_khoan = tk.id_tai_khoan
      WHERE sv.id_tai_khoan = ?
      `,
      [userId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy sinh viên." });

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Lỗi khi lấy sinh viên:", error);
    res.status(500).json({ error: "Lỗi khi lấy sinh viên." });
  }
};
// 📘 Lấy thông tin sinh viên theo tên đăng nhập (cho người khác xem)
// 📘 Lấy sinh viên theo tên đăng nhập (cho chat)
export const getSinhVienByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const [rows] = await pool.query(
      `
      SELECT sv.*, l.ten_lop, n.ten_nganh, k.ten_khoa, tk.ten_dang_nhap
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.ma_lop = l.ma_lop
      LEFT JOIN nganh n ON sv.ma_nganh = n.ma_nganh
      LEFT JOIN khoa k ON sv.ma_khoa = k.ma_khoa
      JOIN tai_khoan tk ON sv.id_tai_khoan = tk.id_tai_khoan
      WHERE tk.ten_dang_nhap = ?
      `,
      [username]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Lỗi khi lấy sinh viên theo username:", error);
    res.status(500).json({ error: "Lỗi khi lấy sinh viên theo username" });
  }
};


// ➕ Thêm sinh viên
export const createSinhVien = async (req, res) => {
  try {
    const {
      ma_sinh_vien,
      id_tai_khoan,
      cccd,
      ho_ten,
      ngay_sinh,
      gioi_tinh,
      ma_lop,
      ma_nganh,
      ma_khoa,
      khoa_hoc,
      dia_chi,
      nguoi_giam_ho,
      sdt_giam_ho,
      dien_thoai,
      email,
      trang_thai_hoc_tap,
    } = req.body;

    // Lấy tên khoa/ngành/lớp để tạo thư mục
    const [[info]] = await pool.query(
      `SELECT k.ten_khoa, n.ten_nganh, l.ten_lop
       FROM khoa k
       JOIN nganh n ON n.ma_khoa = k.ma_khoa
       JOIN lop l ON l.ma_nganh = n.ma_nganh
       WHERE l.ma_lop = ? LIMIT 1`,
      [ma_lop]
    );

    const folderPath = getStudentDir(
      info.ten_khoa,
      info.ten_nganh,
      info.ten_lop,
      ma_sinh_vien
    );

    await fs.ensureDir(folderPath); // tạo thư mục

    // Nếu có file ảnh
    let fileName = null;
    if (req.file) {
      fileName = req.file.filename;
      const filePath = path.join(folderPath, fileName);
      await fs.move(req.file.path, filePath, { overwrite: true });
    }

    await pool.query(
      `INSERT INTO sinh_vien 
      (ma_sinh_vien, id_tai_khoan, cccd, ho_ten, ngay_sinh, gioi_tinh, ma_lop, ma_nganh, ma_khoa, khoa_hoc, dia_chi, nguoi_giam_ho, sdt_giam_ho, dien_thoai, email, hinh_anh, trang_thai_hoc_tap)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ma_sinh_vien,
        id_tai_khoan || null,
        cccd,
        ho_ten,
        ngay_sinh,
        gioi_tinh,
        ma_lop,
        ma_nganh,
        ma_khoa,
        khoa_hoc || null,
        dia_chi || null,
        nguoi_giam_ho || null,
        sdt_giam_ho || null,
        dien_thoai || null,
        email || null,
        fileName ? `/uploads/sinhvien/${info.ten_khoa}/${info.ten_nganh}/${info.ten_lop}/${ma_sinh_vien}/${fileName}` : null,
        trang_thai_hoc_tap || "danghoc",
      ]
    );

    res.status(201).json({ message: "✅ Thêm sinh viên thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi thêm sinh viên" });
  }
};

// ✏️ Cập nhật sinh viên
export const updateSinhVien = async (req, res) => {
  try {
    const { ma_sinh_vien } = req.params;
    const {
      cccd,
      ho_ten,
      ngay_sinh,
      gioi_tinh,
      ma_lop,
      ma_nganh,
      ma_khoa,
      khoa_hoc,
      dia_chi,
      nguoi_giam_ho,
      sdt_giam_ho,
      dien_thoai,
      email,
      trang_thai_hoc_tap,
    } = req.body;

    let imagePath = null;

    // Nếu có upload ảnh mới
    if (req.file) {
      // 🔍 Bổ sung truy vấn để lấy thông tin lớp/khoa/ngành
      const [[info]] = await pool.query(
        `SELECT k.ten_khoa, n.ten_nganh, l.ten_lop
         FROM khoa k
         JOIN nganh n ON n.ma_khoa = k.ma_khoa
         JOIN lop l ON l.ma_nganh = n.ma_nganh
         WHERE l.ma_lop = ? LIMIT 1`,
        [ma_lop]
      );

      // 📁 Dựng thư mục và di chuyển ảnh
      const folderPath = path.join(
        "uploads",
        "sinhvien",
        info.ten_khoa,
        info.ten_nganh,
        info.ten_lop,
        ma_sinh_vien
      );

      await fs.ensureDir(folderPath);
      const destPath = path.join(folderPath, req.file.filename);
      await fs.move(req.file.path, destPath, { overwrite: true });

      imagePath = `/${destPath.replace(/\\/g, "/")}`;
    }

    // 🔄 Cập nhật DB
    await pool.query(
      `UPDATE sinh_vien 
       SET cccd=?, ho_ten=?, ngay_sinh=?, gioi_tinh=?, ma_lop=?, ma_nganh=?, ma_khoa=?, khoa_hoc=?, dia_chi=?, nguoi_giam_ho=?, sdt_giam_ho=?, dien_thoai=?, email=?, hinh_anh=COALESCE(?, hinh_anh), trang_thai_hoc_tap=?
       WHERE ma_sinh_vien=?`,
      [
        cccd,
        ho_ten,
        ngay_sinh,
        gioi_tinh,
        ma_lop,
        ma_nganh,
        ma_khoa,
        khoa_hoc,
        dia_chi,
        nguoi_giam_ho,
        sdt_giam_ho,
        dien_thoai,
        email,
        imagePath,
        trang_thai_hoc_tap,
        ma_sinh_vien,
      ]
    );

    res.json({ message: "✅ Cập nhật sinh viên thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sinh viên:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật sinh viên" });
  }
};

// 🗑️ Xóa sinh viên + thư mục
export const deleteSinhVien = async (req, res) => {
  try {
    const { ma_sinh_vien } = req.params;

    const [[sv]] = await pool.query(
      `SELECT sv.ma_sinh_vien, k.ten_khoa, n.ten_nganh, l.ten_lop 
       FROM sinh_vien sv
       LEFT JOIN lop l ON sv.ma_lop = l.ma_lop
       LEFT JOIN nganh n ON sv.ma_nganh = n.ma_nganh
       LEFT JOIN khoa k ON sv.ma_khoa = k.ma_khoa
       WHERE sv.ma_sinh_vien = ?`,
      [ma_sinh_vien]
    );

    if (!sv) return res.status(404).json({ message: "Không tìm thấy sinh viên" });

    // Xóa thư mục ảnh
    const folderPath = getStudentDir(
      sv.ten_khoa,
      sv.ten_nganh,
      sv.ten_lop,
      ma_sinh_vien
    );
    await fs.remove(folderPath);

    // Xóa bản ghi trong DB
    await pool.query("DELETE FROM sinh_vien WHERE ma_sinh_vien = ?", [ma_sinh_vien]);

    res.json({ message: "🗑️ Xóa sinh viên và thư mục thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi xóa sinh viên" });
  }
};
