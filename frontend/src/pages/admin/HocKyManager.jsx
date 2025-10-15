import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const HocKyManager = () => {
  const [hocKyList, setHocKyList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ma_hoc_ky: "",
    ten_hoc_ky: "",
    nam_hoc: "",
    da_khoa: 0,
  });
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách học kỳ
  const fetchHocKy = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/hocky`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: keyword },
      });
      setHocKyList(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách học kỳ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHocKy();
  }, [keyword]);

  // ➕ Thêm / sửa học kỳ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_hoc_ky || !form.ten_hoc_ky || !form.nam_hoc)
      return alert("Điền đủ Mã học kỳ, Tên học kỳ và Năm học!");
    try {
      if (editing) {
        await axios.put(`${API_URL}/api/hocky/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật học kỳ thành công!");
      } else {
        await axios.post(`${API_URL}/api/hocky`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm học kỳ thành công!");
      }
      setForm({ ma_hoc_ky: "", ten_hoc_ky: "", nam_hoc: "", da_khoa: 0 });
      setEditing(null);
      fetchHocKy();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Lỗi khi lưu học kỳ!");
    }
  };

  // ✏️ Sửa
  const handleEdit = (item) => {
    setEditing(item.ma_hoc_ky);
    setForm({
      ma_hoc_ky: item.ma_hoc_ky,
      ten_hoc_ky: item.ten_hoc_ky,
      nam_hoc: item.nam_hoc,
      da_khoa: item.da_khoa,
    });
  };

  // 🗑️ Xóa
  const handleDelete = async (ma_hoc_ky) => {
    if (!window.confirm("Bạn có chắc muốn xóa học kỳ này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/hocky/${ma_hoc_ky}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa học kỳ!");
      fetchHocKy();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi xóa học kỳ!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>📅 Quản lý học kỳ</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm mã, tên hoặc năm học..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm / sửa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa học kỳ" : "➕ Thêm học kỳ mới"}</h3>
        {!editing && (
          <input
            type="text"
            placeholder="Mã học kỳ"
            value={form.ma_hoc_ky}
            onChange={(e) => setForm({ ...form, ma_hoc_ky: e.target.value })}
          />
        )}
        <input
          type="text"
          placeholder="Tên học kỳ (VD: Học kỳ 1)"
          value={form.ten_hoc_ky}
          onChange={(e) => setForm({ ...form, ten_hoc_ky: e.target.value })}
        />
        <input
          type="text"
          placeholder="Năm học (VD: 2025–2026)"
          value={form.nam_hoc}
          onChange={(e) => setForm({ ...form, nam_hoc: e.target.value })}
        />
        <select
          value={form.da_khoa}
          onChange={(e) =>
            setForm({ ...form, da_khoa: Number(e.target.value) })
          }
        >
          <option value={0}>Đang mở</option>
          <option value={1}>Đã khóa</option>
        </select>
        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({ ma_hoc_ky: "", ten_hoc_ky: "", nam_hoc: "", da_khoa: 0 });
            }}
          >
            Hủy
          </button>
        )}
      </form>

      {/* 📋 Bảng danh sách */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã học kỳ</th>
                <th>Tên học kỳ</th>
                <th>Năm học</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {hocKyList.length === 0 ? (
                <tr>
                  <td colSpan="5">Không có dữ liệu</td>
                </tr>
              ) : (
                hocKyList.map((item) => (
                  <tr key={item.ma_hoc_ky}>
                    <td>{item.ma_hoc_ky}</td>
                    <td>{item.ten_hoc_ky}</td>
                    <td>{item.nam_hoc}</td>
                    <td>{item.da_khoa ? "Đã khóa" : "Đang mở"}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.ma_hoc_ky)}>🗑️</button>
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

export default HocKyManager;
