import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LichHoc = () => {
  const [lichHoc, setLichHoc] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/thoi-khoa-bieu/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLichHoc(res.data.data || []);
      } catch (err) {
        console.error(err);
        alert("❌ Không thể tải lịch học!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>⏳ Đang tải thời khóa biểu...</p>;

  return (
    <div className="page-container">
      <h2>📅 Lịch học cá nhân</h2>
      {lichHoc.length === 0 ? (
        <p>⚠️ Bạn chưa có lịch học nào.</p>
      ) : (
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Ngày học</th>
              <th>Thứ</th>
              <th>Tiết</th>
              <th>Môn học</th>
              <th>Giảng viên</th>
              <th>Phòng học</th>
              <th>Lớp học phần</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {lichHoc.map((item, index) => (
              <tr key={index}>
                <td>{new Date(item.ngay_hoc).toLocaleDateString("vi-VN")}</td>
                <td>{item.thu_trong_tuan}</td>
                <td>{`${item.tiet_bat_dau}–${item.tiet_ket_thuc}`}</td>
                <td>{item.ten_mon}</td>
                <td>{item.ten_giang_vien}</td>
                <td>{item.phong_hoc}</td>
                <td>{item.ma_lop_hp}</td>
                <td>
                  {item.trang_thai === "hoc"
                    ? "📘 Đang học"
                    : item.trang_thai === "nghi"
                    ? "⏸️ Nghỉ"
                    : "✅ Hoàn thành"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LichHoc;
