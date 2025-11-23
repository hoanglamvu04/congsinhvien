import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThongKeHocPhiManager = () => {
  const [records, setRecords] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Lấy danh sách thống kê học phí
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/hocphi/thongke`, {
        withCredentials: true,
      });
      setRecords(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải thống kê học phí:", err);
      alert("Không thể tải thống kê học phí!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 Lọc dữ liệu
  const filtered = records.filter((r) =>
    [r.ho_ten, r.ma_sinh_vien, r.ten_hoc_ky, r.trang_thai]
      .some((f) => f?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>📊 Thống kê học phí sinh viên</h1>

      {/* Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo tên, MSSV, học kỳ hoặc trạng thái..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={fetchData}>🔄 Làm mới</button>
      </div>

      {/* Bảng thống kê */}
      <div className="table-container">
        {loading ? (
          <p>⏳ Đang tải dữ liệu...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>MSSV</th>
                <th>Học kỳ</th>
                <th>Tổng học phí (₫)</th>
                <th>Đã nộp (₫)</th>
                <th>Còn nợ (₫)</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7">Không có dữ liệu</td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={i}>
                    <td>{r.ho_ten || "—"}</td>
                    <td>{r.ma_sinh_vien}</td>
                    <td>{r.ten_hoc_ky}</td>
                    <td>{Number(r.tong_tien_phai_nop || 0).toLocaleString("vi-VN")}</td>
                    <td>{Number(r.tong_tien_da_nop || 0).toLocaleString("vi-VN")}</td>
                    <td
                      style={{
                        color:
                          r.con_no > 0
                            ? "red"
                            : r.con_no < 0
                            ? "orange"
                            : "green",
                      }}
                    >
                      {Number(r.con_no || 0).toLocaleString("vi-VN")}
                    </td>
                    <td
                      className={
                        r.trang_thai === "Đã hoàn thành"
                          ? "status green"
                          : r.trang_thai === "Còn nợ"
                          ? "status orange"
                          : "status red"
                      }
                    >
                      {r.trang_thai}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ThongKeHocPhiManager;
