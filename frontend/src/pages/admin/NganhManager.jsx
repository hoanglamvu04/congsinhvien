import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const NganhManager = () => {
  const [nganhList, setNganhList] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    ma_nganh: "",
    ten_nganh: "",
    ma_khoa: "",
    loai_nganh: "",
    mo_ta: "",
  });

  // 🔄 Lấy danh sách ngành
  const fetchNganh = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/nganh`, {
        withCredentials: true,
        params: { q: keyword },
      });
      setNganhList(res.data.data || res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách ngành:", err);
      alert("Không thể tải danh sách ngành!");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Lấy danh sách khoa
  const fetchKhoa = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/khoa`, {
        withCredentials: true,
      });
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setKhoaList(data);
    } catch (err) {
      console.warn("⚠️ Không thể tải danh sách khoa:", err);
    }
  };

  useEffect(() => {
    fetchKhoa();
    fetchNganh();
  }, [keyword]);

  // ➕ Thêm hoặc sửa ngành
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_nganh || !form.ten_nganh || !form.ma_khoa)
      return alert("⚠️ Vui lòng nhập đầy đủ Mã ngành, Tên ngành và Khoa!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/nganh/${editing}`, form, {
          withCredentials: true,
        });
        alert("✅ Cập nhật ngành thành công!");
      } else {
        await axios.post(`${API_URL}/api/nganh`, form, {
          withCredentials: true,
        });
        alert("✅ Thêm ngành mới thành công!");
      }

      setForm({
        ma_nganh: "",
        ten_nganh: "",
        ma_khoa: "",
        loai_nganh: "",
        mo_ta: "",
      });
      setEditing(null);
      fetchNganh();
    } catch (err) {
      console.error("❌ Lỗi khi lưu ngành:", err);
      alert(err.response?.data?.error || "Không thể lưu ngành!");
    }
  };

  // ✏️ Chọn để sửa
  const handleEdit = (item) => {
    setEditing(item.ma_nganh);
    setForm({
      ma_nganh: item.ma_nganh || "",
      ten_nganh: item.ten_nganh || "",
      ma_khoa: item.ma_khoa || "",
      loai_nganh: item.loai_nganh || "",
      mo_ta: item.mo_ta || "",
    });
  };

  // 🗑️ Xóa ngành
  const handleDelete = async (ma_nganh) => {
    if (!window.confirm("Bạn có chắc muốn xóa ngành này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/nganh/${ma_nganh}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa ngành!");
      fetchNganh();
    } catch (err) {
      console.error("❌ Lỗi khi xóa ngành:", err);
      alert(err.response?.data?.error || "Không thể xóa ngành!");
    }
  };

  // 🧭 Giao diện
  return (
    <div className="admin-dashboard">
      <h1>📚 Quản lý ngành</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm mã ngành, tên ngành hoặc khoa..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm / sửa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa ngành" : "➕ Thêm ngành mới"}</h3>
        {!editing && (
          <input
            type="text"
            placeholder="Mã ngành"
            value={form.ma_nganh}
            onChange={(e) => setForm({ ...form, ma_nganh: e.target.value })}
          />
        )}
        <input
          type="text"
          placeholder="Tên ngành"
          value={form.ten_nganh}
          onChange={(e) => setForm({ ...form, ten_nganh: e.target.value })}
        />
        <select
          value={form.ma_khoa}
          onChange={(e) => setForm({ ...form, ma_khoa: e.target.value })}
        >
          <option value="">-- Chọn khoa --</option>
          {khoaList.map((k) => (
            <option key={k.ma_khoa} value={k.ma_khoa}>
              {k.ten_khoa}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Loại ngành (VD: Đại học, Cao đẳng, Liên thông...)"
          value={form.loai_nganh}
          onChange={(e) => setForm({ ...form, loai_nganh: e.target.value })}
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
              setForm({
                ma_nganh: "",
                ten_nganh: "",
                ma_khoa: "",
                loai_nganh: "",
                mo_ta: "",
              });
            }}
          >
            Hủy
          </button>
        )}
      </form>

      {/* 📋 Bảng danh sách ngành */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã ngành</th>
                <th>Tên ngành</th>
                <th>Khoa</th>
                <th>Loại ngành</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {nganhList.length === 0 ? (
                <tr>
                  <td colSpan="6">Không có dữ liệu</td>
                </tr>
              ) : (
                nganhList.map((item) => (
                  <tr key={item.ma_nganh}>
                    <td>{item.ma_nganh}</td>
                    <td>{item.ten_nganh}</td>
                    <td>{item.ten_khoa || "—"}</td>
                    <td>{item.loai_nganh || "—"}</td>
                    <td>{item.mo_ta || "—"}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.ma_nganh)}>🗑️</button>
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

export default NganhManager;
