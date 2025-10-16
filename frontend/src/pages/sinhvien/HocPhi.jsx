import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const HocPhi = () => {
  const [hocPhi, setHocPhi] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/hocphi/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHocPhi(res.data.data || []);
      } catch (err) {
        console.error(err);
        alert("❌ Không thể tải danh sách học phí!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>⏳ Đang tải học phí...</p>;

  return (
    <div className="page-container">
      <h2>💰 Học phí cá nhân</h2>
      {hocPhi.length === 0 ? (
        <p>⚠️ Chưa có dữ liệu học phí.</p>
      ) : (
        <table className="result-table">
          <thead>
            <tr>
              <th>Học kỳ</th>
              <th>Tổng phải nộp</th>
              <th>Đã nộp</th>
              <th>Còn nợ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {hocPhi.map((hp, index) => (
              <tr key={index}>
                <td>{hp.ten_hoc_ky}</td>
                <td>{hp.tong_tien_phai_nop?.toLocaleString("vi-VN")} ₫</td>
                <td>{hp.tong_tien_da_nop?.toLocaleString("vi-VN")} ₫</td>
                <td style={{ color: hp.con_no > 0 ? "red" : "green" }}>
                  {hp.con_no?.toLocaleString("vi-VN")} ₫
                </td>
                <td>
                  {hp.trang_thai === "chuadong"
                    ? "❌ Chưa đóng"
                    : hp.trang_thai === "dangdong"
                    ? "💸 Đang đóng"
                    : "✅ Đã hoàn tất"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HocPhi;
