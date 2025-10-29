import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/KetQuaHocTap.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KetQuaHocTap = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [hocKyList, setHocKyList] = useState([]);
  const [namHocList, setNamHocList] = useState([]);
  const [selectedHocKy, setSelectedHocKy] = useState("");
  const [selectedNamHoc, setSelectedNamHoc] = useState("");
  const [selectedNganh, setSelectedNganh] = useState("Chuyên ngành chính");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/diem/me/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rows = res.data.data || [];
        setData(rows);
        setSummary(res.data.summary);

        const hk = [...new Set(rows.map((r) => r.ten_hoc_ky))];
        const nh = [...new Set(rows.map((r) => r.nam_hoc))];
        setHocKyList(hk);
        setNamHocList(nh);
      } catch (err) {
        console.error(err);
        alert("❌ Không thể tải dữ liệu kết quả học tập!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((d) => {
    const matchHocKy = selectedHocKy ? d.ten_hoc_ky === selectedHocKy : true;
    const matchNamHoc = selectedNamHoc ? d.nam_hoc === selectedNamHoc : true;
    const matchNganh = selectedNganh === "Chuyên ngành chính";
    return matchHocKy && matchNamHoc && matchNganh;
  });

  if (loading) return <p className="loading-text">⏳ Đang tải dữ liệu...</p>;
  if (!summary)
    return <p className="no-data">⚠️ Không có dữ liệu để hiển thị.</p>;

  const maSinhVien = data[0]?.ma_sinh_vien || "N/A";
  const tongTinChi = summary.tin_chi_tich_luy || 0;
  const gpa10 = summary.gpa_he_10 || 0;
  const gpa4 = summary.gpa_he_4 || 0;
  const xepLoai =
    gpa4 >= 3.6
      ? "Xuất sắc"
      : gpa4 >= 3.2
        ? "Giỏi"
        : gpa4 >= 2.5
          ? "Khá"
          : gpa4 >= 2.0
            ? "Trung bình"
            : "Yếu";

  return (
    <div className="bk-container">
      {/* ==== Thông tin tổng quan ==== */}
      <div className="bk-info">
        <div className="bk-row">
          <p><b>Mã sinh viên:</b> <span className="red-text">{maSinhVien}</span></p>
          <p><b>Xếp loại học tập:</b> <span className="red-text">{xepLoai}</span></p>
          <p><b>TBC học tập (Hệ 10):</b> <span className="red-text">{gpa10}</span></p>
        </div>

        <div className="bk-row">
          <p><b>TBC tích lũy (Hệ 4):</b> <span className="red-text">{gpa4}</span></p>
          <p><b>Số tín chỉ tích lũy:</b> <span className="red-text">{tongTinChi}</span></p>
          <p><b>Số tín chỉ học tập:</b> <span className="red-text">{data.length}</span></p>
        </div>

        <div className="bk-row">
          <p><b>TBC tích lũy (Hệ 10):</b> <span className="red-text">{gpa10}</span></p>
          <p><b>Đánh giá:</b> <span className="red-text">{xepLoai}</span></p>
        </div>

        {/* Bộ lọc */}
        <div className="bk-filters">
          <div className="filter-item">
            <label>Học kỳ</label>
            <select value={selectedHocKy} onChange={(e) => setSelectedHocKy(e.target.value)}>
              <option value="">--- Chọn học kỳ ---</option>
              {hocKyList.map((hk, i) => (
                <option key={i} value={hk}>{hk}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Năm học</label>
            <select value={selectedNamHoc} onChange={(e) => setSelectedNamHoc(e.target.value)}>
              <option value="">--- Chọn năm học ---</option>
              {namHocList.map((nh, i) => (
                <option key={i} value={nh}>{nh}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Ngành học</label>
            <select value={selectedNganh} onChange={(e) => setSelectedNganh(e.target.value)}>
              <option value="Chuyên ngành chính">Chuyên ngành chính</option>
              <option value="Chuyên ngành 2">Chuyên ngành 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==== Bảng điểm ==== */}
      {selectedNganh === "Chuyên ngành 2" ? (
        <p className="no-data">⚠️ Không có dữ liệu cho chuyên ngành 2.</p>
      ) : (
        <div className="bk-table-container">
          <h4>📘 Danh sách điểm học phần đã học</h4>
          <table className="bk-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Lớp học phần</th>
                <th>Tên học phần</th>
                <th>Số tín chỉ</th>
                <th>Điểm thành phần</th>
                <th>Điểm thi</th>
                <th>TBCHP</th>
                <th>Điểm chữ</th>
                <th>Môn tự chọn</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((d, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{d.ma_lop_hp}</td>
                  <td>{d.ten_mon}</td>
                  <td>{d.so_tin_chi}</td>
                  <td>TX1: {d.diem_hs1 || "-"} - TX2: {d.diem_hs2 || "-"}</td>
                  <td>{d.diem_thi || "-"}</td>
                  <td>{d.diem_tong || "-"}</td>
                  <td>{d.diem_chu}</td>
                  <td>{d.ket_qua === "Dat" ? "✅ Đạt" : "❌ Không đạt"}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default KetQuaHocTap;
