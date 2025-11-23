import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KhoaManager = () => {
  const [khoaList, setKhoaList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ma_khoa: "", ten_khoa: "", mo_ta: "" });
  const [editing, setEditing] = useState(null);

  // 🔹 Lấy danh sách khoa
  const fetchKhoa = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/khoa`, {
        withCredentials: true,
        params: { q: keyword },
      });
      setKhoaList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách khoa:", err);
      alert("Không thể tải danh sách khoa!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhoa();
    // eslint-disable-next-line
  }, [keyword]);

  // ➕ Thêm hoặc sửa khoa
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_khoa || !form.ten_khoa)
      return alert("⚠️ Điền đủ Mã khoa và Tên khoa!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/khoa/${editing}`, form, {
          withCredentials: true,
        });
        alert("✅ Cập nhật khoa thành công!");
      } else {
        await axios.post(`${API_URL}/api/khoa`, form, {
          withCredentials: true,
        });
        alert("✅ Thêm khoa thành công!");
      }

      setForm({ ma_khoa: "", ten_khoa: "", mo_ta: "" });
      setEditing(null);
      fetchKhoa();
    } catch (err) {
      console.error("❌ Lỗi khi lưu khoa:", err);
      alert(err.response?.data?.error || "Không thể lưu thông tin khoa!");
    }
  };

  // ✏️ Chọn để sửa
  const handleEdit = (item) => {
    setEditing(item.ma_khoa);
    setForm({
      ma_khoa: item.ma_khoa,
      ten_khoa: item.ten_khoa,
      mo_ta: item.mo_ta || "",
    });
  };

  // 🗑️ Xóa khoa
  const handleDelete = async (ma_khoa) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khoa "${ma_khoa}" không?`))
      return;
    try {
      await axios.delete(`${API_URL}/api/khoa/${ma_khoa}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa khoa!");
      fetchKhoa();
    } catch (err) {
      console.error("❌ Lỗi khi xóa khoa:", err);
      alert(err.response?.data?.error || "Không thể xóa khoa!");
    }
  };

  // 🖥️ Giao diện
  return (
    <div className="admin-dashboard">
      <h1>🏫 Quản lý khoa</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm mã khoa hoặc tên khoa..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm/sửa khoa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa thông tin khoa" : "➕ Thêm khoa mới"}</h3>

        {!editing && (
          <input
            type="text"
            placeholder="Mã khoa"
            value={form.ma_khoa}
            onChange={(e) => setForm({ ...form, ma_khoa: e.target.value })}
          />
        )}
        <input
          type="text"
          placeholder="Tên khoa"
          value={form.ten_khoa}
          onChange={(e) => setForm({ ...form, ten_khoa: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mô tả"
          value={form.mo_ta}
          onChange={(e) => setForm({ ...form, mo_ta: e.target.value })}
        />

        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({ ma_khoa: "", ten_khoa: "", mo_ta: "" });
            }}
          >
            Hủy
          </button>
        )}
      </form>

      {/* 📋 Bảng danh sách khoa */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã khoa</th>
                <th>Tên khoa</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {khoaList.length === 0 ? (
                <tr>
                  <td colSpan="4">Không có dữ liệu</td>
                </tr>
              ) : (
                khoaList.map((item) => (
                  <tr key={item.ma_khoa}>
                    <td>{item.ma_khoa}</td>
                    <td>{item.ten_khoa}</td>
                    <td>{item.mo_ta || "—"}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.ma_khoa)}>
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

export default KhoaManager;
