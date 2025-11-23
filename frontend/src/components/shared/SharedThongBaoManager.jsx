import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThongBaoManager = ({ role = "admin" }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({
    tieu_de: "",
    noi_dung: "",
    doi_tuong: "tatca",
    ma_doi_tuong: "",
    tep_dinh_kem: "",
    trang_thai: "hienthi",
  });

  // 🌀 Lấy danh sách thông báo
  const fetchData = async () => {
    try {
      setLoading(true);
      let endpoint = "/api/thongbao";

      if (role === "khoa" || role === "pdt") endpoint = "/api/thongbao/theo-khoa";

      const res = await axios.get(`${API_URL}${endpoint}`, {
        withCredentials: true,
      });

      const data = res.data?.data || res.data || [];
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách thông báo:", err);
      alert("Không thể tải danh sách thông báo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // ➕ Gửi thông báo mới
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.tieu_de.trim() || !form.noi_dung.trim())
      return alert("⚠️ Vui lòng nhập đủ tiêu đề và nội dung!");

    try {
      await axios.post(`${API_URL}/api/thongbao`, form, {
        withCredentials: true,
      });
      alert("✅ Thông báo đã được tạo thành công!");
      resetForm();
      fetchData();
    } catch (err) {
      console.error("❌ Lỗi khi tạo thông báo:", err);
      alert(err.response?.data?.error || "Không thể tạo thông báo!");
    }
  };

  // 🔁 Reset form
  const resetForm = () => {
    setForm({
      tieu_de: "",
      noi_dung: "",
      doi_tuong: "tatca",
      ma_doi_tuong: "",
      tep_dinh_kem: "",
      trang_thai: "hienthi",
    });
  };

  // 🗑️ Xóa thông báo
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/thongbao/${id}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa thông báo!");
      fetchData();
    } catch (err) {
      console.error("❌ Lỗi khi xóa thông báo:", err);
      alert("Không thể xóa thông báo!");
    }
  };

  // 🔍 Lọc từ khóa
  const filteredList = list.filter(
    (item) =>
      item.tieu_de?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.noi_dung?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.nguoi_gui?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.ten_khoa?.toLowerCase().includes(keyword.toLowerCase())
  );

  // ⏰ Định dạng ngày
  const formatDate = (date) =>
    new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="admin-dashboard">
      <h1>📢 Quản lý Thông báo {role === "khoa" ? "Khoa" : role === "pdt" ? "Phòng đào tạo" : ""}</h1>

      {/* 🔍 Bộ lọc tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề, nội dung, người gửi..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={fetchData}>🔄 Làm mới</button>
      </div>

      {/* 🧾 Form thêm thông báo */}
      <form className="create-form" onSubmit={handleCreate}>
        <h3>🆕 Tạo thông báo mới</h3>

        <input
          type="text"
          placeholder="Tiêu đề"
          value={form.tieu_de}
          onChange={(e) => setForm({ ...form, tieu_de: e.target.value })}
          required
        />

        <textarea
          placeholder="Nội dung thông báo..."
          value={form.noi_dung}
          onChange={(e) => setForm({ ...form, noi_dung: e.target.value })}
          required
        />

        <select
          value={form.doi_tuong}
          onChange={(e) => setForm({ ...form, doi_tuong: e.target.value })}
        >
          <option value="tatca">Toàn trường</option>
          <option value="sinhvien">Sinh viên</option>
          <option value="lop">Theo lớp</option>
          <option value="khoa">Theo khoa</option>
        </select>

        <input
          type="text"
          placeholder="Mã đối tượng (nếu có)"
          value={form.ma_doi_tuong}
          onChange={(e) => setForm({ ...form, ma_doi_tuong: e.target.value })}
        />

        <input
          type="text"
          placeholder="Tệp đính kèm (link hoặc file URL)"
          value={form.tep_dinh_kem}
          onChange={(e) => setForm({ ...form, tep_dinh_kem: e.target.value })}
        />

        <select
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        >
          <option value="hienthi">✅ Hiển thị</option>
          <option value="an">🚫 Ẩn</option>
        </select>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button type="submit">📨 Gửi thông báo</button>
          <button type="button" onClick={resetForm}>
            🔄 Reset
          </button>
        </div>
      </form>

      {/* 📋 Danh sách thông báo */}
      <div className="table-container">
        {loading ? (
          <p>⏳ Đang tải dữ liệu...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
                <th>Người gửi</th>
                <th>Đối tượng</th>
                <th>Mã ĐT</th>
                <th>Khoa</th>
                <th>Tệp đính kèm</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="11">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id_thong_bao}>
                    <td>{idx + 1}</td>
                    <td>{item.tieu_de}</td>
                    <td className="wrap-text">{item.noi_dung}</td>
                    <td>{item.nguoi_gui || "—"}</td>
                    <td>{item.doi_tuong}</td>
                    <td>{item.ma_doi_tuong || "—"}</td>
                    <td>{item.ten_khoa || "—"}</td>
                    <td>
                      {item.tep_dinh_kem ? (
                        <a href={item.tep_dinh_kem} target="_blank" rel="noreferrer">
                          📎 Xem
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {item.trang_thai === "hienthi" ? "✅ Hiển thị" : "🚫 Ẩn"}
                    </td>
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
