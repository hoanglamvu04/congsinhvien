import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome, FaGraduationCap, FaCalendarAlt, FaClipboardCheck, FaBookOpen,
  FaClipboardList, FaUser, FaMedal, FaExclamationTriangle, FaComments,
  FaPoll, FaBullhorn, FaQuestionCircle, FaChevronDown,
  FaSignInAlt, FaSignOutAlt
} from "react-icons/fa";
import "./Header.css";
import logo from "../assets/logo.png";

const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const headerRef = useRef(null);

  // 📌 Lấy user khi mount Header
  useEffect(() => {
    axios
      .get("/api/auth/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null); // chưa đăng nhập
      });
  }, []);

  // 📌 Sticky Header
  useEffect(() => {
    const handleScroll = () => {
      const header = headerRef.current;
      if (!header) return;
      if (window.scrollY > 10) header.classList.add("sticky");
      else header.classList.remove("sticky");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🧭 Hover menu soft
  const handleMouseEnter = (menu) => {
    clearTimeout(hoverTimeout);
    setHoverTimeout(setTimeout(() => setActiveDropdown(menu), 150));
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setHoverTimeout(setTimeout(() => setActiveDropdown(null), 150));
  };

  // 🚪 Logout
  const confirmLogout = () => {
    axios
      .post("/api/auth/logout", {}, { withCredentials: true })
      .then(() => {
        setUser(null);
        setShowLogoutModal(false);
        navigate("/login");
      })
      .catch(() => {
        setShowLogoutModal(false);
      });
  };

  return (
    <>
      <header className="header" ref={headerRef}>
        <div className="header__container">
          <div className="header__logo">
            <Link to="/">
              <img src={logo} alt="Logo" className="logo-img" />
            </Link>
          </div>

          {/* MENU */}
          <nav className="header__nav">
            <ul>
              <li><Link to="/"><FaHome /> Trang chủ</Link></li>

              {/* Học tập */}
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

              {/* Cá nhân */}
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

              {/* Khen thưởng / Kỷ luật */}
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

              {/* Thông tin khác */}
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

          {/* LOGIN / LOGOUT */}
          <div className="header__actions">
            {user ? (
              <div className="user-info">
                <FaUser className="user-icon" />
                <span>
                  <strong>{user.ho_ten || user.ten_dang_nhap}</strong>
                </span>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="logout-btn"
                >
                  <FaSignOutAlt />
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

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>🔐 Xác nhận đăng xuất</h3>
            <p>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</p>

            <div className="modal-actions">
              <button className="btn-yes" onClick={confirmLogout}>Có</button>
              <button className="btn-no" onClick={() => setShowLogoutModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
