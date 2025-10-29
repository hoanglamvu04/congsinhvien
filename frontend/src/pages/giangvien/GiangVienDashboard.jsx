import React from "react";
import { Link } from "react-router-dom";

const GiangVienDashboard = () => {
  return (
    <div className="page-container">
      <h2>🎓 Trang chủ giảng viên</h2>
      <p>Chào mừng bạn đến với hệ thống quản lý dành cho giảng viên.</p>

      <div className="dashboard-links">
        <Link to="/giangvien/thongtin" className="dashboard-card">👤 Thông tin cá nhân</Link>
        <Link to="/giangvien/lichday" className="dashboard-card">📅 Lịch giảng dạy</Link>
        <li><Link to="/giangvien/lophocphan">📚 Lớp học phần</Link></li>
        <Link to="/giangvien/diem" className="dashboard-card">🧾 Quản lý điểm</Link>
        <Link to="/giangvien/diemdanh" className="dashboard-card">✅ Điểm danh</Link>
        <li>
  <Link to="/giangvien/thongbao" className="sidebar-link">
    📢 Gửi thông báo
  </Link>
</li>

        <Link to="/giangvien/taichinh" className="dashboard-card">💰 Tài chính</Link>
      </div>
    </div>
  );
};

export default GiangVienDashboard;
