import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaMedal,
  FaSearch,
  FaTrophy,
  FaRegClock,
  FaMoneyBillWave,
  FaUniversity,
} from "react-icons/fa";
import "../../styles/KhenThuong.css";

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
      {/* Header */}
      <div className="khen-header">
        <h2>
          <FaMedal style={{ color: "#007bff", marginRight: 8 }} />
          Danh sách khen thưởng
        </h2>
      </div>

      {/* Ô tìm kiếm */}
      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo nội dung hoặc ngày..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit">
          <FaSearch style={{ marginRight: 4 }} /> Tìm
        </button>
      </form>

      {/* Bảng danh sách */}
      {loading ? (
        <p className="loading">
          <FaRegClock style={{ marginRight: 6 }} /> Đang tải dữ liệu...
        </p>
      ) : dsKhenThuong.length === 0 ? (
        <p className="no-data">⚠️ Không có dữ liệu khen thưởng nào.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>
                <FaTrophy style={{ marginRight: 6, color: "#ffc107" }} />
                Ngày khen thưởng
              </th>
              <th>Nội dung</th>
              <th>
                <FaUniversity style={{ marginRight: 6, color: "#004080" }} />
                Khoa
              </th>
              <th>
                <FaMoneyBillWave style={{ marginRight: 6, color: "green" }} />
                Số tiền (VNĐ)
              </th>
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
                <td className="money">
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
