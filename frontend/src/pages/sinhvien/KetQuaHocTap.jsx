import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaGraduationCap, FaFilter, FaChartLine, FaChevronDown, FaChevronUp, FaUndo } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/KetQuaHocTap.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KetQuaHocTap = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const loadLS = (key, def) =>
    localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : def;

  // ---- STATES ----
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);

  const [hocKyList, setHocKyList] = useState([]);
  const [namHocList, setNamHocList] = useState([]);

  const [selectedHocKy, setSelectedHocKy] = useState(
    searchParams.get("hocky") || loadLS("hocky", "")
  );
  const [selectedNamHoc, setSelectedNamHoc] = useState(
    searchParams.get("namhoc") || loadLS("namhoc", "")
  );

  const [selectedNganh, setSelectedNganh] = useState("Chuyên ngành chính");

  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [diemChiTiet, setDiemChiTiet] = useState({});

  // ------------------------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------------------------
  const fetchData = async () => {
    try {
      setLoading(true);

      const params = {};
      if (selectedHocKy) params.hocky = selectedHocKy;
      if (selectedNamHoc) params.namhoc = selectedNamHoc;

      const query = new URLSearchParams(params).toString();

      const [sumRes, diemRes] = await Promise.all([
        axios.get(`${API_URL}/api/diem/me/summary`, { withCredentials: true }),
        axios.get(`${API_URL}/api/diem/me?${query}`, { withCredentials: true }),
      ]);

      const rows = sumRes.data.data || [];

      setData(rows);
      setSummary(sumRes.data.summary);

      setHocKyList([...new Set(rows.map((r) => r.ten_hoc_ky))]);
      setNamHocList([...new Set(rows.map((r) => r.nam_hoc))]);

      const map = {};
      diemRes.data.data.forEach((d) => {
        if (d.lan_thi) map[d.id_diem] = d.lan_thi;
      });
      setDiemChiTiet(map);
    } catch (err) {
      toast.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ------------------------------------------------------------------
  // SYNC URL + LOCALSTORAGE
  // ------------------------------------------------------------------
  useEffect(() => {
    const params = {};
    if (selectedHocKy) params.hocky = selectedHocKy;
    if (selectedNamHoc) params.namhoc = selectedNamHoc;
    setSearchParams(params);

    localStorage.setItem("hocky", JSON.stringify(selectedHocKy));
    localStorage.setItem("namhoc", JSON.stringify(selectedNamHoc));

    fetchData();
  }, [selectedHocKy, selectedNamHoc]);

  // ------------------------------------------------------------------
  // RESET BỘ LỌC
  // ------------------------------------------------------------------
  const resetFilters = () => {
    setSelectedHocKy("");
    setSelectedNamHoc("");

    localStorage.removeItem("hocky");
    localStorage.removeItem("namhoc");

    setSearchParams({});
  };

  // ------------------------------------------------------------------
  // FILTER + UI
  // ------------------------------------------------------------------
  const filteredData = data.filter((d) => {
    const matchHK = selectedHocKy ? d.ten_hoc_ky === selectedHocKy : true;
    const matchNH = selectedNamHoc ? d.nam_hoc === selectedNamHoc : true;
    return matchHK && matchNH;
  });

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;
  if (!summary) return <p>⚠️ Không có dữ liệu.</p>;

  const maSV = data[0]?.ma_sinh_vien || "N/A";

  const gpa10 = summary.gpa_he_10?.toFixed(2);
  const gpa4 = summary.gpa_he_4?.toFixed(2);
  const tongTC = summary.tin_chi_tich_luy;

  return (
    <div className="bk-container">
      <ToastContainer />

      <div className="bk-header">
        <FaGraduationCap className="icon" />
        <h2>Kết quả học tập cá nhân</h2>
      </div>

      {/* THÔNG TIN */}
      <div className="bk-info">
        <div className="bk-row">
          <p><b>MSSV:</b> <span className="red-text">{maSV}</span></p>
          <p><b>GPA (4):</b> <span className="red-text">{gpa4}</span></p>
          <p><b>GPA (10):</b> <span className="red-text">{gpa10}</span></p>
        </div>

        <div className="bk-row">
          <p><b>Tín chỉ tích lũy:</b> <span className="red-text">{tongTC}</span></p>
          <p><b>Tổng số môn:</b> <span className="red-text">{data.length}</span></p>
        </div>
      </div>

      {/* BỘ LỌC */}
      <div className="bk-filters">
        <FaFilter className="filter-icon" />

        <div className="filter-item">
          <label>Học kỳ</label>
          <select value={selectedHocKy} onChange={(e) => setSelectedHocKy(e.target.value)}>
            <option value="">Tất cả</option>
            {hocKyList.map((hk, i) => <option key={i} value={hk}>{hk}</option>)}
          </select>
        </div>

        <div className="filter-item">
          <label>Năm học</label>
          <select value={selectedNamHoc} onChange={(e) => setSelectedNamHoc(e.target.value)}>
            <option value="">Tất cả</option>
            {namHocList.map((nh, i) => <option key={i} value={nh}>{nh}</option>)}
          </select>
        </div>

        <button className="reset-btn" onClick={resetFilters}>
          <FaUndo /> Xóa bộ lọc
        </button>
      </div>

      {/* BẢNG ĐIỂM */}
      <div className="bk-table-container">
        <h4><FaChartLine /> Danh sách điểm học phần</h4>

        <table className="bk-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã lớp HP</th>
              <th>Môn học</th>
              <th>Số TC</th>
              <th>TX1 / TX2</th>
              <th>Thi</th>
              <th>TB</th>
              <th>Điểm chữ</th>
              <th>KQ</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((d, idx) => (
              <React.Fragment key={idx}>
                <tr onClick={() => toggleExpand(d.id_diem)} style={{ cursor: "pointer" }}>
                  <td>{idx + 1}</td>
                  <td>{d.ma_lop_hp}</td>
                  <td>{d.ten_mon}</td>
                  <td>{d.so_tin_chi}</td>
                  <td>{d.diem_hs1 || "-"} / {d.diem_hs2 || "-"}</td>
                  <td>{d.diem_thi ?? "-"}</td>
                  <td>{d.diem_tong ?? "-"}</td>
                  <td>{d.diem_chu ?? "-"}</td>
                  <td>
                    {d.ket_qua === "Dat" ? (
                      <span className="status green">Đạt</span>
                    ) : (
                      <span className="status red">Rớt</span>
                    )}
                  </td>
                  <td>{expanded === d.id_diem ? <FaChevronUp /> : <FaChevronDown />}</td>
                </tr>

                {expanded === d.id_diem && (
                  <tr>
                    <td colSpan="10">
                      <div className="bk-subtable">
                        <h4>🕓 Lịch sử thi lại</h4>
                        <table>
                          <thead>
                            <tr><th>Lần thi</th><th>Điểm</th><th>Ngày</th><th>Ghi chú</th></tr>
                          </thead>

                          <tbody>
                            {diemChiTiet[d.id_diem]?.length ? (
                              diemChiTiet[d.id_diem].map((lt, i) => (
                                <tr key={i}>
                                  <td>{lt.lan_thi}</td>
                                  <td>{lt.diem_thi}</td>
                                  <td>{new Date(lt.ngay_thi).toLocaleDateString()}</td>
                                  <td>{lt.ghi_chu || "-"}</td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan="4">Không có thi lại</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KetQuaHocTap;
