import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LopManager = () => {
  const [lopList, setLopList] = useState([]);
  const [nganhList, setNganhList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ma_lop: "",
    ten_lop: "",
    ma_nganh: "",
    khoa_hoc: "",
    co_van: "",
    trang_thai: "hoatdong",
  });
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách lớp
  const fetchLop = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/lop`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: keyword },
      });
      setLopList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách lớp!");
    } finally {
      setLoading(false);
    }
  };

  // 📚 Lấy danh sách ngành
  const fetchNganh = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/nganh`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNganhList(res.data.data || res.data);
    } catch {
      console.warn("Không thể tải danh sách ngành");
    }
  };

  useEffect(() => {
    fetchNganh();
    fetchLop();
  }, [keyword]);

  // ➕ Thêm / sửa lớp
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_lop || !form.ten_lop || !form.ma_nganh)
      return alert("Điền đủ Mã lớp, Tên lớp, Mã ngành!");
    try {
      if (editing) {
        await axios.put(`${API_URL}/api/lop/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật lớp thành công!");
      } else {
        await axios.post(`${API_URL}/api/lop`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm lớp thành công!");
      }
      setForm({
        ma_lop: "",
        ten_lop: "",
        ma_nganh: "",
        khoa_hoc: "",
        co_van: "",
        trang_thai: "hoatdong",
      });
      setEditing(null);
      fetchLop();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Lỗi khi lưu lớp!");
    }
  };

  // ✏️ Sửa lớp
  const handleEdit = (item) => {
    setEditing(item.ma_lop);
    setForm({
      ma_lop: item.ma_lop,
      ten_lop: item.ten_lop,
      ma_nganh: item.ma_nganh,
      khoa_hoc: item.khoa_hoc || "",
      co_van: item.co_van || "",
      trang_thai: item.trang_thai || "hoatdong",
    });
  };

  // 🗑️ Xóa lớp
  const handleDelete = async (ma_lop) => {
    if (!window.confirm("Bạn có chắc muốn xóa lớp này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/lop/${ma_lop}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa lớp!");
      fetchLop();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi xóa lớp!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>🏫 Quản lý lớp</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm mã lớp, tên lớp, ngành..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm / sửa lớp */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa lớp" : "➕ Thêm lớp mới"}</h3>
        {!editing && (
          <input
            type="text"
            placeholder="Mã lớp"
            value={form.ma_lop}
            onChange={(e) => setForm({ ...form, ma_lop: e.target.value })}
          />
        )}
        <input
          type="text"
          placeholder="Tên lớp"
          value={form.ten_lop}
          onChange={(e) => setForm({ ...form, ten_lop: e.target.value })}
        />
        <select
          value={form.ma_nganh}
          onChange={(e) => setForm({ ...form, ma_nganh: e.target.value })}
        >
          <option value="">-- Chọn ngành --</option>
          {nganhList.map((n) => (
            <option key={n.ma_nganh} value={n.ma_nganh}>
              {n.ten_nganh}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Khóa học (VD: 2021–2025)"
          value={form.khoa_hoc}
          onChange={(e) => setForm({ ...form, khoa_hoc: e.target.value })}
        />
        <input
          type="text"
          placeholder="Cố vấn học tập"
          value={form.co_van}
          onChange={(e) => setForm({ ...form, co_van: e.target.value })}
        />
        <select
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        >
          <option value="hoatdong">Hoạt động</option>
          <option value="khoa">Khóa</option>
        </select>
        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                ma_lop: "",
                ten_lop: "",
                ma_nganh: "",
                khoa_hoc: "",
                co_van: "",
                trang_thai: "hoatdong",
              });
            }}
          >
            Hủy
          </button>
        )}
      </form>

      {/* 📋 Bảng danh sách lớp */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã lớp</th>
                <th>Tên lớp</th>
                <th>Ngành</th>
                <th>Khóa học</th>
                <th>Cố vấn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {lopList.length === 0 ? (
                <tr>
                  <td colSpan="7">Không có dữ liệu</td>
                </tr>
              ) : (
                lopList.map((item) => (
                  <tr key={item.ma_lop}>
                    <td>{item.ma_lop}</td>
                    <td>{item.ten_lop}</td>
                    <td>{item.ten_nganh || "—"}</td>
                    <td>{item.khoa_hoc || "—"}</td>
                    <td>{item.co_van || "—"}</td>
                    <td>{item.trang_thai === "hoatdong" ? "Hoạt động" : "Khóa"}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.ma_lop)}>🗑️</button>
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

export default LopManager;
