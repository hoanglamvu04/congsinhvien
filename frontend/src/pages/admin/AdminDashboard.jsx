import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      alert("🚫 Truy cập bị từ chối! Chỉ quản trị viên mới được phép.");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="admin-dashboard">
      <h1>🎓 BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN</h1>
      <p>Chào mừng bạn quay lại hệ thống quản lý sinh viên.</p>

      <div className="stats-grid">
        <div className="card">
          <h3>📚 Tổng môn học</h3>
          <p>24</p>
        </div>
        <div className="card">
          <h3>👩‍🎓 Sinh viên</h3>
          <p>1200</p>
        </div>
        <div className="card">
          <h3>👨‍🏫 Giảng viên</h3>
          <p>85</p>
        </div>
        <div className="card">
          <h3>💬 Phản hồi</h3>
          <p>64</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
