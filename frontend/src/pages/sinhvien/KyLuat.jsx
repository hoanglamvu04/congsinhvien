import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaExclamationTriangle,
  FaSearch,
  FaUserTie,
  FaGavel,
  FaCalendarAlt,
  FaRegClock,
} from "react-icons/fa";
import "../../styles/KyLuat.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KyLuat = () => {
  const token = localStorage.getItem("token");
  const [dsKyLuat, setDsKyLuat] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  // 📘 Lấy danh sách kỷ luật
  const fetchKyLuat = async (q = "") => {
    try {
      const res = await axios.get(`${API_URL}/api/kyluat?q=${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDsKyLuat(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải kỷ luật:", err);
      alert("Không thể tải danh sách kỷ luật!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyLuat();
  }, [token]);

  // 🔍 Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchKyLuat(keyword.trim());
  };

  return (
    <div className="page-container">
      {/* Tiêu đề */}
      <div className="kyluat-header">
        <h2>
          <FaExclamationTriangle style={{ color: "#dc3545", marginRight: 8 }} />
          Thông tin kỷ luật
        </h2>
      </div>

      {/* Ô tìm kiếm */}
      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          placeholder="Tìm kiếm theo lý do, hình thức, người ra quyết định..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit">
          <FaSearch style={{ marginRight: 5 }} /> Tìm
        </button>
      </form>

      {/* Danh sách */}
      {loading ? (
        <p className="loading">
          <FaRegClock style={{ marginRight: 6 }} /> Đang tải dữ liệu...
        </p>
      ) : dsKyLuat.length === 0 ? (
        <p className="no-data">✅ Bạn chưa có quyết định kỷ luật nào.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>
                <FaCalendarAlt style={{ marginRight: 5, color: "#007bff" }} />
                Ngày quyết định
              </th>
              <th>
                <FaGavel style={{ marginRight: 5, color: "#ff9800" }} />
                Hình thức
              </th>
              <th>Lý do</th>
              <th>
                <FaUserTie style={{ marginRight: 5, color: "#004080" }} />
                Người ra quyết định
              </th>
            </tr>
          </thead>
          <tbody>
            {dsKyLuat.map((kl, i) => (
              <tr key={kl.id_ky_luat}>
                <td>{i + 1}</td>
                <td>
                  {new Date(kl.ngay_quyet_dinh).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
                <td className="warn">{kl.hinh_thuc}</td>
                <td>{kl.ly_do || "—"}</td>
                <td>{kl.nguoi_ra_quyet_dinh || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default KyLuat;
