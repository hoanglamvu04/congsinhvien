import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThoiKhoaBieuManager = () => {
  const [tkbs, setTkbs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({
    id_tkb: null,
    ma_lop_hp: "",
    tuan_hoc: "",
    ngay_hoc: "",
    thu_trong_tuan: "",
    tiet_bat_dau: "",
    tiet_ket_thuc: "",
    phong_hoc: "",
    trang_thai: "hoc",
  });

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/thoi-khoa-bieu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTkbs(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải danh sách thời khóa biểu!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id_tkb) {
        await axios.put(`${API_URL}/api/thoi-khoa-bieu/${form.id_tkb}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật buổi học thành công!");
      } else {
        await axios.post(`${API_URL}/api/thoi-khoa-bieu`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm buổi học mới thành công!");
      }
      fetchData();
      setForm({
        id_tkb: null,
        ma_lop_hp: "",
        tuan_hoc: "",
        ngay_hoc: "",
        thu_trong_tuan: "",
        tiet_bat_dau: "",
        tiet_ket_thuc: "",
        phong_hoc: "",
        trang_thai: "hoc",
      });
    } catch {
      alert("❌ Lỗi khi lưu thời khóa biểu!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa buổi học này?")) return;
    try {
      await axios.delete(`${API_URL}/api/thoi-khoa-bieu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ Xóa thành công!");
      fetchData();
    } catch {
      alert("❌ Lỗi khi xóa!");
    }
  };

  const filtered = tkbs.filter((t) =>
    [t.ten_mon, t.ma_lop_hp, t.phong_hoc, t.ten_giang_vien]
      .some((f) => f?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>📅 Quản lý thời khóa biểu</h1>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm môn học, giảng viên, phòng..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        <h3>➕ Thêm / Cập nhật buổi học</h3>
        <input
          type="text"
          placeholder="Mã lớp học phần"
          value={form.ma_lop_hp}
          onChange={(e) => setForm({ ...form, ma_lop_hp: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tuần học"
          value={form.tuan_hoc}
          onChange={(e) => setForm({ ...form, tuan_hoc: e.target.value })}
        />
        <input
          type="date"
          value={form.ngay_hoc}
          onChange={(e) => setForm({ ...form, ngay_hoc: e.target.value })}
        />
        <input
          type="text"
          placeholder="Thứ trong tuần"
          value={form.thu_trong_tuan}
          onChange={(e) => setForm({ ...form, thu_trong_tuan: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tiết bắt đầu"
          value={form.tiet_bat_dau}
          onChange={(e) => setForm({ ...form, tiet_bat_dau: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tiết kết thúc"
          value={form.tiet_ket_thuc}
          onChange={(e) => setForm({ ...form, tiet_ket_thuc: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phòng học"
          value={form.phong_hoc}
          onChange={(e) => setForm({ ...form, phong_hoc: e.target.value })}
        />
        <select
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        >
          <option value="hoc">Đang học</option>
          <option value="nghi">Nghỉ</option>
          <option value="thi">Thi</option>
        </select>
        <button type="submit">💾 Lưu</button>
      </form>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã lớp HP</th>
              <th>Môn học</th>
              <th>Giảng viên</th>
              <th>Tuần</th>
              <th>Ngày học</th>
              <th>Thứ</th>
              <th>Tiết</th>
              <th>Phòng</th>
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
              filtered.map((t) => (
                <tr key={t.id_tkb}>
                  <td>{t.ma_lop_hp}</td>
                  <td>{t.ten_mon}</td>
                  <td>{t.ten_giang_vien}</td>
                  <td>{t.tuan_hoc}</td>
                  <td>{t.ngay_hoc?.split("T")[0]}</td>
                  <td>{t.thu_trong_tuan}</td>
                  <td>
                    {t.tiet_bat_dau}-{t.tiet_ket_thuc}
                  </td>
                  <td>{t.phong_hoc}</td>
                  <td>{t.trang_thai}</td>
                  <td>
                    <button onClick={() => setForm(t)}>✏️</button>
                    <button onClick={() => handleDelete(t.id_tkb)}>🗑️</button>
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

export default ThoiKhoaBieuManager;
