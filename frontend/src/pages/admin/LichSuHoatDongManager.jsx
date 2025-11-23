import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LichSuHoatDongManager = () => {
  const [logs, setLogs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // 📘 Lấy toàn bộ lịch sử hoạt động
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/lichsuhoatdong`, {
        withCredentials: true, // ✅ cookie JWT tự động gửi
      });
      setLogs(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách lịch sử hoạt động:", err);
      alert("Không thể tải danh sách lịch sử hoạt động!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 🔍 Lọc log theo từ khóa
  const filteredLogs = logs.filter(
    (log) =>
      log.tai_khoan_thuc_hien?.toLowerCase().includes(keyword.toLowerCase()) ||
      log.hanh_dong?.toLowerCase().includes(keyword.toLowerCase()) ||
      log.bang_tac_dong?.toLowerCase().includes(keyword.toLowerCase()) ||
      (log.khoa_chinh_bi_anh_huong + "")
        .toLowerCase()
        .includes(keyword.toLowerCase())
  );

  // 🧭 Lấy thời gian format đẹp
  const formatDate = (date) =>
    new Date(date).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="admin-dashboard">
      <h1>🧾 Lịch sử hoạt động hệ thống</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo tài khoản, hành động, bảng tác động..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={fetchLogs}>🔄 Làm mới</button>
      </div>

      {/* 📋 Bảng lịch sử */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tài khoản thực hiện</th>
                <th>Hành động</th>
                <th>Bảng tác động</th>
                <th>Khóa chính bị ảnh hưởng</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id_lich_su || idx}>
                    <td>{idx + 1}</td>
                    <td>{log.tai_khoan_thuc_hien}</td>
                    <td>{log.hanh_dong}</td>
                    <td>{log.bang_tac_dong}</td>
                    <td>{log.khoa_chinh_bi_anh_huong}</td>
                    <td>{formatDate(log.thoi_gian)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LichSuHoatDongManager;
