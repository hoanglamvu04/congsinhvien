import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KhaoSatManager = () => {
  const [khaoSatList, setKhaoSatList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tieu_de: "",
    noi_dung: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    doi_tuong: "tatca",
    trang_thai: "dang_mo",
  });
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách khảo sát
  const fetchKhaoSat = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/khaosat`, {
        headers: { Authorization: `Bearer ${token}` },
        params: keyword ? { q: keyword } : {},
      });
      setKhaoSatList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải danh sách khảo sát!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhaoSat();
  }, []);

  useEffect(() => {
    fetchKhaoSat();
  }, [keyword]);

  // ➕ Thêm / sửa khảo sát
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc } = form;
    if (!tieu_de || !noi_dung || !ngay_bat_dau || !ngay_ket_thuc)
      return alert("⚠️ Vui lòng nhập đủ thông tin bắt buộc!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/khaosat/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật khảo sát thành công!");
      } else {
        await axios.post(`${API_URL}/api/khaosat`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm khảo sát thành công!");
      }

      setForm({
        tieu_de: "",
        noi_dung: "",
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
        doi_tuong: "tatca",
        trang_thai: "dang_mo",
      });
      setEditing(null);
      fetchKhaoSat();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Lỗi khi lưu khảo sát!");
    }
  };

  // ✏️ Chọn để sửa
  const handleEdit = (item) => {
    setEditing(item.id_khao_sat);
    setForm({
      tieu_de: item.tieu_de,
      noi_dung: item.noi_dung,
      ngay_bat_dau: item.ngay_bat_dau?.slice(0, 10) || "",
      ngay_ket_thuc: item.ngay_ket_thuc?.slice(0, 10) || "",
      doi_tuong: item.doi_tuong,
      trang_thai: item.trang_thai,
    });
  };

  // 🗑️ Xóa khảo sát
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khảo sát này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/khaosat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa khảo sát!");
      fetchKhaoSat();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa khảo sát!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>📝 Quản lý khảo sát</h1>

      {/* 🔍 Tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề, nội dung hoặc trạng thái..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm / sửa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa khảo sát" : "➕ Thêm khảo sát"}</h3>

        <input
          type="text"
          placeholder="Tiêu đề"
          value={form.tieu_de}
          onChange={(e) => setForm({ ...form, tieu_de: e.target.value })}
        />
        <textarea
          placeholder="Nội dung khảo sát"
          value={form.noi_dung}
          onChange={(e) => setForm({ ...form, noi_dung: e.target.value })}
        />
        <div className="date-group">
          <input
            type="date"
            value={form.ngay_bat_dau}
            onChange={(e) => setForm({ ...form, ngay_bat_dau: e.target.value })}
          />
          <input
            type="date"
            value={form.ngay_ket_thuc}
            onChange={(e) => setForm({ ...form, ngay_ket_thuc: e.target.value })}
          />
        </div>
        <select
          value={form.doi_tuong}
          onChange={(e) => setForm({ ...form, doi_tuong: e.target.value })}
        >
          <option value="tatca">Tất cả</option>
          <option value="sinhvien">Sinh viên</option>
          <option value="giangvien">Giảng viên</option>
        </select>
        <select
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        >
          <option value="dang_mo">Đang mở</option>
          <option value="dong">Đã đóng</option>
        </select>

        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                tieu_de: "",
                noi_dung: "",
                ngay_bat_dau: "",
                ngay_ket_thuc: "",
                doi_tuong: "tatca",
                trang_thai: "dang_mo",
              });
            }}
          >
            Hủy
          </button>
        )}
      </form>

      {/* 📋 Danh sách */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Đối tượng</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {khaoSatList.length === 0 ? (
                <tr>
                  <td colSpan="7">Không có dữ liệu</td>
                </tr>
              ) : (
                khaoSatList.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.id_khao_sat}</td>
                    <td>{item.tieu_de}</td>
                    <td>{item.doi_tuong}</td>
                    <td>{new Date(item.ngay_bat_dau).toLocaleDateString("vi-VN")}</td>
                    <td>{new Date(item.ngay_ket_thuc).toLocaleDateString("vi-VN")}</td>
                    <td>{item.trang_thai}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.id_khao_sat)}>🗑️</button>
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

export default KhaoSatManager;
