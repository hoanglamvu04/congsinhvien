import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ChiTietLopHocPhan.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ChiTietLopHocPhan = () => {
  const { ma_lop_hp } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchChiTiet = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/lophocphan/${ma_lop_hp}`, {
        withCredentials: true,
      });
      setData(res.data);
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết lớp học phần:", error);
      alert("Không thể tải dữ liệu lớp học phần!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChiTiet();
  }, [ma_lop_hp]);

  if (loading)
    return <p style={{ textAlign: "center" }}>⏳ Đang tải dữ liệu...</p>;

  if (!data)
    return <p style={{ textAlign: "center" }}>❌ Không tìm thấy dữ liệu.</p>;

  const lopHocPhan = data.lop_hoc_phan || {};
  const danhSachSinhVien = data.danh_sach_sinh_vien || [];
  const lichHoc = data.lich_hoc || [];

  return (
    <div className="chi-tiet-lhp-container">
      <div className="header-bar">
        <h2>📘 Chi tiết lớp học phần: {lopHocPhan.ma_lop_hp}</h2>
        <button onClick={fetchChiTiet}>🔄 Làm mới</button>
      </div>

      {/* 🔹 Thông tin chung */}
      <div className="thong-tin-lhp">
        <p>
          <strong>Môn học:</strong> {lopHocPhan.ten_mon || "—"}
        </p>
        <p>
          <strong>Giảng viên:</strong> {lopHocPhan.ten_giang_vien || "—"}
        </p>
        <p>
          <strong>Học kỳ:</strong> {lopHocPhan.ten_hoc_ky || "—"}
        </p>
        <p>
          <strong>Phòng học:</strong> {lopHocPhan.phong_hoc || "—"}
        </p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          {lopHocPhan.trang_thai === "dangday" ? (
            <span className="tag tag-green">Đang dạy</span>
          ) : lopHocPhan.trang_thai === "daketthuc" ? (
            <span className="tag tag-gray">Đã kết thúc</span>
          ) : (
            <span className="tag tag-blue">Đang mở</span>
          )}
        </p>
      </div>

      {/* 📅 Lịch học */}
      <h3>📅 Lịch học</h3>
      {lichHoc.length > 0 ? (
        <table className="table-lich-hoc">
          <thead>
            <tr>
              <th>Ngày học</th>
              <th>Thứ</th>
              <th>Tiết bắt đầu</th>
              <th>Tiết kết thúc</th>
              <th>Phòng</th>
            </tr>
          </thead>
          <tbody>
            {lichHoc.map((item) => (
              <tr key={item.id_tkb}>
                <td>
                  {item.ngay_hoc
                    ? new Date(item.ngay_hoc).toLocaleDateString("vi-VN")
                    : "—"}
                </td>
                <td>{item.thu_trong_tuan}</td>
                <td>{item.tiet_bat_dau}</td>
                <td>{item.tiet_ket_thuc}</td>
                <td>{item.phong_hoc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Không có lịch học nào.</p>
      )}

      {/* 👨‍🎓 Danh sách sinh viên */}
      <h3>👨‍🎓 Danh sách sinh viên</h3>
      {danhSachSinhVien.length > 0 ? (
        <table className="table-sinh-vien">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Họ tên</th>
              <th>Lớp</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {danhSachSinhVien.map((sv) => (
              <tr key={sv.ma_sinh_vien}>
                <td>{sv.ma_sinh_vien}</td>
                <td>{sv.ho_ten}</td>
                <td>{sv.ma_lop}</td>
                <td>{sv.email || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Chưa có sinh viên đăng ký lớp này.</p>
      )}
    </div>
  );
};

export default ChiTietLopHocPhan;
