import React from "react";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        🎓 BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN
      </h1>
      <p className="text-gray-700 mb-8">
        Chào mừng bạn quay lại hệ thống quản lý sinh viên.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white shadow-md rounded-xl p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">📚 Tổng môn học</h3>
          <p className="text-2xl font-bold text-blue-600">24</p>
        </div>

        <div className="card bg-white shadow-md rounded-xl p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">👩‍🎓 Sinh viên</h3>
          <p className="text-2xl font-bold text-green-600">1200</p>
        </div>

        <div className="card bg-white shadow-md rounded-xl p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">👨‍🏫 Giảng viên</h3>
          <p className="text-2xl font-bold text-orange-600">85</p>
        </div>

        <div className="card bg-white shadow-md rounded-xl p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">💬 Phản hồi</h3>
          <p className="text-2xl font-bold text-purple-600">64</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
