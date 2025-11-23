import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const TinNhanManager = () => {
  const [tinNhanList, setTinNhanList] = useState([]);
  const [thongKe, setThongKe] = useState({});
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nguoi_gui: "",
    nguoi_nhan: "",
    noi_dung: "",
    tep_dinh_kem: "",
  });

  // 📬 Lấy danh sách tin nhắn & thống kê
  const fetchTinNhan = async () => {
    try {
      setLoading(true);
      const [res, tk] = await Promise.all([
        axios.get(`${API_URL}/api/tinnhan`, { withCredentials: true }),
        axios.get(`${API_URL}/api/tinnhan/thongke`, { withCredentials: true }),
      ]);
      setTinNhanList(res.data.data || []);
      setThongKe(tk.data || {});
    } catch (err) {
      console.error("❌ Lỗi khi tải tin nhắn:", err);
      alert("Không thể tải danh sách tin nhắn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTinNhan();
  }, []);

  // 🔍 Lọc theo từ khóa
  const filteredList = tinNhanList.filter(
    (item) =>
      item.nguoi_gui?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.nguoi_nhan?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.noi_dung?.toLowerCase().includes(keyword.toLowerCase())
  );

  // ✉️ Gửi tin nhắn thủ công (admin)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nguoi_gui || !form.nguoi_nhan || !form.noi_dung)
      return alert("⚠️ Vui lòng nhập đủ người gửi, người nhận và nội dung!");

    try {
      await axios.post(`${API_URL}/api/tinnhan`, form, { withCredentials: true });
      alert("✅ Gửi tin nhắn thành công!");
      setForm({ nguoi_gui: "", nguoi_nhan: "", noi_dung: "", tep_dinh_kem: "" });
      fetchTinNhan();
    } catch (err) {
      console.error("❌ Lỗi khi gửi tin nhắn:", err);
      alert(err.response?.data?.error || "Không thể gửi tin nhắn!");
    }
  };

  // 🗑️ Xóa tin nhắn
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tin nhắn này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/tinnhan/${id}`, { withCredentials: true });
      alert("🗑️ Đã xóa tin nhắn!");
      fetchTinNhan();
    } catch (err) {
      console.error("❌ Lỗi khi xóa tin nhắn:", err);
      alert("Không thể xóa tin nhắn!");
    }
  };

  // 🕒 Format thời gian hiển thị
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
      <h1>💬 Quản lý Tin nhắn</h1>

      {/* 🔢 Thống kê */}
      <div className="stats-bar">
        <p>📨 Tổng: <b>{thongKe.tong_tin_nhan || 0}</b></p>
        <p>📩 Chưa đọc: <b>{thongKe.chua_doc || 0}</b></p>
        <p>✅ Đã đọc: <b>{thongKe.da_doc || 0}</b></p>
      </div>

      {/* 🔍 Tìm kiếm + Làm mới */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo người gửi, người nhận hoặc nội dung..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={fetchTinNhan}>🔄 Làm mới</button>
      </div>

      {/* 🧾 Form gửi tin nhắn thủ công */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>✉️ Gửi tin nhắn thủ công</h3>

        <input
          type="text"
          placeholder="Người gửi (tên đăng nhập)"
          value={form.nguoi_gui}
          onChange={(e) => setForm({ ...form, nguoi_gui: e.target.value })}
        />

        <input
          type="text"
          placeholder="Người nhận (tên đăng nhập)"
          value={form.nguoi_nhan}
          onChange={(e) => setForm({ ...form, nguoi_nhan: e.target.value })}
        />

        <textarea
          placeholder="Nội dung tin nhắn..."
          value={form.noi_dung}
          onChange={(e) => setForm({ ...form, noi_dung: e.target.value })}
        />

        <input
          type="text"
          placeholder="Link tệp đính kèm (nếu có)"
          value={form.tep_dinh_kem}
          onChange={(e) => setForm({ ...form, tep_dinh_kem: e.target.value })}
        />

        <button type="submit">📨 Gửi tin</button>
      </form>

      {/* 📋 Bảng danh sách tin nhắn */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Người gửi</th>
                <th>Người nhận</th>
                <th>Nội dung</th>
                <th>Thời gian gửi</th>
                <th>Đã đọc</th>
                <th>Trạng thái</th>
                <th>Tệp đính kèm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id_tin_nhan}>
                    <td>{idx + 1}</td>
                    <td>{item.nguoi_gui}</td>
                    <td>{item.nguoi_nhan}</td>
                    <td className="wrap-text">{item.noi_dung}</td>
                    <td>{formatDate(item.thoi_gian_gui)}</td>
                    <td>{item.da_doc ? "✅" : "📩"}</td>
                    <td>{item.trang_thai}</td>
                    <td>
                      {item.tep_dinh_kem ? (
                        <a
                          href={item.tep_dinh_kem}
                          target="_blank"
                          rel="noreferrer"
                        >
                          📎 Xem
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <button onClick={() => handleDelete(item.id_tin_nhan)}>
                        🗑️
                      </button>
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

export default TinNhanManager;
