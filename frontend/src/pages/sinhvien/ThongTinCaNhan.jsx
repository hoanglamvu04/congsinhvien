import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThongTinCaNhan = () => {
  const [sinhVien, setSinhVien] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/sinhvien/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSinhVien(res.data);
      } catch (err) {
        console.error(err);
        alert("❌ Không thể tải thông tin cá nhân!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>⏳ Đang tải thông tin...</p>;
  if (!sinhVien) return <p>⚠️ Không có dữ liệu hiển thị.</p>;

  return (
    <div className="page-container">
      <h2>👤 Thông tin cá nhân</h2>
      <table className="info-table">
        <tbody>
          <tr><th>Mã sinh viên:</th><td>{sinhVien.ma_sinh_vien}</td></tr>
          <tr><th>Họ và tên:</th><td>{sinhVien.ho_ten}</td></tr>
          <tr><th>Ngày sinh:</th><td>{new Date(sinhVien.ngay_sinh).toLocaleDateString("vi-VN")}</td></tr>
          <tr><th>Giới tính:</th><td>{sinhVien.gioi_tinh}</td></tr>
          <tr><th>Lớp:</th><td>{sinhVien.ten_lop}</td></tr>
          <tr><th>Ngành học:</th><td>{sinhVien.ten_nganh}</td></tr>
          <tr><th>Khoa:</th><td>{sinhVien.ten_khoa}</td></tr>
          <tr><th>Địa chỉ:</th><td>{sinhVien.dia_chi || "—"}</td></tr>
          <tr><th>Số điện thoại:</th><td>{sinhVien.dien_thoai || "—"}</td></tr>
          <tr><th>Email:</th><td>{sinhVien.email || "—"}</td></tr>
          <tr>
            <th>Trạng thái học tập:</th>
            <td>
              {sinhVien.trang_thai_hoc_tap === "danghoc"
                ? "📘 Đang học"
                : sinhVien.trang_thai_hoc_tap === "baoluu"
                ? "⏸️ Bảo lưu"
                : "🎓 Tốt nghiệp"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ThongTinCaNhan;
