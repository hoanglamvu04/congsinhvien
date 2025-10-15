import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const HocPhiManager = () => {
  const [hocPhiList, setHocPhiList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ma_sinh_vien: "",
    ma_hoc_ky: "",
    tong_tien_phai_nop: "",
    tong_tien_da_nop: "",
    con_no: "",
    trang_thai: "",
  });
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách học phí
  const fetchHocPhi = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/hocphi`, {
        headers: { Authorization: `Bearer ${token}` },
        params: keyword ? { q: keyword } : {},
      });
      setHocPhiList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải danh sách học phí!");
    } finally {
      setLoading(false);
    }
  };

  // 🧭 Load dữ liệu ban đầu và khi tìm kiếm
  useEffect(() => {
    fetchHocPhi();
  }, []);

  useEffect(() => {
    fetchHocPhi();
  }, [keyword]);

  // ➕ Thêm hoặc sửa học phí
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ma_sinh_vien, ma_hoc_ky } = form;
    if (!ma_sinh_vien || !ma_hoc_ky)
      return alert("⚠️ Vui lòng nhập đủ Mã sinh viên và Mã học kỳ!");

    try {
      if (editing) {
        // ✏️ Cập nhật
        await axios.put(
          `${API_URL}/api/hocphi/${ma_sinh_vien}/${ma_hoc_ky}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("✅ Cập nhật học phí thành công!");
      } else {
        // ➕ Thêm mới
        await axios.post(`${API_URL}/api/hocphi`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm học phí thành công!");
      }

      setForm({
        ma_sinh_vien: "",
        ma_hoc_ky: "",
        tong_tien_phai_nop: "",
        tong_tien_da_nop: "",
        con_no: "",
        trang_thai: "",
      });
      setEditing(null);
      fetchHocPhi();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Lỗi khi lưu học phí!");
    }
  };

  // ✏️ Sửa
  const handleEdit = (item) => {
    setEditing(true);
    setForm({
      ma_sinh_vien: item.ma_sinh_vien,
      ma_hoc_ky: item.ma_hoc_ky,
      tong_tien_phai_nop: item.tong_tien_phai_nop || "",
      tong_tien_da_nop: item.tong_tien_da_nop || "",
      con_no: item.con_no || "",
      trang_thai: item.trang_thai || "",
    });
  };

  // 🗑️ Xóa
  const handleDelete = async (item) => {
    if (!window.confirm("Bạn có chắc muốn xóa học phí của sinh viên này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/hocphi/${item.ma_sinh_vien}/${item.ma_hoc_ky}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa bản ghi học phí!");
      fetchHocPhi();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa học phí!");
    }
  };

  // 💰 Format tiền VND
  const formatCurrency = (num) => {
    if (!num) return "0";
    return Number(num).toLocaleString("vi-VN");
  };

  return (
    <div className="admin-dashboard">
      <h1>💰 Quản lý học phí</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Nhập mã sinh viên, học kỳ hoặc trạng thái..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm/sửa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa học phí" : "➕ Thêm học phí"}</h3>

        <input
          type="text"
          placeholder="Mã sinh viên"
          value={form.ma_sinh_vien}
          onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
          disabled={editing}
        />
        <input
          type="text"
          placeholder="Mã học kỳ"
          value={form.ma_hoc_ky}
          onChange={(e) => setForm({ ...form, ma_hoc_ky: e.target.value })}
          disabled={editing}
        />
        <input
          type="number"
          placeholder="Tổng tiền phải nộp"
          value={form.tong_tien_phai_nop}
          onChange={(e) => setForm({ ...form, tong_tien_phai_nop: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tổng tiền đã nộp"
          value={form.tong_tien_da_nop}
          onChange={(e) => setForm({ ...form, tong_tien_da_nop: e.target.value })}
        />
        <input
          type="number"
          placeholder="Còn nợ"
          value={form.con_no}
          onChange={(e) => setForm({ ...form, con_no: e.target.value })}
        />
        <input
          type="text"
          placeholder="Trạng thái (ví dụ: chuanop / danop)"
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        />

        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                ma_sinh_vien: "",
                ma_hoc_ky: "",
                tong_tien_phai_nop: "",
                tong_tien_da_nop: "",
                con_no: "",
                trang_thai: "",
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
                <th>Mã SV</th>
                <th>Học kỳ</th>
                <th>Tổng phải nộp</th>
                <th>Đã nộp</th>
                <th>Còn nợ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {hocPhiList.length === 0 ? (
                <tr>
                  <td colSpan="7">Không có dữ liệu</td>
                </tr>
              ) : (
                hocPhiList.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.ma_sinh_vien}</td>
                    <td>{item.ten_hoc_ky}</td>
                    <td>{formatCurrency(item.tong_tien_phai_nop)}</td>
                    <td>{formatCurrency(item.tong_tien_da_nop)}</td>
                    <td>{formatCurrency(item.con_no)}</td>
                    <td>{item.trang_thai}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item)}>🗑️</button>
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

export default HocPhiManager;
