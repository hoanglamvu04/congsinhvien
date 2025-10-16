import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SinhVienManager = () => {
  const [sinhViens, setSinhViens] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({
    ma_sinh_vien: "",
    ho_ten: "",
    ngay_sinh: "",
    gioi_tinh: "",
    ma_lop: "",
    ma_nganh: "",
    ma_khoa: "",
    dia_chi: "",
    dien_thoai: "",
    email: "",
    trang_thai_hoc_tap: "danghoc",
  });

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sinhvien`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSinhViens(res.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải danh sách sinh viên!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!form.ma_sinh_vien) return alert("Vui lòng nhập mã sinh viên!");

      await axios.post(`${API_URL}/api/sinhvien`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Thêm sinh viên thành công!");
      fetchData();
      setForm({
        ma_sinh_vien: "",
        ho_ten: "",
        ngay_sinh: "",
        gioi_tinh: "",
        ma_lop: "",
        ma_nganh: "",
        ma_khoa: "",
        dia_chi: "",
        dien_thoai: "",
        email: "",
        trang_thai_hoc_tap: "danghoc",
      });
    } catch (err) {
      alert("❌ Lỗi khi lưu sinh viên!");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/api/sinhvien/${form.ma_sinh_vien}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Cập nhật sinh viên thành công!");
      fetchData();
    } catch (err) {
      alert("❌ Lỗi khi cập nhật!");
    }
  };

  const handleDelete = async (ma_sinh_vien) => {
    if (!window.confirm("Xác nhận xóa sinh viên này?")) return;
    try {
      await axios.delete(`${API_URL}/api/sinhvien/${ma_sinh_vien}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ Xóa thành công!");
      fetchData();
    } catch (err) {
      alert("❌ Lỗi khi xóa sinh viên!");
    }
  };

  const filtered = sinhViens.filter((s) =>
    [s.ho_ten, s.ma_sinh_vien, s.ten_lop, s.ten_nganh, s.ten_khoa]
      .some((f) => f?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>🎒 Quản lý sinh viên</h1>

      {/* Tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm tên, mã SV, lớp, ngành..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Form thêm / cập nhật */}
      <form className="create-form" onSubmit={handleSave}>
        <h3>➕ Thêm / Cập nhật sinh viên</h3>
        <input
          type="text"
          placeholder="Mã sinh viên"
          value={form.ma_sinh_vien}
          onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
        />
        <input
          type="text"
          placeholder="Họ tên"
          value={form.ho_ten}
          onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
        />
        <input
          type="date"
          placeholder="Ngày sinh"
          value={form.ngay_sinh}
          onChange={(e) => setForm({ ...form, ngay_sinh: e.target.value })}
        />
        <select
          value={form.gioi_tinh}
          onChange={(e) => setForm({ ...form, gioi_tinh: e.target.value })}
        >
          <option value="">Giới tính</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
        <input
          type="text"
          placeholder="Mã lớp"
          value={form.ma_lop}
          onChange={(e) => setForm({ ...form, ma_lop: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mã ngành"
          value={form.ma_nganh}
          onChange={(e) => setForm({ ...form, ma_nganh: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mã khoa"
          value={form.ma_khoa}
          onChange={(e) => setForm({ ...form, ma_khoa: e.target.value })}
        />
        <input
          type="text"
          placeholder="Địa chỉ"
          value={form.dia_chi}
          onChange={(e) => setForm({ ...form, dia_chi: e.target.value })}
        />
        <input
          type="text"
          placeholder="Điện thoại"
          value={form.dien_thoai}
          onChange={(e) => setForm({ ...form, dien_thoai: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <select
          value={form.trang_thai_hoc_tap}
          onChange={(e) =>
            setForm({ ...form, trang_thai_hoc_tap: e.target.value })
          }
        >
          <option value="danghoc">Đang học</option>
          <option value="baoluu">Bảo lưu</option>
          <option value="totnghiep">Tốt nghiệp</option>
        </select>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit">💾 Thêm</button>
          <button type="button" onClick={handleUpdate}>✏️ Cập nhật</button>
        </div>
      </form>

      {/* Bảng dữ liệu */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Họ tên</th>
              <th>Giới tính</th>
              <th>Lớp</th>
              <th>Ngành</th>
              <th>Khoa</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map((sv) => (
                <tr key={sv.ma_sinh_vien}>
                  <td>{sv.ma_sinh_vien}</td>
                  <td>{sv.ho_ten}</td>
                  <td>{sv.gioi_tinh}</td>
                  <td>{sv.ten_lop}</td>
                  <td>{sv.ten_nganh}</td>
                  <td>{sv.ten_khoa}</td>
                  <td>{sv.dien_thoai ?? "-"}</td>
                  <td>{sv.email ?? "-"}</td>
                  <td>
                    {sv.trang_thai_hoc_tap === "danghoc"
                      ? "📘 Đang học"
                      : sv.trang_thai_hoc_tap === "baoluu"
                      ? "⏸️ Bảo lưu"
                      : "🎓 Tốt nghiệp"}
                  </td>
                  <td>
                    <button onClick={() => setForm(sv)}>✏️</button>
                    <button onClick={() => handleDelete(sv.ma_sinh_vien)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SinhVienManager;
