import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/HomeSinhVien.css";
import {
  FaCalendarAlt,
  FaBell,
  FaBook,
  FaArrowRight,
  FaLayerGroup,
  FaStar,
  FaChartBar,
} from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const HomeSinhVien = () => {
  const [sinhVien, setSinhVien] = useState(null);
  const [summary, setSummary] = useState(null);

  // 📌 Lấy thông tin SV
  useEffect(() => {
    axios
      .get(`${API_URL}/api/sinhvien/me`, { withCredentials: true })
      .then((res) => setSinhVien(res.data))
      .catch((err) => console.error("Lỗi tải sinh viên:", err));
  }, []);

  // 📌 Lấy summary (GPA, tín chỉ…)
  useEffect(() => {
    axios
      .get(`${API_URL}/api/diem/me/summary`, { withCredentials: true })
      .then((res) => setSummary(res.data.summary))
      .catch((err) => console.error("Lỗi tải summary:", err));
  }, []);

  if (!sinhVien || !summary) return <p>Đang tải...</p>;

  // 📌 Tính toán
  const gpa4 = summary.gpa_he_4?.toFixed(2) || "--";
  const gpa10 = summary.gpa_he_10?.toFixed(2) || "--";
  const tinChi = summary.tin_chi_tich_luy || 0;

  const xepLoai =
    gpa4 >= 3.6
      ? "🎓 Xuất sắc"
      : gpa4 >= 3.2
      ? "🥇 Giỏi"
      : gpa4 >= 2.5
      ? "🥈 Khá"
      : gpa4 >= 2.0
      ? "🥉 Trung bình"
      : "⚠ Yếu";

  return (
    <div className="sv-dashboard">

      {/* WELCOME BOX */}
      <div className="sv-welcome-box">

        {/* LEFT: AVATAR + TEXT */}
        <div className="sv-welcome-left">
          <img
            src={
              sinhVien.hinh_anh
                ? `${API_URL}${sinhVien.hinh_anh}`
                : "/default-avatar.png"
            }
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="sv-avatar"
            alt="avatar"
          />

          <div>
            <h2>Xin chào, {sinhVien.ho_ten}</h2>
            <p>Mã sinh viên: {sinhVien.ma_sinh_vien}</p>
            <p>Chúc bạn một ngày học tập hiệu quả!</p>

            {/* NEW — HỌC TẬP (GPA, TC, XẾP LOẠI) */}
            <div className="sv-study-stats">
              <div className="stat-item">
                <FaLayerGroup className="stat-icon tc" />
                <div>
                  <p className="label">Tín chỉ tích lũy</p>
                  <p className="value">{tinChi}</p>
                </div>
              </div>

              <div className="stat-item">
                <FaChartBar className="stat-icon gpa10" />
                <div>
                  <p className="label">GPA hệ 10</p>
                  <p className="value">{gpa10}</p>
                </div>
              </div>

              <div className="stat-item">
                <FaChartBar className="stat-icon gpa4" />
                <div>
                  <p className="label">GPA hệ 4</p>
                  <p className="value">{gpa4}</p>
                </div>
              </div>

              <div className="stat-item">
                <FaStar className="stat-icon xl" />
                <div>
                  <p className="label">Xếp loại</p>
                  <p className="value">{xepLoai}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — MINI INFO DỌC */}
        <div className="sv-welcome-info-vertical">
          <div className="info-tag">
            <span className="label">Khoa: </span>
            <span className="value">{sinhVien.ten_khoa}</span>
          </div>

          <div className="info-tag">
            <span className="label">Ngành: </span>
            <span className="value">{sinhVien.ten_nganh}</span>
          </div>

          <div className="info-tag">
            <span className="label">Lớp: </span>
            <span className="value">{sinhVien.ten_lop}</span>
          </div>
        </div>

      </div>

      {/* 3 KHỐI CHÍNH */}
      <div className="sv-grid">

        {/* Lịch học */}
        <div className="sv-card">
          <h3><FaCalendarAlt /> Lịch học hôm nay</h3>
          <p><strong>Công nghệ phần mềm</strong> — Tiết 1–3 — A201</p>
          <p><strong>Cơ sở dữ liệu</strong> — Tiết 6–8 — B204</p>
          <a href="/sinhvien/lichhoc" className="sv-link">
            Xem toàn bộ lịch học <FaArrowRight />
          </a>
        </div>

        {/* Thông báo */}
        <div className="sv-card">
          <h3><FaBell /> Thông báo mới</h3>
          <p>🔔 Hạn nộp học phí kỳ I ngày 30/11</p>
          <p>🔔 Lịch thi kết thúc học phần đã cập nhật</p>
          <p>🔔 Sinh viên cập nhật CCCD trước 25/11</p>
          <a href="/sinhvien/thongbao" className="sv-link">
            Xem tất cả <FaArrowRight />
          </a>
        </div>

        {/* Truy cập nhanh */}
        <div className="sv-card">
          <h3><FaBook /> Truy cập nhanh</h3>

          <a href="/sinhvien/thongtin" className="quick-btn">
            Thông tin cá nhân
          </a>

          <a href="/sinhvien/ketqua" className="quick-btn">
            Kết quả học tập
          </a>

          <a href="/sinhvien/dangky" className="quick-btn">
            Đăng ký học phần
          </a>
        </div>

      </div>

    </div>
  );
};

export default HomeSinhVien;
