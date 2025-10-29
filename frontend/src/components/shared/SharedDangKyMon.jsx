import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminQuanLyDangKy = () => {
  const [dangKyList, setDangKyList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/dangky/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : res.data;
      setDangKyList(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đăng ký:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleHuy = async (ma_sinh_vien, ma_lop_hp) => {
    if (!window.confirm("Xác nhận hủy đăng ký này?")) return;
    try {
      await axios.put(
        `${API_URL}/api/dangky/huy/${ma_lop_hp}`,
        { ma_sinh_vien },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Hủy đăng ký thành công!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi hủy đăng ký!");
    }
  };

  const filtered = dangKyList.filter((d) =>
    [d.ten_sinh_vien, d.ten_mon, d.ten_hoc_ky, d.giang_vien, d.ma_lop_hp]
      .some(field => field?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>🧾 Quản lý đăng ký môn học</h1>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm sinh viên, môn, lớp, học kỳ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Mã SV</th>
                <th>Môn học</th>
                <th>Lớp HP</th>
                <th>Giảng viên</th>
                <th>Học kỳ</th>
                <th>Loại đăng ký</th>
                <th>Trạng thái</th>
                <th>Ngày đăng ký</th>
                <th>Thao tác</th>

              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9">Không có dữ liệu</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={`${item.ma_sinh_vien}-${item.ma_lop_hp}`}>
                    <td>{item.ten_sinh_vien}</td>
                    <td>{item.ma_sinh_vien}</td>
                    <td>{item.ten_mon}</td>
                    <td>{item.ma_lop_hp}</td>
                    <td>{item.giang_vien || "-"}</td>
                    <td>{item.ten_hoc_ky}</td>
                    <td>{item.loai_dang_ky}</td>
                    <td>
                      {item.trang_thai === "dangky" ? (
                        <span className="badge active">Đang học</span>
                      ) : (
                        <span className="badge inactive">Đã hủy</span>
                      )}
                    </td>
                    <td>{item.ngay_dang_ky}</td>
                    <td>
                      {item.trang_thai === "dangky" && (
                        <button onClick={() => handleHuy(item.ma_sinh_vien, item.ma_lop_hp)}>
                          ❌ Hủy
                        </button>
                      )}
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

export default AdminQuanLyDangKy;
