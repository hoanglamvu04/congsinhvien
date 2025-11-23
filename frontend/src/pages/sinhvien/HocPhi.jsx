import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaWallet,
  FaCoins,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaUniversity,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/HocPhi.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const HocPhi = () => {
  const [hocPhi, setHocPhi] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [hocKyList, setHocKyList] = useState(["Tất cả"]);
  const [hocKyChon, setHocKyChon] = useState("Tất cả");
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy dữ liệu học phí
  const fetchHocPhi = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/hocphi/me`, {
        withCredentials: true,
      });
      const data = res.data.data || [];
      setHocPhi(data);
      setFiltered(data);
      setHocKyList(["Tất cả", ...new Set(data.map((x) => x.ten_hoc_ky))]);
    } catch (err) {
      console.error("❌ Lỗi khi tải học phí:", err);
      toast.error("Không thể tải danh sách học phí!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHocPhi();
  }, []);

  // 🔹 Lọc theo học kỳ
  const handleFilter = (value) => {
    setHocKyChon(value);
    if (value === "Tất cả") setFiltered(hocPhi);
    else setFiltered(hocPhi.filter((hp) => hp.ten_hoc_ky === value));
  };

  // 🔹 Tính tổng
  const tongPhaiNop = filtered.reduce((a, b) => a + Number(b.tong_tien_phai_nop || 0), 0);
  const daNop = filtered.reduce((a, b) => a + Number(b.tong_tien_da_nop || 0), 0);
  const conNo = filtered.reduce((a, b) => a + Number(b.con_no || 0), 0);

  if (loading)
    return <p className="loading">⏳ Đang tải học phí...</p>;

  return (
    <div className="hocphi-page">
      <ToastContainer position="top-center" autoClose={2500} />
      <div className="hocphi-header">
        <FaUniversity className="icon" />
        <h2>Học phí cá nhân</h2>
      </div>

      {/* 📊 Tổng quan học phí */}
      {hocPhi.length > 0 && (
        <div className="hocphi-summary">
          <div className="summary-card blue">
            <FaMoneyBillWave />
            <div>
              <p>Tổng phải nộp</p>
              <b>{tongPhaiNop.toLocaleString("vi-VN")} ₫</b>
            </div>
          </div>
          <div className="summary-card green">
            <FaWallet />
            <div>
              <p>Đã nộp</p>
              <b>{daNop.toLocaleString("vi-VN")} ₫</b>
            </div>
          </div>
          <div className="summary-card red">
            <FaCoins />
            <div>
              <p>Còn nợ</p>
              <b>{conNo.toLocaleString("vi-VN")} ₫</b>
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

      {/* Bảng học phí */}
      {hocPhi.length === 0 ? (
        <p className="no-data">⚠️ Chưa có dữ liệu học phí.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Học kỳ</th>
                <th>Tổng phải nộp</th>
                <th>Đã nộp</th>
                <th>Còn nợ / Dư</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hp, index) => (
                <tr key={index}>
                  <td>{hp.ten_hoc_ky}</td>
                  <td>{hp.tong_tien_phai_nop?.toLocaleString("vi-VN")} ₫</td>
                  <td>{hp.tong_tien_da_nop?.toLocaleString("vi-VN")} ₫</td>
                  <td
                    style={{
                      color: hp.con_no > 0 ? "red" : hp.con_no < 0 ? "green" : "#333",
                      fontWeight: 500,
                    }}
                  >
                    {hp.con_no > 0
                      ? `-${hp.con_no.toLocaleString("vi-VN")} ₫`
                      : hp.con_no < 0
                      ? `+${Math.abs(hp.con_no).toLocaleString("vi-VN")} ₫`
                      : "0 ₫"}
                  </td>
                  <td>
                    {hp.trang_thai === "chuadong" && (
                      <span className="status red">
                        <FaTimesCircle /> Chưa đóng
                      </span>
                    )}
                    {hp.trang_thai === "dangdong" && (
                      <span className="status yellow">
                        <FaExclamationTriangle /> Đang đóng
                      </span>
                    )}
                    {hp.trang_thai === "dahoantat" && (
                      <span className="status green">
                        <FaCheckCircle /> Đã hoàn tất
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

export default HocPhi;
