import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GiangVienManager = () => {
  const [giangVienList, setGiangVienList] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ma_giang_vien: "",
    ho_ten: "",
    hoc_vi: "",
    chuc_vu: "",
    ma_khoa: "",
    email: "",
    dien_thoai: "",
    anh_dai_dien: "",
  });
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách giảng viên
  const fetchGiangVien = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/giangvien`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: keyword },
      });
      setGiangVienList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách giảng viên!");
    } finally {
      setLoading(false);
    }
  };

  // 📚 Lấy danh sách khoa
  const fetchKhoa = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/khoa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKhoaList(res.data.data || res.data);
    } catch {
      console.warn("Không thể tải danh sách khoa");
    }
  };

  useEffect(() => {
    fetchKhoa();
    fetchGiangVien();
  }, [keyword]);

  // ➕ Thêm / sửa giảng viên
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_giang_vien || !form.ho_ten || !form.ma_khoa)
      return alert("Điền đủ Mã giảng viên, Họ tên, Khoa!");
    try {
      if (editing) {
        await axios.put(`${API_URL}/api/giangvien/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật giảng viên thành công!");
      } else {
        await axios.post(`${API_URL}/api/giangvien`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm giảng viên thành công!");
      }
      setForm({
        ma_giang_vien: "",
        ho_ten: "",
        hoc_vi: "",
        chuc_vu: "",
        ma_khoa: "",
        email: "",
        dien_thoai: "",
        anh_dai_dien: "",
      });
      setEditing(null);
      fetchGiangVien();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Lỗi khi lưu giảng viên!");
    }
  };

  // ✏️ Sửa
  const handleEdit = (item) => {
    setEditing(item.ma_giang_vien);
    setForm({
      ma_giang_vien: item.ma_giang_vien,
      ho_ten: item.ho_ten,
      hoc_vi: item.hoc_vi || "",
      chuc_vu: item.chuc_vu || "",
      ma_khoa: item.ma_khoa || "",
      email: item.email || "",
      dien_thoai: item.dien_thoai || "",
      anh_dai_dien: item.anh_dai_dien || "",
    });
  };

  // 🗑️ Xóa
  const handleDelete = async (ma_giang_vien) => {
    if (!window.confirm("Bạn có chắc muốn xóa giảng viên này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/giangvien/${ma_giang_vien}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa giảng viên!");
      fetchGiangVien();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi xóa giảng viên!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>👨‍🏫 Quản lý giảng viên</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo mã, tên, khoa, chức vụ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm / sửa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa giảng viên" : "➕ Thêm giảng viên mới"}</h3>
        {!editing && (
          <input
            type="text"
            placeholder="Mã giảng viên"
            value={form.ma_giang_vien}
            onChange={(e) => setForm({ ...form, ma_giang_vien: e.target.value })}
          />
        )}
        <input
          type="text"
          placeholder="Họ tên"
          value={form.ho_ten}
          onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
        />
        <input
          type="text"
          placeholder="Học vị (ThS, TS, PGS, GS...)"
          value={form.hoc_vi}
          onChange={(e) => setForm({ ...form, hoc_vi: e.target.value })}
        />
        <input
          type="text"
          placeholder="Chức vụ"
          value={form.chuc_vu}
          onChange={(e) => setForm({ ...form, chuc_vu: e.target.value })}
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
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={form.dien_thoai}
          onChange={(e) => setForm({ ...form, dien_thoai: e.target.value })}
        />
        <input
          type="text"
          placeholder="Ảnh đại diện (URL)"
          value={form.anh_dai_dien}
          onChange={(e) => setForm({ ...form, anh_dai_dien: e.target.value })}
        />
        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                ma_giang_vien: "",
                ho_ten: "",
                hoc_vi: "",
                chuc_vu: "",
                ma_khoa: "",
                email: "",
                dien_thoai: "",
                anh_dai_dien: "",
              });
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
                <th>Mã GV</th>
                <th>Họ tên</th>
                <th>Học vị</th>
                <th>Chức vụ</th>
                <th>Khoa</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {giangVienList.length === 0 ? (
                <tr>
                  <td colSpan="8">Không có dữ liệu</td>
                </tr>
              ) : (
                giangVienList.map((gv) => (
                  <tr key={gv.ma_giang_vien}>
                    <td>{gv.ma_giang_vien}</td>
                    <td>{gv.ho_ten}</td>
                    <td>{gv.hoc_vi || "—"}</td>
                    <td>{gv.chuc_vu || "—"}</td>
                    <td>{gv.ten_khoa || "—"}</td>
                    <td>{gv.email || "—"}</td>
                    <td>{gv.dien_thoai || "—"}</td>
                    <td>
                      <button onClick={() => handleEdit(gv)}>✏️</button>
                      <button onClick={() => handleDelete(gv.ma_giang_vien)}>🗑️</button>
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

export default GiangVienManager;
