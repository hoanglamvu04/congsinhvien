import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KyLuatManager = () => {
  const [kyLuatList, setKyLuatList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ma_sinh_vien: "",
    ngay_quyet_dinh: "",
    hinh_thuc: "",
    ly_do: "",
    nguoi_ra_quyet_dinh: "",
  });
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách kỷ luật
  const fetchKyLuat = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/kyluat`, {
        headers: { Authorization: `Bearer ${token}` },
        params: keyword ? { q: keyword } : {},
      });
      setKyLuatList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải danh sách kỷ luật!");
    } finally {
      setLoading(false);
    }
  };

  // 🧭 Load dữ liệu ban đầu & khi tìm kiếm
  useEffect(() => {
    fetchKyLuat();
  }, []);

  useEffect(() => {
    fetchKyLuat();
  }, [keyword]);

  // ➕ Thêm hoặc sửa kỷ luật
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ma_sinh_vien, ngay_quyet_dinh, hinh_thuc } = form;
    if (!ma_sinh_vien || !ngay_quyet_dinh || !hinh_thuc)
      return alert("⚠️ Vui lòng nhập đủ thông tin bắt buộc!");

    try {
      if (editing) {
        await axios.put(
          `${API_URL}/api/kyluat/${editing}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("✅ Cập nhật kỷ luật thành công!");
      } else {
        await axios.post(`${API_URL}/api/kyluat`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm kỷ luật thành công!");
      }

      setForm({
        ma_sinh_vien: "",
        ngay_quyet_dinh: "",
        hinh_thuc: "",
        ly_do: "",
        nguoi_ra_quyet_dinh: "",
      });
      setEditing(null);
      fetchKyLuat();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Lỗi khi lưu kỷ luật!");
    }
  };

  // ✏️ Chọn để sửa
  const handleEdit = (item) => {
    setEditing(item.id_ky_luat);
    setForm({
      ma_sinh_vien: item.ma_sinh_vien,
      ngay_quyet_dinh: item.ngay_quyet_dinh?.slice(0, 10) || "",
      hinh_thuc: item.hinh_thuc || "",
      ly_do: item.ly_do || "",
      nguoi_ra_quyet_dinh: item.nguoi_ra_quyet_dinh || "",
    });
  };

  // 🗑️ Xóa kỷ luật
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa kỷ luật này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/kyluat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa kỷ luật!");
      fetchKyLuat();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa kỷ luật!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>⚖️ Quản lý kỷ luật</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo mã SV, hình thức, lý do..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm/sửa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa kỷ luật" : "➕ Thêm kỷ luật"}</h3>

        <input
          type="text"
          placeholder="Mã sinh viên"
          value={form.ma_sinh_vien}
          onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
          disabled={!!editing}
        />
        <input
          type="date"
          placeholder="Ngày quyết định"
          value={form.ngay_quyet_dinh}
          onChange={(e) => setForm({ ...form, ngay_quyet_dinh: e.target.value })}
        />
        <input
          type="text"
          placeholder="Hình thức kỷ luật"
          value={form.hinh_thuc}
          onChange={(e) => setForm({ ...form, hinh_thuc: e.target.value })}
        />
        <input
          type="text"
          placeholder="Lý do"
          value={form.ly_do}
          onChange={(e) => setForm({ ...form, ly_do: e.target.value })}
        />
        <input
          type="text"
          placeholder="Người ra quyết định"
          value={form.nguoi_ra_quyet_dinh}
          onChange={(e) =>
            setForm({ ...form, nguoi_ra_quyet_dinh: e.target.value })
          }
        />

        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                ma_sinh_vien: "",
                ngay_quyet_dinh: "",
                hinh_thuc: "",
                ly_do: "",
                nguoi_ra_quyet_dinh: "",
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
                <th>ID</th>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Ngày QĐ</th>
                <th>Hình thức</th>
                <th>Lý do</th>
                <th>Người ra QĐ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {kyLuatList.length === 0 ? (
                <tr>
                  <td colSpan="8">Không có dữ liệu</td>
                </tr>
              ) : (
                kyLuatList.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.id_ky_luat}</td>
                    <td>{item.ma_sinh_vien}</td>
                    <td>{item.ho_ten || "—"}</td>
                    <td>
                      {new Date(item.ngay_quyet_dinh).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{item.hinh_thuc}</td>
                    <td>{item.ly_do}</td>
                    <td>{item.nguoi_ra_quyet_dinh}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.id_ky_luat)}>
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

export default KyLuatManager;
