import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../assets/logo.png";

const Header = () => {
  return (
    <header className="header">
      <div className="header__container">
        {/* 🏫 Logo + Tên hệ thống */}
        <div className="header__logo">
          <Link to="/sinhvien">
            <img src={logo} alt="Logo Trường" className="logo-img" />
            <span className="logo-text">Cổng thông tin sinh viên</span>
          </Link>
        </div>

        {/* 🧭 Menu điều hướng */}
        <nav className="header__nav">
          <ul>
            <li><Link to="/sinhvien">🏠 Trang chủ</Link></li>
            <li><Link to="/sinhvien/thongtin">👤 Thông tin cá nhân</Link></li>
            <li><Link to="/sinhvien/lichhoc">📅 Lịch học</Link></li>
            <li><Link to="/sinhvien/ketqua">🎓 Kết quả học tập</Link></li>
            <li><Link to="/sinhvien/dangky">Đăng ký học phần</Link></li>
            <li><Link to="/sinhvien/diemrenluyen">📘 Điểm rèn luyện</Link></li>

            <li><Link to="/sinhvien/khenthuong">🏅 Khen thưởng</Link></li>
            <li><Link to="/sinhvien/kyluat">⚠️ Kỷ luật</Link></li>
            <li><Link to="/sinhvien/hocphi">💰 Học phí</Link></li>
            <li><Link to="/sinhvien/tinnhan">💬 Tin nhắn</Link></li>
            <li>
              <Link to="/sinhvien/phanhoi">💬 Phản hồi</Link>
            </li>
            <li><Link to="/sinhvien/khaosat">🧾 Khảo sát</Link></li>


            <li><Link to="/sinhvien/thongbao">📢 Thông báo</Link></li>
            <li><Link to="/sinhvien/huongdan">📘 Hướng dẫn</Link></li>
          </ul>
        </nav>

        {/* 🔐 Hành động (login/logout sau này) */}
        <div className="header__actions">
          <Link to="/login" className="login-btn">Đăng nhập</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
