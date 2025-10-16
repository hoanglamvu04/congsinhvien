import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KhenThuong = () => {
  const token = localStorage.getItem("token");
  const [dsKhenThuong, setDsKhenThuong] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  // 📘 Lấy danh sách khen thưởng
  const fetchKhenThuong = async (q = "") => {
    try {
      const res = await axios.get(`${API_URL}/api/khenthuong?q=${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDsKhenThuong(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải khen thưởng:", err);
      alert("Không thể tải danh sách khen thưởng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhenThuong();
  }, [token]);

  // 🔍 Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchKhenThuong(keyword.trim());
  };

  return (
    <div className="page-container">
      <h2>🏅 Danh sách khen thưởng</h2>

      {/* Ô tìm kiếm */}
      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          placeholder="Tìm kiếm theo nội dung hoặc ngày..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit">🔍 Tìm</button>
      </form>

      {/* Bảng danh sách */}
      {loading ? (
        <p>⏳ Đang tải dữ liệu...</p>
      ) : dsKhenThuong.length === 0 ? (
        <p>⚠️ Không có dữ liệu khen thưởng nào.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ngày khen thưởng</th>
              <th>Nội dung</th>
              <th>Khoa</th>
              <th>Số tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {dsKhenThuong.map((kt, i) => (
              <tr key={kt.id_khen_thuong}>
                <td>{i + 1}</td>
                <td>
                  {new Date(kt.ngay_khen_thuong).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
                <td>{kt.noi_dung}</td>
                <td>{kt.ten_khoa || "—"}</td>
                <td>
                  {kt.so_tien
                    ? kt.so_tien.toLocaleString("vi-VN") + " ₫"
                    : "Không có"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default KhenThuong;
