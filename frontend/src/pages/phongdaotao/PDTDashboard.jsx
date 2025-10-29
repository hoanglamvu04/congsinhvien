import React from "react";
import "../../styles/admin/admin.css";

const PDTDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1 className="text-xl font-bold mb-4 text-blue-700">
        🎓 Trang chủ – Phòng Đào Tạo
      </h1>

      <div className="card p-4 bg-white shadow-md border border-gray-200 rounded-lg">
        <p className="text-gray-700">
          Xin chào 👋, bạn đang đăng nhập vào hệ thống quản lý học vụ của{" "}
          <strong>Phòng Đào Tạo</strong>.
        </p>
        <p className="mt-2 text-gray-600">
          Tại đây bạn có thể quản lý học kỳ, môn học, duyệt điểm và gửi thông báo học vụ cho sinh viên.
        </p>
      </div>
    </div>
  );
};

export default PDTDashboard;
