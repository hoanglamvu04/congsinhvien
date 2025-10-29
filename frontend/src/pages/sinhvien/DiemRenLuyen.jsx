import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaChartBar,
  FaStar,
  FaExclamationTriangle,
  FaTrophy,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaMedal,
  FaBookOpen,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "../../styles/DiemRenLuyen.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DiemRenLuyen = () => {
  const token = localStorage.getItem("token");
  const [dsDiem, setDsDiem] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [hocKyList, setHocKyList] = useState([]);
  const [hocKyChon, setHocKyChon] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [thongKe, setThongKe] = useState({ tb: 0, max: 0, min: 0 });

  // 📘 Lấy dữ liệu
  const fetchDiemRenLuyen = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/diemrenluyen`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setDsDiem(data);
      setFiltered(data);
      setHocKyList(["Tất cả", ...new Set(data.map((x) => x.ten_hoc_ky))]);

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
      toast.error("Không thể tải danh sách điểm rèn luyện!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiemRenLuyen();
  }, []);

  // 📊 Lọc theo học kỳ
  const handleFilter = (value) => {
    setHocKyChon(value);
    if (value === "Tất cả") {
      setFiltered(dsDiem);
    } else {
      setFiltered(dsDiem.filter((d) => d.ten_hoc_ky === value));
    }
  };

  return (
    <div className="drl-page">
      <div className="drl-header">
        <FaBookOpen className="icon" />
        <h2>Điểm rèn luyện</h2>
      </div>

      {/* 📊 Thống kê nhanh */}
      {!loading && dsDiem.length > 0 && (
        <div className="summary-container">
          <div className="summary-card blue">
            <FaChartBar />
            <div>
              <p>Tổng học kỳ</p>
              <b>{dsDiem.length}</b>
            </div>
          </div>
          <div className="summary-card green">
            <FaStar />
            <div>
              <p>Trung bình</p>
              <b>{thongKe.tb}</b>
            </div>
          </div>
          <div className="summary-card yellow">
            <FaTrophy />
            <div>
              <p>Cao nhất</p>
              <b>{thongKe.max}</b>
            </div>
          </div>
          <div className="summary-card red">
            <FaExclamationTriangle />
            <div>
              <p>Thấp nhất</p>
              <b>{thongKe.min}</b>
            </div>
          </div>
        </div>
      )}

      {/* Bộ lọc học kỳ */}
      <div className="filter-bar">
        <FaFilter className="filter-icon" />
        <label>Chọn học kỳ:</label>
        <select value={hocKyChon} onChange={(e) => handleFilter(e.target.value)}>
          {hocKyList.map((hk, idx) => (
            <option key={idx}>{hk}</option>
          ))}
        </select>
      </div>

      {/* Bảng dữ liệu */}
      {loading ? (
        <p className="loading">⏳ Đang tải dữ liệu...</p>
      ) : filtered.length === 0 ? (
        <p className="no-data">⚠️ Chưa có dữ liệu điểm rèn luyện.</p>
      ) : (
        <div className="table-wrapper">
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
              {filtered.map((drl, i) => (
                <tr key={drl.id_drl}>
                  <td>{i + 1}</td>
                  <td>{drl.ten_hoc_ky}</td>
                  <td>{drl.diem_tu_danh_gia ?? "—"}</td>
                  <td>{drl.diem_co_van ?? "—"}</td>
                  <td>{drl.diem_chung_ket ?? "—"}</td>
                  <td className="xl-cell">
                    {drl.xep_loai === "Xuất sắc" && (
                      <span className="xl-label gold">
                        <FaMedal /> {drl.xep_loai}
                      </span>
                    )}
                    {drl.xep_loai === "Tốt" && (
                      <span className="xl-label green">
                        <FaCheckCircle /> {drl.xep_loai}
                      </span>
                    )}
                    {drl.xep_loai === "Khá" && (
                      <span className="xl-label blue">
                        <FaBookOpen /> {drl.xep_loai}
                      </span>
                    )}
                    {drl.xep_loai === "Trung bình" && (
                      <span className="xl-label yellow">
                        <FaExclamationTriangle /> {drl.xep_loai}
                      </span>
                    )}
                    {drl.xep_loai === "Yếu" && (
                      <span className="xl-label red">
                        <FaTimesCircle /> {drl.xep_loai}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DiemRenLuyen;
