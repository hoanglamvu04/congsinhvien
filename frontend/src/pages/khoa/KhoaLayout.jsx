// src/layouts/KhoaLayout.jsx
import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardList,
  FaBookOpen,
  FaPoll,
  FaCommentDots,
  FaEnvelope,
  FaBullhorn,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import "../../styles/admin/adminlayout.css";

const MenuGroup = ({ title, icon, isOpen, toggle, children }) => (
  <li className="menu-group">
    <div className="menu-group-header" onClick={toggle}>
      <span className="menu-group-title">
        {icon} {title}
      </span>
      {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
    </div>
    <ul className={`submenu ${isOpen ? "open" : ""}`}>{children}</ul>
  </li>
);

const KhoaLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const toggleGroup = (groupName) =>
    setOpenGroup(openGroup === groupName ? null : groupName);

  return (
    <div className={`admin-container ${collapsed ? "collapsed" : ""}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <button
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>
          {!collapsed && <h2>Khoa Panel</h2>}
        </div>

        <nav>
          <ul>
            {/* === Tổng quan === */}
            <li>
              <Link to="/khoa">
                <FaHome /> Trang chủ
              </Link>
            </li>

            {/* === Quản lý giảng dạy === */}
            <MenuGroup
              title="Giảng dạy"
              icon={<FaChalkboardTeacher />}
              isOpen={openGroup === "giangday"}
              toggle={() => toggleGroup("giangday")}
            >
              <li>
                <Link to="/khoa/giangvien">
                  <FaChalkboardTeacher /> Giảng viên
                </Link>
              </li>
              <li>
                <Link to="/khoa/monhoc">
                  <FaBookOpen /> Môn học
                </Link>
              </li>
              <li>
                <Link to="/khoa/lophocphan">
                  <FaClipboardList /> Lớp học phần
                </Link>
              </li>
            </MenuGroup>

            {/* === Sinh viên === */}
            <MenuGroup
              title="Sinh viên"
              icon={<FaUsers />}
              isOpen={openGroup === "sinhvien"}
              toggle={() => toggleGroup("sinhvien")}
            >
              <li>
                <Link to="/khoa/sinhvien">
                  <FaUsers /> Danh sách sinh viên
                </Link>
              </li>
              <li>
                <Link to="/khoa/diem">
                  <FaClipboardList /> Điểm học tập
                </Link>
              </li>
            </MenuGroup>

            {/* === Khảo sát & phản hồi === */}
            <MenuGroup
              title="Khảo sát & phản hồi"
              icon={<FaPoll />}
              isOpen={openGroup === "phanhoi"}
              toggle={() => toggleGroup("phanhoi")}
            >
              <li>
                <Link to="/khoa/khaosat">
                  <FaPoll /> Khảo sát
                </Link>
              </li>
              <li>
                <Link to="/khoa/phanhoi">
                  <FaCommentDots /> Phản hồi
                </Link>
              </li>
              <li>
                <Link to="/khoa/tinnhan">
                  <FaEnvelope /> Tin nhắn
                </Link>
              </li>
              <li>
                <Link to="/khoa/thongbao">
                  <FaBullhorn /> Thông báo
                </Link>
              </li>
            </MenuGroup>
          </ul>
        </nav>

        <button className="logout-btn">
          <FaSignOutAlt /> {!collapsed && "Đăng xuất"}
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default KhoaLayout;
