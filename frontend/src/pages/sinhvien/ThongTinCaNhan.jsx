import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/ThongTinCaNhan.css";
import { FaUserGraduate } from "react-icons/fa";

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
    <div className="profile-container">
      <div className="profile-header">
        <FaUserGraduate className="profile-icon" />
        <h2>Thông tin cá nhân sinh viên</h2>
      </div>

      <div className="profile-card">
        {/* 🖼️ Ảnh đại diện */}
        <div className="profile-left">
          <img
            src={
              sinhVien.hinh_anh
                ? `${API_URL}${sinhVien.hinh_anh}`
                : "/default-avatar.png"
            }
            alt="Avatar"
            className="profile-avatar"
          />
          <h3>{sinhVien.ho_ten}</h3>
          <p className="student-id">MSSV: {sinhVien.ma_sinh_vien}</p>
          <p className="student-status">
            {sinhVien.trang_thai_hoc_tap === "danghoc"
              ? "📘 Đang học"
              : sinhVien.trang_thai_hoc_tap === "baoluu"
              ? "⏸️ Bảo lưu"
              : sinhVien.trang_thai_hoc_tap === "totnghiep"
              ? "🎓 Tốt nghiệp"
              : "❌ Thôi học"}
          </p>
        </div>

        {/* 🧾 Thông tin chi tiết */}
        <div className="profile-right">
          <div className="info-grid">
            <div className="info-item">
              <span className="label">CCCD:</span>
              <span>{sinhVien.cccd || "—"}</span>
            </div>
            <div className="info-item">
              <span className="label">Ngày sinh:</span>
              <span>
                {sinhVien.ngay_sinh
                  ? new Date(sinhVien.ngay_sinh).toLocaleDateString("vi-VN")
                  : "—"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Giới tính:</span>
              <span>{sinhVien.gioi_tinh || "—"}</span>
            </div>
            <div className="info-item">
              <span className="label">Khóa học:</span>
              <span>{sinhVien.khoa_hoc || "—"}</span>
            </div>
            <div className="info-item">
              <span className="label">Lớp:</span>
              <span>{sinhVien.ten_lop || "—"}</span>
            </div>
            <div className="info-item">
              <span className="label">Ngành học:</span>
              <span>{sinhVien.ten_nganh || "—"}</span>
            </div>
            <div className="info-item">
              <span className="label">Khoa:</span>
              <span>{sinhVien.ten_khoa || "—"}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span>{sinhVien.email || "—"}</span>
            </div>
            <div className="info-item">
              <span className="label">Số điện thoại:</span>
              <span>{sinhVien.dien_thoai || "—"}</span>
            </div>
            <div className="info-item">
              <span className="label">Người giám hộ:</span>
              <span>{sinhVien.nguoi_giam_ho || "—"}</span>
            </div>
            <div className="info-item">
              <span className="label">SĐT giám hộ:</span>
              <span>{sinhVien.sdt_giam_ho || "—"}</span>
            </div>
            <div className="info-item full-width">
              <span className="label">Địa chỉ:</span>
              <span>{sinhVien.dia_chi || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThongTinCaNhan;
