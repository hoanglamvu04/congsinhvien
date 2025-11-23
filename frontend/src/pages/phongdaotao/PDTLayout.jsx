// src/pages/phongdaotao/PDTLayout.jsx
import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaBookOpen,
  FaClipboardCheck,
  FaBullhorn,
  FaSignOutAlt,
  FaHome,
  FaLayerGroup,
  FaChalkboardTeacher,
  FaClock,
  FaRedoAlt,
  FaMedal,
  FaBan,
} from "react-icons/fa";
import "../../styles/admin/admin.css";

const PDTLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { path: "/phongdaotao", label: "Trang chủ", icon: <FaHome /> },
    { path: "/phongdaotao/hocky", label: "Quản lý học kỳ", icon: <FaCalendarAlt /> },
    { path: "/phongdaotao/monhoc", label: "Quản lý môn học", icon: <FaBookOpen /> },
    { path: "/phongdaotao/lophocphan", label: "Quản lý lớp học phần", icon: <FaLayerGroup /> },
    { path: "/phongdaotao/dangky", label: "Quản lý đăng ký môn học", icon: <FaChalkboardTeacher /> },
    { path: "/phongdaotao/thoi-khoa-bieu", label: "Quản lý thời khóa biểu", icon: <FaClock /> },
    { path: "/phongdaotao/thilai", label: "Quản lý thi lại", icon: <FaRedoAlt /> },
    { path: "/phongdaotao/khenthuong", label: "Quản lý khen thưởng", icon: <FaMedal /> },
    { path: "/phongdaotao/kyluat", label: "Quản lý kỷ luật", icon: <FaBan /> },
    { path: "/phongdaotao/duyetdiem", label: "Duyệt điểm", icon: <FaClipboardCheck /> },
    { path: "/phongdaotao/diemrenluyen", label: "Điểm rèn luyện", icon: <FaClipboardCheck /> },
    { path: "/phongdaotao/thongbao", label: "Thông báo học vụ", icon: <FaBullhorn /> },
  ];

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🎓 Phòng Đào Tạo</h2>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-link ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="menu-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt className="mr-2" /> Đăng xuất
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Hệ thống Quản lý Học vụ</h1>
          <p>Xin chào, Phòng Đào Tạo 👋</p>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default PDTLayout;
