import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧩 Lấy thông tin người dùng từ cookie (qua /api/auth/me)
  useEffect(() => {
    axios
      .get("/api/auth/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // 🧩 Đăng xuất (xoá cookie)
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Đang tải thông tin người dùng...
      </div>
    );

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Không có thông tin người dùng.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-[450px] text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          🎓 CỔNG THÔNG TIN SINH VIÊN
        </h1>

        <p className="text-gray-700 mb-2">
          <strong>Vai trò:</strong> {user.role?.toUpperCase()}
        </p>

        {user.ma_sinh_vien && (
          <p className="text-gray-700 mb-2">
            <strong>Mã sinh viên:</strong> {user.ma_sinh_vien}
          </p>
        )}

        {user.ma_giang_vien && (
          <p className="text-gray-700 mb-2">
            <strong>Mã giảng viên:</strong> {user.ma_giang_vien}
          </p>
        )}

        {user.ten_phong && (
          <p className="text-gray-700 mb-2">
            <strong>Phòng:</strong> {user.ten_phong}
          </p>
        )}

        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Home;
