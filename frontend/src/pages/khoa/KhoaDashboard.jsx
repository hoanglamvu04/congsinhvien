// src/pages/khoa/KhoaDashboard.jsx
import React from "react";

const KhoaDashboard = () => {
  return (
    <div className="khoa-dashboard p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        🏛️ BẢNG ĐIỀU KHIỂN KHOA
      </h1>
      <p className="text-gray-700 mb-8">
        Chào mừng bạn quay lại hệ thống quản lý khoa của mình.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white shadow-md rounded-xl p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">👩‍🎓 Sinh viên của khoa</h3>
          <p className="text-2xl font-bold text-green-600">320</p>
        </div>

        <div className="card bg-white shadow-md rounded-xl p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">👨‍🏫 Giảng viên</h3>
          <p className="text-2xl font-bold text-orange-600">25</p>
        </div>

        <div className="card bg-white shadow-md rounded-xl p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">📚 Môn học</h3>
          <p className="text-2xl font-bold text-blue-600">18</p>
        </div>

        <div className="card bg-white shadow-md rounded-xl p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">📊 Điểm trung bình</h3>
          <p className="text-2xl font-bold text-purple-600">7.8</p>
        </div>
      </div>
    </div>
  );
};

export default KhoaDashboard;
