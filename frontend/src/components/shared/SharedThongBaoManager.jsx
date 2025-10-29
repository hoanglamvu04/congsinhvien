import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThongBaoManager = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    tieu_de: "",
    noi_dung: "",
    nguoi_gui: "",
    doi_tuong: "tatca",
    ma_doi_tuong: "",
    tep_dinh_kem: "",
    trang_thai: "hienthi",
  });
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách thông báo
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/thongbao/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setList(res.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải thông báo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ➕ Thêm thông báo mới
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/thongbao`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Tạo thông báo thành công!");
      setForm({
        tieu_de: "",
        noi_dung: "",
        nguoi_gui: "",
        doi_tuong: "tatca",
        ma_doi_tuong: "",
        tep_dinh_kem: "",
        trang_thai: "hienthi",
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tạo thông báo!");
    }
  };

  // 🗑️ Xóa thông báo
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/thongbao/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa thông báo!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa thông báo!");
    }
  };

  // 🔍 Lọc
  const filteredList = list.filter(
    (item) =>
      item.tieu_de?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.noi_dung?.toLowerCase().includes(keyword.toLowerCase())
  );

  const formatDate = (date) =>
    new Date(date).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="admin-dashboard">
      <h1>📢 Quản lý thông báo</h1>

      {/* 🔍 Tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề hoặc nội dung..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm thông báo */}
      <form className="create-form" onSubmit={handleCreate}>
        <h3>➕ Tạo thông báo mới</h3>
        <input
          type="text"
          placeholder="Tiêu đề"
          value={form.tieu_de}
          onChange={(e) => setForm({ ...form, tieu_de: e.target.value })}
          required
        />
        <textarea
          placeholder="Nội dung..."
          value={form.noi_dung}
          onChange={(e) => setForm({ ...form, noi_dung: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Người gửi"
          value={form.nguoi_gui}
          onChange={(e) => setForm({ ...form, nguoi_gui: e.target.value })}
        />
        <select
          value={form.doi_tuong}
          onChange={(e) => setForm({ ...form, doi_tuong: e.target.value })}
        >
          <option value="tatca">Tất cả</option>
          <option value="sinhvien">Sinh viên</option>
          <option value="giangvien">Giảng viên</option>
        </select>
        <input
          type="text"
          placeholder="Mã đối tượng (nếu có)"
          value={form.ma_doi_tuong}
          onChange={(e) => setForm({ ...form, ma_doi_tuong: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tệp đính kèm (link hoặc URL)"
          value={form.tep_dinh_kem}
          onChange={(e) => setForm({ ...form, tep_dinh_kem: e.target.value })}
        />
        <select
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        >
          <option value="hienthi">Hiển thị</option>
          <option value="an">Ẩn</option>
        </select>
        <button type="submit">📢 Gửi thông báo</button>
      </form>

      {/* 📋 Danh sách */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
                <th>Người gửi</th>
                <th>Đối tượng</th>
                <th>Mã đối tượng</th>
                <th>Tệp đính kèm</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="10">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id_thong_bao}>
                    <td>{idx + 1}</td>
                    <td>{item.tieu_de}</td>
                    <td>{item.noi_dung}</td>
                    <td>{item.nguoi_gui}</td>
                    <td>{item.doi_tuong}</td>
                    <td>{item.ma_doi_tuong || "—"}</td>
                    <td>
                      {item.tep_dinh_kem ? (
                        <a href={item.tep_dinh_kem} target="_blank" rel="noreferrer">
                          📎 Xem
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{item.trang_thai === "hienthi" ? "✅ Hiển thị" : "🚫 Ẩn"}</td>
                    <td>{formatDate(item.ngay_gui)}</td>
                    <td>
                      <button onClick={() => handleDelete(item.id_thong_bao)}>🗑️</button>
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

export default ThongBaoManager;
