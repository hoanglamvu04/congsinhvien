import pool from "../config/db.js";

export const traLoiKhaoSat = async (req, res) => {
  try {
    const { id_khao_sat, diem_danh_gia, noi_dung_phan_hoi, an_danh } = req.body;
    const ma_sinh_vien = req.user.ma_sinh_vien;
    await pool.query(
      `INSERT INTO phieu_tra_loi (id_khao_sat, ma_sinh_vien, diem_danh_gia, noi_dung_phan_hoi, an_danh)
       VALUES (?, ?, ?, ?, ?)`,
      [id_khao_sat, ma_sinh_vien, diem_danh_gia, noi_dung_phan_hoi, an_danh ? 1 : 0]
    );
    res.status(201).json({ message: "Gửi phản hồi khảo sát thành công" });
  } catch (err) {
    console.error("[traLoiKhaoSat]", err);
    res.status(500).json({ error: "Lỗi khi gửi phản hồi" });
  }
};

export const getAllPhieuTraLoi = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const keyword = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT p.*, ks.tieu_de, s.ho_ten
       FROM phieu_tra_loi p
       JOIN khao_sat ks ON p.id_khao_sat = ks.id_khao_sat
       JOIN sinh_vien s ON p.ma_sinh_vien = s.ma_sinh_vien
       WHERE ks.tieu_de LIKE ? OR s.ho_ten LIKE ? OR p.noi_dung_phan_hoi LIKE ?
       ORDER BY p.id_tra_loi DESC`,
      [keyword, keyword, keyword]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error("[getAllPhieuTraLoi]", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách phiếu trả lời" });
  }
};

export const getKetQuaKhaoSat = async (req, res) => {
  try {
    const { id_khao_sat } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, s.ho_ten, s.ma_sinh_vien
       FROM phieu_tra_loi p
       JOIN sinh_vien s ON p.ma_sinh_vien = s.ma_sinh_vien
       WHERE id_khao_sat = ?
       ORDER BY p.id_tra_loi DESC`,
      [id_khao_sat]
    );
    const [avg] = await pool.query(
      `SELECT ROUND(AVG(diem_danh_gia),1) AS diem_tb, COUNT(*) AS tong_phieu
       FROM phieu_tra_loi WHERE id_khao_sat=?`,
      [id_khao_sat]
    );
    res.json({ data: rows, thongke: avg[0] });
  } catch (err) {
    console.error("[getKetQuaKhaoSat]", err);
    res.status(500).json({ error: "Lỗi khi lấy kết quả khảo sát" });
  }
};

export const getThongKeKhaoSat = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ks.id_khao_sat, ks.tieu_de,
             COUNT(p.id_tra_loi) AS tong_phieu,
             ROUND(AVG(p.diem_danh_gia),1) AS diem_tb,
             MAX(p.diem_danh_gia) AS diem_max,
             MIN(p.diem_danh_gia) AS diem_min
      FROM khao_sat ks
      LEFT JOIN phieu_tra_loi p ON ks.id_khao_sat = p.id_khao_sat
      GROUP BY ks.id_khao_sat, ks.tieu_de
      ORDER BY ks.id_khao_sat DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    console.error("[getThongKeKhaoSat]", err);
    res.status(500).json({ error: "Lỗi khi lấy thống kê khảo sát" });
  }
};

export const deletePhieuTraLoi = async (req, res) => {
  try {
    const { id_tra_loi } = req.params;
    await pool.query("DELETE FROM phieu_tra_loi WHERE id_tra_loi=?", [id_tra_loi]);
    res.json({ message: "Xóa phản hồi thành công" });
  } catch (err) {
    console.error("[deletePhieuTraLoi]", err);
    res.status(500).json({ error: "Lỗi khi xóa phản hồi" });
  }
};

export const createPhieuTraLoiAdmin = async (req, res) => {
  try {
    const { id_khao_sat, ma_sinh_vien, diem_danh_gia, noi_dung_phan_hoi, an_danh } = req.body;
    await pool.query(
      `INSERT INTO phieu_tra_loi (id_khao_sat, ma_sinh_vien, diem_danh_gia, noi_dung_phan_hoi, an_danh)
       VALUES (?, ?, ?, ?, ?)`,
      [id_khao_sat, ma_sinh_vien, diem_danh_gia, noi_dung_phan_hoi, an_danh ? 1 : 0]
    );
    res.status(201).json({ message: "Thêm phản hồi thủ công thành công" });
  } catch (err) {
    console.error("[createPhieuTraLoiAdmin]", err);
    res.status(500).json({ error: "Lỗi khi thêm phản hồi" });
  }
};

export const updatePhieuTraLoiAdmin = async (req, res) => {
  try {
    const { id_tra_loi } = req.params;
    const { id_khao_sat, ma_sinh_vien, diem_danh_gia, noi_dung_phan_hoi, an_danh } = req.body;
    await pool.query(
      `UPDATE phieu_tra_loi
       SET id_khao_sat=?, ma_sinh_vien=?, diem_danh_gia=?, noi_dung_phan_hoi=?, an_danh=?
       WHERE id_tra_loi=?`,
      [id_khao_sat, ma_sinh_vien, diem_danh_gia, noi_dung_phan_hoi, an_danh, id_tra_loi]
    );
    res.json({ message: "Cập nhật phản hồi thành công" });
  } catch (err) {
    console.error("[updatePhieuTraLoiAdmin]", err);
    res.status(500).json({ error: "Lỗi khi cập nhật phản hồi" });
  }
};
