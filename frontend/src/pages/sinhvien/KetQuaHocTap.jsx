// src/pages/sinhvien/KetQuaHocTap.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KetQuaHocTap = () => {
  const [diem, setDiem] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/diem/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDiem(res.data.data || []);
      } catch (err) {
        console.error(err);
        alert("❌ Không thể tải kết quả học tập!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>⏳ Đang tải kết quả học tập...</p>;

  return (
    <div className="page-container">
      <h2>🎓 Kết quả học tập</h2>

      {diem.length === 0 ? (
        <p>⚠️ Bạn chưa có dữ liệu điểm.</p>
      ) : (
        <table className="result-table">
          <thead>
            <tr>
              <th>Học kỳ</th>
              <th>Mã lớp HP</th>
              <th>Môn học</th>
              <th>Điểm HS1</th>
              <th>Điểm HS2</th>
              <th>Điểm thi</th>
              <th>Điểm tổng</th>
              <th>Thang 4</th>
              <th>Kết quả</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {diem.map((d, index) => (
              <tr key={index}>
                <td>{d.ten_hoc_ky}</td>
                <td>{d.ma_lop_hp}</td>
                <td>{d.ten_mon}</td>
                <td>{d.diem_hs1 ?? "-"}</td>
                <td>{d.diem_hs2 ?? "-"}</td>
                <td>{d.diem_thi ?? "-"}</td>
                <td>{d.diem_tong ?? "-"}</td>
                <td>{d.diem_thang_4 ?? "-"}</td>
                <td>{d.ket_qua ?? "-"}</td>
                <td>
                  {d.trang_thai === "hoanthanh"
                    ? "✅ Hoàn thành"
                    : d.trang_thai === "danghoc"
                    ? "📘 Đang học"
                    : "⏸️ Chưa hoàn thành"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default KetQuaHocTap;
