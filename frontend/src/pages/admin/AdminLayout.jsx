import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaUserCog,
  FaUniversity,
  FaChalkboardTeacher,
  FaLayerGroup,
  FaCalendarAlt,
  FaBookOpen,
  FaClipboardList,
  FaUsers,
  FaChartLine,
  FaMoneyBill,
  FaCreditCard,
  FaMedal,
  FaBalanceScale,
  FaPoll,
  FaCommentDots,
  FaEnvelope,
  FaBullhorn,
  FaHistory,
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

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  const toggleGroup = (groupName) => {
    setOpenGroup(openGroup === groupName ? null : groupName);
  };

  return (
    <div className={`admin-container ${collapsed ? "collapsed" : ""}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            <FaBars />
          </button>
          {!collapsed && <h2>Admin Panel</h2>}
        </div>

        <nav>
          <ul>
            {/* === Tổng quan === */}
            <li>
              <Link to="/admin">
                <FaHome /> Trang chủ
              </Link>
            </li>
            <li>
              <Link to="/admin/accounts">
                <FaUserCog /> Quản lý tài khoản
              </Link>
            </li>

            {/* === Nhóm Đào tạo === */}
            <MenuGroup
              title="Đào tạo"
              icon={<FaUniversity />}
              isOpen={openGroup === "daotao"}
              toggle={() => toggleGroup("daotao")}
            >
              <li><Link to="/admin/khoa"><FaUniversity /> Khoa</Link></li>
              <li><Link to="/admin/nganh"><FaLayerGroup /> Ngành</Link></li>
              <li><Link to="/admin/giangvien"><FaChalkboardTeacher /> Giảng viên</Link></li>
              <li><Link to="/admin/lop"><FaUsers /> Lớp</Link></li>
              <li><Link to="/admin/hocky"><FaCalendarAlt /> Học kỳ</Link></li>
              <li><Link to="/admin/monhoc"><FaBookOpen /> Môn học</Link></li>
              <li><Link to="/admin/lophocphan"><FaClipboardList /> Lớp học phần</Link></li>
              <li><Link to="/admin/dangky"><FaClipboardList /> Đăng ký môn</Link></li>
              <li><Link to="/admin/thoi-khoa-bieu"><FaCalendarAlt /> Thời khóa biểu</Link></li>
            </MenuGroup>

            {/* === Nhóm Sinh viên & điểm === */}
            <MenuGroup
              title="Sinh viên & điểm"
              icon={<FaUsers />}
              isOpen={openGroup === "sinhvien"}
              toggle={() => toggleGroup("sinhvien")}
            >
              <li><Link to="/admin/sinhvien"><FaUsers /> Sinh viên</Link></li>
              <li><Link to="/admin/diem"><FaChartLine /> Điểm</Link></li>
              <li><Link to="/admin/diemrenluyen"><FaMedal /> Điểm rèn luyện</Link></li>
              <li><Link to="/admin/thilai"><FaClipboardList /> Thi lại</Link></li>
              <li><Link to="/admin/hocphi"><FaMoneyBill /> Học phí</Link></li>
              <li>
                <a href="/admin/thongkehocphi">📊 Thống kê học phí</a>
              </li>

              <li><Link to="/admin/giaodich"><FaCreditCard /> Giao dịch</Link></li>
              <li><Link to="/admin/khenthuong"><FaMedal /> Khen thưởng</Link></li>
              <li><Link to="/admin/kyluat"><FaBalanceScale /> Kỷ luật</Link></li>
            </MenuGroup>

            {/* === Khảo sát & truyền thông === */}
            <MenuGroup
              title="Khảo sát & truyền thông"
              icon={<FaPoll />}
              isOpen={openGroup === "khaosat"}
              toggle={() => toggleGroup("khaosat")}
            >
              <li><Link to="/admin/khaosat"><FaPoll /> Khảo sát</Link></li>
              <li><Link to="/admin/phieutraloi"><FaClipboardList /> Phiếu trả lời</Link></li>
              <li><Link to="/admin/phanhoi"><FaCommentDots /> Phản hồi</Link></li>
              <li><Link to="/admin/tinnhan"><FaEnvelope /> Tin nhắn</Link></li>
              <li><Link to="/admin/thongbao"><FaBullhorn /> Thông báo</Link></li>
            </MenuGroup>

            {/* === Hệ thống === */}
            <MenuGroup
              title="Hệ thống"
              icon={<FaHistory />}
              isOpen={openGroup === "hethong"}
              toggle={() => toggleGroup("hethong")}
            >
              <li><Link to="/admin/lichsuhoatdong"><FaHistory /> Lịch sử hoạt động</Link></li>
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

export default AdminLayout;
