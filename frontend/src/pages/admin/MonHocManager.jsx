import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const MonHocManager = () => {
  const [monHocList, setMonHocList] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ma_mon: "",
    ten_mon: "",
    ma_khoa: "",
    loai_mon: "",
    so_tin_chi: "",
    don_gia_tin_chi: "",
    hoc_phan_tien_quyet: "",
    chi_nganh: 0,
    mo_ta: "",
  });
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách môn học
  const fetchMonHoc = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/monhoc`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: keyword },
      });
      setMonHocList(res.data.data || res.data);
    } catch (err) {
      alert("Lỗi khi tải danh sách môn học!");
    } finally {
      setLoading(false);
    }
  };

const fetchKhoa = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/khoa`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // ✅ Đảm bảo luôn là mảng
    const data = Array.isArray(res.data) ? res.data : res.data.data || [];
    setKhoaList(data);
  } catch (err) {
    console.error("Lỗi tải danh sách khoa:", err);
    setKhoaList([]);
  }
};


  useEffect(() => {
    fetchMonHoc();
    fetchKhoa();
  }, [keyword]);

  // ➕ Thêm / Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_mon || !form.ten_mon) return alert("Điền đủ Mã và Tên môn học!");
    try {
      if (editing) {
        await axios.put(`${API_URL}/api/monhoc/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật môn học thành công!");
      } else {
        await axios.post(`${API_URL}/api/monhoc`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm môn học thành công!");
      }
      setForm({
        ma_mon: "",
        ten_mon: "",
        ma_khoa: "",
        loai_mon: "",
        so_tin_chi: "",
        don_gia_tin_chi: "",
        hoc_phan_tien_quyet: "",
        chi_nganh: 0,
        mo_ta: "",
      });
      setEditing(null);
      fetchMonHoc();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi lưu môn học!");
    }
  };

  // ✏️ Sửa
  const handleEdit = (item) => {
    setEditing(item.ma_mon);
    setForm({ ...item });
  };

  // 🗑️ Xóa
  const handleDelete = async (ma_mon) => {
    if (!window.confirm("Bạn có chắc muốn xóa môn học này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/monhoc/${ma_mon}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa môn học!");
      fetchMonHoc();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi xóa môn học!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>📘 Quản lý môn học</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm mã, tên môn hoặc khoa..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm / sửa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa môn học" : "➕ Thêm môn học mới"}</h3>
        {!editing && (
          <input
            type="text"
            placeholder="Mã môn"
            value={form.ma_mon}
            onChange={(e) => setForm({ ...form, ma_mon: e.target.value })}
          />
        )}
        <input
          type="text"
          placeholder="Tên môn học"
          value={form.ten_mon}
          onChange={(e) => setForm({ ...form, ten_mon: e.target.value })}
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
          placeholder="Loại môn (bắt buộc / tự chọn)"
          value={form.loai_mon}
          onChange={(e) => setForm({ ...form, loai_mon: e.target.value })}
        />
        <input
          type="number"
          placeholder="Số tín chỉ"
          value={form.so_tin_chi}
          onChange={(e) => setForm({ ...form, so_tin_chi: e.target.value })}
        />
        <input
          type="number"
          placeholder="Đơn giá / tín chỉ"
          value={form.don_gia_tin_chi}
          onChange={(e) => setForm({ ...form, don_gia_tin_chi: e.target.value })}
        />
        <input
          type="text"
          placeholder="Học phần tiên quyết"
          value={form.hoc_phan_tien_quyet}
          onChange={(e) => setForm({ ...form, hoc_phan_tien_quyet: e.target.value })}
        />
        <select
          value={form.chi_nganh}
          onChange={(e) => setForm({ ...form, chi_nganh: Number(e.target.value) })}
        >
          <option value={0}>Chung</option>
          <option value={1}>Chuyên ngành</option>
        </select>
        <input
          type="text"
          placeholder="Mô tả"
          value={form.mo_ta}
          onChange={(e) => setForm({ ...form, mo_ta: e.target.value })}
        />
        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button type="button" onClick={() => setEditing(null)}>
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
                <th>Mã môn</th>
                <th>Tên môn</th>
                <th>Khoa</th>
                <th>Số tín chỉ</th>
                <th>Loại môn</th>
                <th>Học phần tiên quyết</th>
                <th>Chi ngành</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {monHocList.length === 0 ? (
                <tr>
                  <td colSpan="9">Không có dữ liệu</td>
                </tr>
              ) : (
                monHocList.map((item) => (
                  <tr key={item.ma_mon}>
                    <td>{item.ma_mon}</td>
                    <td>{item.ten_mon}</td>
                    <td>{item.ten_khoa}</td>
                    <td>{item.so_tin_chi}</td>
                    <td>{item.loai_mon}</td>
                    <td>{item.hoc_phan_tien_quyet || "-"}</td>
                    <td>{item.chi_nganh ? "Chuyên ngành" : "Chung"}</td>
                    <td>{item.mo_ta || "-"}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.ma_mon)}>🗑️</button>
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

export default MonHocManager;
