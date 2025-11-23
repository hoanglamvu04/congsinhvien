import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaUserGraduate,
  FaBookOpen,
  FaMoneyBillWave,
  FaMedal,
  FaExclamationTriangle,
  FaHeart,
} from "react-icons/fa";
import "../../styles/admin/SinhVienDetail.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SinhVienDetail = () => {
  const { id } = useParams();
  const [sv, setSv] = useState(null);
  const [activeTab, setActiveTab] = useState("thongtin");
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]); // ✅ danh sách điểm học tập
  const [hocPhi, setHocPhi] = useState([]);
  const [renLuyen, setRenLuyen] = useState([]);
  const [khenThuong, setKhenThuong] = useState([]);
  const [kyLuat, setKyLuat] = useState([]);

  // 🧠 Lấy thông tin SV & các dữ liệu liên quan
  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          axios.get(`${API_URL}/api/sinhvien/${id}`),
          axios.get(`${API_URL}/api/diem/sinhvien/${id}`),
          axios.get(`${API_URL}/api/hocphi/sinhvien/${id}`),
          axios.get(`${API_URL}/api/diemrenluyen/sinhvien/${id}`),
          axios.get(`${API_URL}/api/khenthuong/sinhvien/${id}`),
          axios.get(`${API_URL}/api/kyluat/sinhvien/${id}`),
        ]);

        // ✅ Dữ liệu sinh viên chính
        const svRes =
          results[0].status === "fulfilled" ? results[0].value.data : null;
        setSv(svRes);

        // ✅ Dữ liệu các bảng khác
        setRecords(
          results[1].status === "fulfilled" ? results[1].value.data || [] : []
        );
        setHocPhi(
          results[2].status === "fulfilled" ? results[2].value.data || [] : []
        );
        setRenLuyen(
          results[3].status === "fulfilled" ? results[3].value.data || [] : []
        );
        setKhenThuong(
          results[4].status === "fulfilled" ? results[4].value.data || [] : []
        );
        setKyLuat(
          results[5].status === "fulfilled" ? results[5].value.data || [] : []
        );
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu chi tiết SV:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!sv) return <div className="error">Không tìm thấy sinh viên!</div>;

  return (
    <div className="sv-detail-container">
      <h1>🎓 Hồ sơ sinh viên</h1>

      {/* Tabs */}
      <div className="tab-menu">
        <button
          className={activeTab === "thongtin" ? "active" : ""}
          onClick={() => setActiveTab("thongtin")}
        >
          <FaUserGraduate /> Thông tin cá nhân
        </button>
        <button
          className={activeTab === "diem" ? "active" : ""}
          onClick={() => setActiveTab("diem")}
        >
          <FaBookOpen /> Điểm học tập
        </button>
        <button
          className={activeTab === "hocphi" ? "active" : ""}
          onClick={() => setActiveTab("hocphi")}
        >
          <FaMoneyBillWave /> Học phí
        </button>
        <button
          className={activeTab === "renluyen" ? "active" : ""}
          onClick={() => setActiveTab("renluyen")}
        >
          <FaHeart /> Rèn luyện
        </button>
        <button
          className={activeTab === "khenthuong" ? "active" : ""}
          onClick={() => setActiveTab("khenthuong")}
        >
          <FaMedal /> Khen thưởng
        </button>
        <button
          className={activeTab === "kyluat" ? "active" : ""}
          onClick={() => setActiveTab("kyluat")}
        >
          <FaExclamationTriangle /> Kỷ luật
        </button>
      </div>

      {/* Nội dung tab */}
      <div className="tab-content">
        {/* ========== Thông tin cá nhân ========== */}
        {activeTab === "thongtin" && (
          <div className="info-card">
            <img
              src={
                sv.hinh_anh ? `${API_URL}${sv.hinh_anh}` : "/default-avatar.png"
              }
              alt="avatar"
              className="avatar"
            />
            <div>
              <p>
                <b>Mã SV:</b> {sv.ma_sinh_vien}
              </p>
              <p>
                <b>Họ tên:</b> {sv.ho_ten}
              </p>
              <p>
                <b>CCCD:</b> {sv.cccd}
              </p>
              <p>
                <b>Ngày sinh:</b>{" "}
                {sv.ngay_sinh
                  ? new Date(sv.ngay_sinh).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                <b>Giới tính:</b> {sv.gioi_tinh}
              </p>
              <p>
                <b>Lớp:</b> {sv.ten_lop}
              </p>
              <p>
                <b>Khoa:</b> {sv.ten_khoa}
              </p>
              <p>
                <b>Email:</b> {sv.email}
              </p>
              <p>
                <b>Trạng thái học tập:</b> {sv.trang_thai_hoc_tap}
              </p>
            </div>
          </div>
        )}

        {/* ========== Điểm học tập ========== */}
        {activeTab === "diem" && (
          <table className="info-table">
            <thead>
              <tr>
                <th>Môn học</th>
                <th>Lớp HP</th>
                <th>Điểm QT</th>
                <th>Điểm Thi</th>
                <th>Điểm TK</th>
                <th>Điểm chữ</th>
                <th>Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((r, i) => (
                  <tr key={i}>
                    <td>{r.ten_mon}</td>
                    <td>{r.ma_lop_hp}</td>
                    <td>{r.diem_hs1 ?? "-"}</td>
                    <td>{r.diem_thi ?? "-"}</td>
                    <td>{r.diem_tong ?? "-"}</td>
                    <td>{r.diem_chu ?? "-"}</td>
                    <td>
                      {r.ket_qua === "Dat" ? (
                        <span className="status green">✅ Đạt</span>
                      ) : (
                        <span className="status red">❌ Không đạt</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    Chưa có dữ liệu điểm học tập
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* ========== Học phí ========== */}
        {activeTab === "hocphi" && (
          <table className="info-table">
            <thead>
              <tr>
                <th>Học kỳ</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đóng</th>
              </tr>
            </thead>
            <tbody>
              {hocPhi.length > 0 ? (
                hocPhi.map((h, i) => (
                  <tr key={i}>
                    <td>{h.ten_hoc_ky}</td>
                    <td>{h.so_tien?.toLocaleString()}đ</td>
                    <td>{h.trang_thai}</td>
                    <td>{h.ngay_dong || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Chưa có thông tin học phí</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* ========== Rèn luyện ========== */}
        {activeTab === "renluyen" && (
          <table className="info-table">
            <thead>
              <tr>
                <th>Học kỳ</th>
                <th>Tự đánh giá</th>
                <th>Cố vấn</th>
                <th>Chung kết</th>
                <th>Xếp loại</th>
              </tr>
            </thead>
            <tbody>
              {renLuyen.length > 0 ? (
                renLuyen.map((r, i) => (
                  <tr key={i}>
                    <td>{r.ten_hoc_ky}</td>
                    <td>{r.diem_tu_danh_gia}</td>
                    <td>{r.diem_co_van}</td>
                    <td>{r.diem_chung_ket}</td>
                    <td>{r.xep_loai}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">Chưa có dữ liệu rèn luyện</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* ========== Khen thưởng ========== */}
        {activeTab === "khenthuong" && (
          <ul className="list">
            {khenThuong.length > 0 ? (
              khenThuong.map((k, i) => (
                <li key={i}>
                  🏅 {k.noi_dung} ({k.ngay_khen_thuong})
                </li>
              ))
            ) : (
              <li>Chưa có thông tin khen thưởng</li>
            )}
          </ul>
        )}

        {/* ========== Kỷ luật ========== */}
        {activeTab === "kyluat" && (
          <ul className="list">
            {kyLuat.length > 0 ? (
              kyLuat.map((k, i) => (
                <li key={i}>
                  ⚠️ {k.noi_dung} ({k.ngay_xu_ly})
                </li>
              ))
            ) : (
              <li>Không có kỷ luật nào</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SinhVienDetail;
