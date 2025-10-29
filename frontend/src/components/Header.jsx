import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome, FaGraduationCap, FaCalendarAlt, FaClipboardCheck, FaBookOpen, FaClipboardList,
  FaUser, FaMedal, FaExclamationTriangle, FaComments, FaPoll,
  FaBullhorn, FaQuestionCircle, FaChevronDown, FaSignInAlt, FaSignOutAlt
} from "react-icons/fa";
import "./Header.css";
import logo from "../assets/logo.png";

const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();
  const headerRef = useRef(null);

  // 📌 Sticky Header
  useEffect(() => {
    const handleScroll = () => {
      const header = headerRef.current;
      if (window.scrollY > 10) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🧭 Hover delay mượt
  const handleMouseEnter = (menu) => {
    clearTimeout(hoverTimeout);
    setHoverTimeout(setTimeout(() => setActiveDropdown(menu), 200)); // delay 200ms
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setHoverTimeout(setTimeout(() => setActiveDropdown(null), 200)); // delay 200ms
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="header" ref={headerRef}>
      <div className="header__container">
        {/* 🏫 Logo */}
        <div className="header__logo">
          <Link to="/sinhvien">
            <img src={logo} alt="Logo" className="logo-img" />
          </Link>
        </div>

        {/* 🧭 Menu */}
        <nav className="header__nav">
          <ul>
            <li><Link to="/sinhvien"><FaHome /> Trang chủ</Link></li>

            {/* === Học tập === */}
            <li
              className="dropdown"
              onMouseEnter={() => handleMouseEnter("hoc")}
              onMouseLeave={handleMouseLeave}
            >
              <span><FaGraduationCap /> Học tập <FaChevronDown className="chevron" /></span>
              {activeDropdown === "hoc" && (
                <ul className="dropdown-menu vertical">
                  <li><Link to="/sinhvien/lichhoc"><FaCalendarAlt /> Lịch học</Link></li>
                  <li><Link to="/sinhvien/ketqua"><FaClipboardCheck /> Kết quả học tập</Link></li>
                  <li><Link to="/sinhvien/dangky"><FaBookOpen /> Đăng ký học phần</Link></li>
                  <li><Link to="/sinhvien/diemrenluyen"><FaClipboardList /> Điểm rèn luyện</Link></li>
                  <li><Link to="/sinhvien/hocphi"><FaClipboardList /> Học phí</Link></li>
                </ul>
              )}
            </li>

            {/* === Cá nhân === */}
            <li
              className="dropdown"
              onMouseEnter={() => handleMouseEnter("canhan")}
              onMouseLeave={handleMouseLeave}
            >
              <span><FaUser /> Cá nhân <FaChevronDown className="chevron" /></span>
              {activeDropdown === "canhan" && (
                <ul className="dropdown-menu vertical">
                  <li><Link to="/sinhvien/thongtin"><FaUser /> Thông tin cá nhân</Link></li>
                  <li><Link to="/sinhvien/tinnhan"><FaComments /> Tin nhắn</Link></li>
                  <li><Link to="/sinhvien/phanhoi"><FaComments /> Phản hồi</Link></li>
                </ul>
              )}
            </li>

            {/* === Khen thưởng - Kỷ luật === */}
            <li
              className="dropdown"
              onMouseEnter={() => handleMouseEnter("renluyen")}
              onMouseLeave={handleMouseLeave}
            >
              <span><FaMedal /> Khen thưởng / Kỷ luật <FaChevronDown className="chevron" /></span>
              {activeDropdown === "renluyen" && (
                <ul className="dropdown-menu vertical">
                  <li><Link to="/sinhvien/khenthuong"><FaMedal /> Khen thưởng</Link></li>
                  <li><Link to="/sinhvien/kyluat"><FaExclamationTriangle /> Kỷ luật</Link></li>
                </ul>
              )}
            </li>

            {/* === Khảo sát - Thông báo === */}
            <li
              className="dropdown"
              onMouseEnter={() => handleMouseEnter("thongbao")}
              onMouseLeave={handleMouseLeave}
            >
              <span><FaBullhorn /> Thông tin khác <FaChevronDown className="chevron" /></span>
              {activeDropdown === "thongbao" && (
                <ul className="dropdown-menu vertical">
                  <li><Link to="/sinhvien/khaosat"><FaPoll /> Khảo sát</Link></li>
                  <li><Link to="/sinhvien/thongbao"><FaBullhorn /> Thông báo</Link></li>
                  <li><Link to="/sinhvien/huongdan"><FaQuestionCircle /> Hướng dẫn</Link></li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* 🔐 Người dùng */}
        <div className="header__actions">
          {user ? (
            <div className="user-info">
              <FaUser className="user-icon" />
              <span>Xin chào, <strong>{user.ho_ten || user.ten_dang_nhap}</strong></span>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <FaSignInAlt /> Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
