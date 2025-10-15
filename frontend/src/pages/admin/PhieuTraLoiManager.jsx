import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PhieuTraLoiManager = () => {
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id_khao_sat: "",
    ma_sinh_vien: "",
    diem_danh_gia: "",
    noi_dung_phan_hoi: "",
    an_danh: 0,
  });
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách phiếu trả lời
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/phieutraloi`, {
        headers: { Authorization: `Bearer ${token}` },
        params: keyword ? { q: keyword } : {},
      });
      setList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [keyword]);

  // ➕ Thêm hoặc sửa phiếu trả lời (Admin)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_khao_sat || !form.ma_sinh_vien || !form.diem_danh_gia)
      return alert("⚠️ Nhập đầy đủ mã khảo sát, mã sinh viên và điểm đánh giá!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/phieutraloi/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật phản hồi thành công!");
      } else {
        await axios.post(`${API_URL}/api/phieutraloi/admin`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm phản hồi thành công!");
      }

      setForm({
        id_khao_sat: "",
        ma_sinh_vien: "",
        diem_danh_gia: "",
        noi_dung_phan_hoi: "",
        an_danh: 0,
      });
      setEditing(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Lỗi khi lưu phản hồi!");
    }
  };

  // ✏️ Chọn để sửa
  const handleEdit = (item) => {
    setEditing(item.id_tra_loi);
    setForm({
      id_khao_sat: item.id_khao_sat,
      ma_sinh_vien: item.ma_sinh_vien,
      diem_danh_gia: item.diem_danh_gia,
      noi_dung_phan_hoi: item.noi_dung_phan_hoi || "",
      an_danh: item.an_danh,
    });
  };

  // 🗑️ Xóa phản hồi
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phản hồi này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/phieutraloi/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa phản hồi!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa phản hồi!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>📋 Quản lý phiếu trả lời khảo sát</h1>

      {/* 🔍 Tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề hoặc sinh viên..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm/sửa phản hồi */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa phản hồi" : "➕ Thêm phản hồi mới"}</h3>

        <input
          type="text"
          placeholder="ID khảo sát"
          value={form.id_khao_sat}
          onChange={(e) => setForm({ ...form, id_khao_sat: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mã sinh viên"
          value={form.ma_sinh_vien}
          onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
        />
        <input
          type="number"
          placeholder="Điểm đánh giá (1-5)"
          value={form.diem_danh_gia}
          onChange={(e) => setForm({ ...form, diem_danh_gia: e.target.value })}
        />
        <textarea
          placeholder="Nội dung phản hồi"
          value={form.noi_dung_phan_hoi}
          onChange={(e) => setForm({ ...form, noi_dung_phan_hoi: e.target.value })}
        />
        <select
          value={form.an_danh}
          onChange={(e) => setForm({ ...form, an_danh: e.target.value })}
        >
          <option value={0}>Hiện tên</option>
          <option value={1}>Ẩn danh</option>
        </select>

        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                id_khao_sat: "",
                ma_sinh_vien: "",
                diem_danh_gia: "",
                noi_dung_phan_hoi: "",
                an_danh: 0,
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
                <th>ID khảo sát</th>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Điểm</th>
                <th>Phản hồi</th>
                <th>Ẩn danh</th>
                <th>Ngày trả lời</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="9">Không có dữ liệu</td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id_tra_loi}>
                    <td>{item.id_tra_loi}</td>
                    <td>{item.id_khao_sat}</td>
                    <td>{item.ma_sinh_vien}</td>
                    <td>{item.ho_ten}</td>
                    <td>{item.diem_danh_gia}⭐</td>
                    <td>{item.noi_dung_phan_hoi || "—"}</td>
                    <td>{item.an_danh ? "Ẩn danh" : "Hiện tên"}</td>
                    <td>
                      {new Date(item.ngay_tra_loi).toLocaleString("vi-VN", {
                        hour12: false,
                      })}
                    </td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.id_tra_loi)}>🗑️</button>
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

export default PhieuTraLoiManager;
