import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LopHocPhanManager = () => {
  const [lopHocPhanList, setLopHocPhanList] = useState([]);
  const [monList, setMonList] = useState([]);
  const [gvList, setGvList] = useState([]);
  const [hocKyList, setHocKyList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    ma_lop_hp: "",
    ma_mon: "",
    ma_giang_vien: "",
    ma_hoc_ky: "",
    phong_hoc: "",
    lich_hoc: "",
    gioi_han_dang_ky: "",
    trang_thai: "dangmo",
  });

  // 🔄 Lấy danh sách liên quan
  const fetchData = async () => {
    try {
      setLoading(true);
      const [lhpRes, monRes, gvRes, hkRes] = await Promise.all([
        axios.get(`${API_URL}/api/lophocphan`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: keyword },
        }),
        axios.get(`${API_URL}/api/monhoc`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/giangvien`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/hocky`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setLopHocPhanList(lhpRes.data.data || lhpRes.data);
      setMonList(Array.isArray(monRes.data) ? monRes.data : monRes.data.data || []);
      setGvList(Array.isArray(gvRes.data) ? gvRes.data : gvRes.data.data || []);
      setHocKyList(Array.isArray(hkRes.data) ? hkRes.data : hkRes.data.data || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [keyword]);

  // ➕ Thêm / sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_lop_hp || !form.ma_mon || !form.ma_hoc_ky)
      return alert("Điền đầy đủ Mã lớp, Môn và Học kỳ!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/lophocphan/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật thành công!");
      } else {
        await axios.post(`${API_URL}/api/lophocphan`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm lớp học phần thành công!");
      }
      setEditing(null);
      setForm({
        ma_lop_hp: "",
        ma_mon: "",
        ma_giang_vien: "",
        ma_hoc_ky: "",
        phong_hoc: "",
        lich_hoc: "",
        gioi_han_dang_ky: "",
        trang_thai: "dangmo",
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Lỗi khi lưu lớp học phần!");
    }
  };

  // ✏️ Sửa
  const handleEdit = (item) => {
    setEditing(item.ma_lop_hp);
    setForm({ ...item });
  };

  // 🗑️ Xóa
  const handleDelete = async (ma_lop_hp) => {
    if (!window.confirm("Bạn có chắc muốn xóa lớp học phần này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/lophocphan/${ma_lop_hp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi xóa!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>🏫 Quản lý lớp học phần</h1>

      {/* 🔍 Tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm mã lớp, môn, giảng viên, học kỳ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa lớp học phần" : "➕ Thêm lớp học phần mới"}</h3>
        {!editing && (
          <input
            type="text"
            placeholder="Mã lớp học phần"
            value={form.ma_lop_hp}
            onChange={(e) => setForm({ ...form, ma_lop_hp: e.target.value })}
          />
        )}
        <select
          value={form.ma_mon}
          onChange={(e) => setForm({ ...form, ma_mon: e.target.value })}
        >
          <option value="">-- Chọn môn học --</option>
          {monList.map((m) => (
            <option key={m.ma_mon} value={m.ma_mon}>
              {m.ten_mon}
            </option>
          ))}
        </select>
        <select
          value={form.ma_giang_vien}
          onChange={(e) => setForm({ ...form, ma_giang_vien: e.target.value })}
        >
          <option value="">-- Chọn giảng viên --</option>
          {gvList.map((g) => (
            <option key={g.ma_giang_vien} value={g.ma_giang_vien}>
              {g.ho_ten}
            </option>
          ))}
        </select>
        <select
          value={form.ma_hoc_ky}
          onChange={(e) => setForm({ ...form, ma_hoc_ky: e.target.value })}
        >
          <option value="">-- Chọn học kỳ --</option>
          {hocKyList.map((h) => (
            <option key={h.ma_hoc_ky} value={h.ma_hoc_ky}>
              {h.ten_hoc_ky}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Phòng học"
          value={form.phong_hoc}
          onChange={(e) => setForm({ ...form, phong_hoc: e.target.value })}
        />
        <input
          type="text"
          placeholder="Lịch học"
          value={form.lich_hoc}
          onChange={(e) => setForm({ ...form, lich_hoc: e.target.value })}
        />
        <input
          type="number"
          placeholder="Giới hạn đăng ký"
          value={form.gioi_han_dang_ky}
          onChange={(e) => setForm({ ...form, gioi_han_dang_ky: e.target.value })}
        />
        <select
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        >
          <option value="dangmo">Đang mở</option>
          <option value="dong">Đóng</option>
        </select>
        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button type="button" onClick={() => setEditing(null)}>
            Hủy
          </button>
        )}
      </form>

      {/* 📋 Bảng */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã lớp HP</th>
                <th>Môn học</th>
                <th>Giảng viên</th>
                <th>Học kỳ</th>
                <th>Phòng học</th>
                <th>Lịch học</th>
                <th>Giới hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {lopHocPhanList.length === 0 ? (
                <tr>
                  <td colSpan="9">Không có dữ liệu</td>
                </tr>
              ) : (
                lopHocPhanList.map((item) => (
                  <tr key={item.ma_lop_hp}>
                    <td>{item.ma_lop_hp}</td>
                    <td>{item.ten_mon}</td>
                    <td>{item.ten_giang_vien || "-"}</td>
                    <td>{item.ten_hoc_ky}</td>
                    <td>{item.phong_hoc || "-"}</td>
                    <td>{item.lich_hoc || "-"}</td>
                    <td>{item.gioi_han_dang_ky}</td>
                    <td>{item.trang_thai === "dangmo" ? "Đang mở" : "Đóng"}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.ma_lop_hp)}>🗑️</button>
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

export default LopHocPhanManager;
