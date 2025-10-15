import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const role = localStorage.getItem("role");
      const ma_sinh_vien = localStorage.getItem("ma_sinh_vien");
      setUserInfo({
        role,
        ma_sinh_vien,
        token,
      });
    } catch (err) {
      console.error("Lỗi khi đọc thông tin user:", err);
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-[450px] text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          🎓 CỔNG THÔNG TIN SINH VIÊN
        </h1>
        {userInfo ? (
          <>
            <p className="text-gray-700 mb-2">
              <strong>Vai trò:</strong> {userInfo.role.toUpperCase()}
            </p>
            {userInfo.ma_sinh_vien && (
              <p className="text-gray-700 mb-2">
                <strong>Mã sinh viên:</strong> {userInfo.ma_sinh_vien}
              </p>
            )}
            <p className="text-gray-500 text-sm mb-4">
              Token: <span className="break-all">{userInfo.token.slice(0, 20)}...</span>
            </p>

            <button
              onClick={handleLogout}
              className="mt-3 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <p>Đang tải thông tin...</p>
        )}
      </div>
    </div>
  );
};

export default Home;
