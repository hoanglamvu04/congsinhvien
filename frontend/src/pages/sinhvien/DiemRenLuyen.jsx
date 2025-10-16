import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DiemRenLuyen = () => {
  const token = localStorage.getItem("token");
  const [dsDiem, setDsDiem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thongKe, setThongKe] = useState({ tb: 0, max: 0, min: 0 });

  // 📘 Lấy điểm rèn luyện của sinh viên hiện tại
  const fetchDiemRenLuyen = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/diemrenluyen`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setDsDiem(data);

      // 📊 Tính thống kê
      if (data.length > 0) {
        const diemArr = data.map((d) => d.diem_chung_ket || 0);
        const tb = (diemArr.reduce((a, b) => a + b, 0) / diemArr.length).toFixed(1);
        setThongKe({
          tb,
          max: Math.max(...diemArr),
          min: Math.min(...diemArr),
        });
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải điểm rèn luyện:", err);
      alert("Không thể tải danh sách điểm rèn luyện!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiemRenLuyen();
  }, [token]);

  return (
    <div className="page-container">
      <h2>📘 Điểm rèn luyện</h2>

      {/* Bảng thống kê nhanh */}
      {!loading && dsDiem.length > 0 && (
        <div className="summary-box">
          <p>📊 <b>Tổng học kỳ:</b> {dsDiem.length}</p>
          <p>⭐ <b>Điểm trung bình:</b> {thongKe.tb}</p>
          <p>🏆 <b>Cao nhất:</b> {thongKe.max}</p>
          <p>⚠️ <b>Thấp nhất:</b> {thongKe.min}</p>
        </div>
      )}

      {/* Bảng dữ liệu */}
      {loading ? (
        <p>⏳ Đang tải dữ liệu...</p>
      ) : dsDiem.length === 0 ? (
        <p>⚠️ Chưa có dữ liệu điểm rèn luyện.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Học kỳ</th>
              <th>Điểm tự đánh giá</th>
              <th>Điểm cố vấn</th>
              <th>Điểm chung kết</th>
              <th>Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {dsDiem.map((drl, i) => (
              <tr key={drl.id_drl}>
                <td>{i + 1}</td>
                <td>{drl.ten_hoc_ky}</td>
                <td>{drl.diem_tu_danh_gia ?? "—"}</td>
                <td>{drl.diem_co_van ?? "—"}</td>
                <td>{drl.diem_chung_ket ?? "—"}</td>
                <td>
                  {drl.xep_loai === "Xuất sắc" && "🏅 " + drl.xep_loai}
                  {drl.xep_loai === "Tốt" && "✅ " + drl.xep_loai}
                  {drl.xep_loai === "Khá" && "📘 " + drl.xep_loai}
                  {drl.xep_loai === "Trung bình" && "⚠️ " + drl.xep_loai}
                  {drl.xep_loai === "Yếu" && "❌ " + drl.xep_loai}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DiemRenLuyen;
