// src/pages/sinhvien/HomeSinhVien.jsx
import React from "react";

const HomeSinhVien = () => {
  return (
    <div className="page-container">
      <h1>🎓 Chào mừng đến với Cổng thông tin sinh viên</h1>
      <p>
        Đây là hệ thống quản lý thông tin học tập, thời khóa biểu, kết quả học
        tập và các hướng dẫn dành cho sinh viên.
      </p>

      <div className="quick-links">
        <a href="/sinhvien/thongtin" className="link-card">👤 Thông tin cá nhân</a>
        <a href="/sinhvien/lichhoc" className="link-card">📅 Lịch học</a>
        <a href="/sinhvien/ketqua" className="link-card">🎯 Kết quả học tập</a>
        <a href="/sinhvien/huongdan" className="link-card">📘 Hướng dẫn</a>
      </div>
    </div>
  );
};

export default HomeSinhVien;
