import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "../../styles/admin/admin.css";
import { FaBars } from "react-icons/fa";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

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
          {!collapsed && <h2>Admin Panel</h2>}
        </div>

        <nav>
          <ul>
            <li><Link to="/admin">🏠 Trang chủ</Link></li>
            <li><Link to="/admin/accounts">👤 Quản lý tài khoản</Link></li>
            <li><Link to="/admin/khoa">🏫 Quản lý khoa</Link></li>
            <li><Link to="/admin/nganh">📚 Quản lý ngành</Link></li>
            <li><Link to="/admin/giangvien">👨‍🏫 Quản lý giảng viên</Link></li>
            <li><Link to="/admin/lop">🎓 Quản lý lớp</Link></li>
            <li><Link to="/admin/hocky">📅 Quản lý học kỳ</Link></li>
            <li><Link to="/admin/monhoc">📘 Quản lý môn học</Link></li>
            <li><Link to="/admin/lophocphan">🏫 Quản lý lớp học phần</Link></li>
            <li><Link to="/admin/dangky">🧾 Quản lý đăng ký môn học</Link></li>
            <li><Link to="/admin/sinhvien">🎒 Sinh viên</Link></li>
            <li><Link to="/admin/diem">📊 Quản lý điểm</Link></li>
            <li><Link to="/admin/diemrenluyen">🎯 Quản lý điểm rèn luyện</Link></li>
            <li><Link to="/admin/thilai">🧾 Quản lý thi lại</Link></li>
            <li><Link to="/admin/monhoc">📘 Môn học</Link></li>
            <li><Link to="/admin/hocphi">💰 Quản lý học phí</Link></li>
            <li><Link to="/admin/giaodich">💳 Quản lý giao dịch</Link></li>
            <li><Link to="/admin/khenthuong">🏅 Quản lý khen thưởng</Link></li>
            <li><Link to="/admin/kyluat">⚖️ Quản lý kỷ luật</Link></li>
            <li><Link to="/admin/khaosat">📝 Quản lý khảo sát</Link></li>
            <li><Link to="/admin/phieutraloi">📋 Quản lý phiếu trả lời</Link></li>
            <li><Link to="/admin/phanhoi">💬 Quản lý phản hồi</Link></li>
            <li><Link to="/admin/tinnhan">💬 Quản lý tin nhắn</Link></li>
<li><Link to="/admin/thongbao">📢 Quản lý thông báo</Link></li>
<li><Link to="/admin/lichsuhoatdong">🧾 Lịch sử hoạt động</Link></li>

          </ul>
        </nav>

        <button className="logout-btn">Đăng xuất</button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
