import pool from "../config/db.js";
import fs from "fs-extra";
import path from "path";
import bcrypt from "bcryptjs";

// 🧠 Hàm tạo đường dẫn thư mục ảnh tự động
const getStudentDir = (tenKhoa, tenNganh, tenLop, maSinhVien) => {
  const base = path.resolve("uploads/sinhvien");
  return path.join(base, tenKhoa, tenNganh, tenLop, maSinhVien);
};

// 📘 Lấy danh sách sinh viên (hỗ trợ phân trang + lọc)
export const getAllSinhVien = async (req, res) => {
  try {
    const { page = 1, limit = 10, ma_khoa, ma_lop, keyword } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT SQL_CALC_FOUND_ROWS sv.*, l.ten_lop, n.ten_nganh, k.ten_khoa
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.ma_lop = l.ma_lop
      LEFT JOIN nganh n ON sv.ma_nganh = n.ma_nganh
      LEFT JOIN khoa k ON sv.ma_khoa = k.ma_khoa
      WHERE 1=1
    `;
    const params = [];

    if (ma_khoa) {
      sql += " AND sv.ma_khoa = ?";
      params.push(ma_khoa);
    }

    if (ma_lop) {
      sql += " AND sv.ma_lop = ?";
      params.push(ma_lop);
    }

    if (keyword) {
      sql += " AND (sv.ho_ten LIKE ? OR sv.ma_sinh_vien LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);
    const [[{ "FOUND_ROWS()": total }]] = await pool.query("SELECT FOUND_ROWS()");

    res.json({ data: rows, total }); // ✅ Chuẩn cấu trúc phân trang
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sinh viên:", error);
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
// 📘 Lấy chi tiết sinh viên theo mã
export const getSinhVienById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT sv.*, l.ten_lop, n.ten_nganh, k.ten_khoa
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.ma_lop = l.ma_lop
      LEFT JOIN nganh n ON sv.ma_nganh = n.ma_nganh
      LEFT JOIN khoa k ON sv.ma_khoa = k.ma_khoa
      WHERE sv.ma_sinh_vien = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy sinh viên" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết sinh viên:", error);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết sinh viên" });
  }
};
export const getSinhVienByLop = async (req, res) => {
  try {
    const { ma_lop } = req.params;
    const [rows] = await pool.query(
      "SELECT ma_sinh_vien, ho_ten FROM sinh_vien WHERE ma_lop = ?",
      [ma_lop]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error("❌ Lỗi khi lấy sinh viên theo lớp:", error);
    res.status(500).json({ error: "Không thể lấy danh sách sinh viên theo lớp" });
  }
};
export const getSinhVienTheoKhoa = async (req, res) => {
  try {
    const { page = 1, limit = 10, ma_khoa, keyword } = req.query;
    const offset = (page - 1) * limit;

    // 🧠 Lấy filter từ middleware
    const filter = req.filter || {};
    const params = [];
    let sql = `
      SELECT SQL_CALC_FOUND_ROWS
        sv.ma_sinh_vien, sv.ho_ten, sv.email, sv.dien_thoai, sv.trang_thai_hoc_tap,
        l.ten_lop, n.ten_nganh, k.ma_khoa, k.ten_khoa, pb.ten_phong
      FROM sinh_vien sv
      LEFT JOIN lop l ON sv.ma_lop = l.ma_lop
      LEFT JOIN nganh n ON sv.ma_nganh = n.ma_nganh
      LEFT JOIN khoa k ON sv.ma_khoa = k.ma_khoa
      LEFT JOIN phong_ban pb ON k.ma_phong = pb.ma_phong
      WHERE 1=1
    `;

    // 🔎 Lọc theo mã khoa nếu có
    if (ma_khoa) {
      sql += " AND sv.ma_khoa = ?";
      params.push(ma_khoa);
    }

    // 🔎 Lọc theo keyword (tên hoặc mã SV)
    if (keyword) {
      sql += " AND (sv.ho_ten LIKE ? OR sv.ma_sinh_vien LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 🏛️ Nếu không phải admin / PĐT → giới hạn theo phòng ban
    if (!filter.all && filter.ma_phong) {
      sql += " AND k.ma_phong = ?";
      params.push(filter.ma_phong);
    }

    sql += " ORDER BY sv.ho_ten ASC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    // ⚙️ Thực thi truy vấn
    const [rows] = await pool.query(sql, params);
    const [[{ "FOUND_ROWS()": total }]] = await pool.query("SELECT FOUND_ROWS()");

    res.json({
      total,
      data: rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy sinh viên theo khoa:", error);
    res.status(500).json({ error: "Lỗi khi lấy sinh viên theo khoa" });
  }
};
// ➕ Thêm sinh viên
export const createSinhVien = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      ma_sinh_vien,
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

    // 🔒 Bắt đầu transaction
    await connection.beginTransaction();

    // 🧠 1️⃣ Tạo tài khoản tự động cho sinh viên
    const tenDangNhap = ma_sinh_vien;
    const hashedPassword = await bcrypt.hash(ma_sinh_vien, 10); // hoặc "123456"
    const [tkResult] = await connection.query(
      `INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai)
       VALUES (?, ?, 'sinhvien', 'hoatdong')`,
      [tenDangNhap, hashedPassword]
    );
    const id_tai_khoan = tkResult.insertId;

    // 🧠 2️⃣ Lấy tên khoa/ngành/lớp để tạo thư mục
    const [[info]] = await connection.query(
      `SELECT k.ten_khoa, n.ten_nganh, l.ten_lop
       FROM khoa k
       JOIN nganh n ON n.ma_khoa = k.ma_khoa
       JOIN lop l ON l.ma_nganh = n.ma_nganh
       WHERE l.ma_lop = ? LIMIT 1`,
      [ma_lop]
    );

    const folderPath = path.resolve(
      "uploads/sinhvien",
      info.ten_khoa,
      info.ten_nganh,
      info.ten_lop,
      ma_sinh_vien
    );
    await fs.ensureDir(folderPath);

    // 🧠 3️⃣ Nếu có ảnh → lưu
    let fileName = null;
    if (req.file) {
      fileName = req.file.filename;
      const filePath = path.join(folderPath, fileName);
      await fs.move(req.file.path, filePath, { overwrite: true });
    }

    // 🧠 4️⃣ Tạo bản ghi sinh viên, gắn id_tai_khoan
    await connection.query(
      `INSERT INTO sinh_vien 
      (ma_sinh_vien, id_tai_khoan, cccd, ho_ten, ngay_sinh, gioi_tinh, ma_lop, ma_nganh, ma_khoa, khoa_hoc, dia_chi, nguoi_giam_ho, sdt_giam_ho, dien_thoai, email, hinh_anh, trang_thai_hoc_tap)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ma_sinh_vien,
        id_tai_khoan,
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
        fileName
          ? `/uploads/sinhvien/${info.ten_khoa}/${info.ten_nganh}/${info.ten_lop}/${ma_sinh_vien}/${fileName}`
          : null,
        trang_thai_hoc_tap || "danghoc",
      ]
    );

    await connection.commit();

    res.status(201).json({
      message: "✅ Thêm sinh viên & tài khoản thành công",
      data: {
        ma_sinh_vien,
        ten_dang_nhap: tenDangNhap,
        mat_khau_mac_dinh: ma_sinh_vien, // để admin biết
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Lỗi khi thêm sinh viên:", error);
    res.status(500).json({ error: "Lỗi khi thêm sinh viên" });
  } finally {
    connection.release();
  }
};

export const updateSinhVien = async (req, res) => {
  const connection = await pool.getConnection();
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

    await connection.beginTransaction();

    let imagePath = null;

    // 🖼️ Nếu có upload ảnh mới
    if (req.file) {
      // Lấy thông tin tên lớp, ngành, khoa
      const [[info]] = await connection.query(
        `SELECT k.ten_khoa, n.ten_nganh, l.ten_lop
         FROM khoa k
         JOIN nganh n ON n.ma_khoa = k.ma_khoa
         JOIN lop l ON l.ma_nganh = n.ma_nganh
         WHERE l.ma_lop = ? LIMIT 1`,
        [ma_lop]
      );

      const folderPath = path.resolve(
        "uploads/sinhvien",
        info.ten_khoa,
        info.ten_nganh,
        info.ten_lop,
        ma_sinh_vien
      );
      await fs.ensureDir(folderPath);

      const destPath = path.join(folderPath, req.file.filename);
      await fs.move(req.file.path, destPath, { overwrite: true });

      // Lưu theo format nhất quán với createSinhVien
      imagePath = `/uploads/sinhvien/${info.ten_khoa}/${info.ten_nganh}/${info.ten_lop}/${ma_sinh_vien}/${req.file.filename}`;
    }

    // 🔄 Cập nhật sinh viên
    await connection.query(
      `UPDATE sinh_vien 
       SET cccd=?, ho_ten=?, ngay_sinh=?, gioi_tinh=?, ma_lop=?, ma_nganh=?, ma_khoa=?, khoa_hoc=?, dia_chi=?, nguoi_giam_ho=?, sdt_giam_ho=?, dien_thoai=?, email=?, hinh_anh = COALESCE(?, hinh_anh), trang_thai_hoc_tap=?
       WHERE ma_sinh_vien=?`,
      [
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
        imagePath,
        trang_thai_hoc_tap || "danghoc",
        ma_sinh_vien,
      ]
    );

    await connection.commit();
    res.json({ message: "✅ Cập nhật sinh viên thành công" });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Lỗi khi cập nhật sinh viên:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật sinh viên" });
  } finally {
    connection.release();
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
