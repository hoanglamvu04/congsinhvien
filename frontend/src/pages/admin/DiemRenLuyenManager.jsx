import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DiemRenLuyenManager = () => {
  const [records, setRecords] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({
    ma_sinh_vien: "",
    ma_hoc_ky: "",
    diem_tu_danh_gia: "",
    diem_co_van: "",
    diem_chung_ket: "",
    xep_loai: "",
  });

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/diemrenluyen/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải danh sách điểm rèn luyện!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpsert = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/diemrenluyen`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Cập nhật thành công!");
      setForm({
        ma_sinh_vien: "",
        ma_hoc_ky: "",
        diem_tu_danh_gia: "",
        diem_co_van: "",
        diem_chung_ket: "",
        xep_loai: "",
      });
      fetchData();
    } catch {
      alert("❌ Lỗi khi lưu điểm!");
    }
  };

  const filtered = records.filter((r) =>
    [r.ten_sinh_vien, r.ma_sinh_vien, r.ten_hoc_ky]
      .some((f) => f?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>🎯 Quản lý điểm rèn luyện</h1>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm sinh viên, học kỳ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Form thêm / cập nhật */}
      <form className="create-form" onSubmit={handleUpsert}>
        <h3>➕ Thêm / Cập nhật điểm rèn luyện</h3>
        <input
          type="text"
          placeholder="Mã sinh viên"
          value={form.ma_sinh_vien}
          onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mã học kỳ"
          value={form.ma_hoc_ky}
          onChange={(e) => setForm({ ...form, ma_hoc_ky: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tự đánh giá"
          value={form.diem_tu_danh_gia}
          onChange={(e) =>
            setForm({ ...form, diem_tu_danh_gia: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Cố vấn đánh giá"
          value={form.diem_co_van}
          onChange={(e) => setForm({ ...form, diem_co_van: e.target.value })}
        />
        <input
          type="number"
          placeholder="Điểm chung kết"
          value={form.diem_chung_ket}
          onChange={(e) => setForm({ ...form, diem_chung_ket: e.target.value })}
        />
        <select
          value={form.xep_loai}
          onChange={(e) => setForm({ ...form, xep_loai: e.target.value })}
        >
          <option value="">Xếp loại</option>
          <option value="Xuất sắc">Xuất sắc</option>
          <option value="Tốt">Tốt</option>
          <option value="Khá">Khá</option>
          <option value="Trung bình">Trung bình</option>
          <option value="Yếu">Yếu</option>
        </select>
        <button type="submit">💾 Lưu</button>
      </form>

      {/* Bảng danh sách */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sinh viên</th>
              <th>MSSV</th>
              <th>Học kỳ</th>
              <th>Tự đánh giá</th>
              <th>Cố vấn</th>
              <th>Chung kết</th>
              <th>Xếp loại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id_drl}>
                  <td>{r.ten_sinh_vien}</td>
                  <td>{r.ma_sinh_vien}</td>
                  <td>{r.ten_hoc_ky}</td>
                  <td>{r.diem_tu_danh_gia ?? "-"}</td>
                  <td>{r.diem_co_van ?? "-"}</td>
                  <td>{r.diem_chung_ket ?? "-"}</td>
                  <td>{r.xep_loai ?? "-"}</td>
                  <td>
                    <button
                      onClick={() =>
                        setForm({
                          ma_sinh_vien: r.ma_sinh_vien,
                          ma_hoc_ky: r.ma_hoc_ky,
                          diem_tu_danh_gia: r.diem_tu_danh_gia,
                          diem_co_van: r.diem_co_van,
                          diem_chung_ket: r.diem_chung_ket,
                          xep_loai: r.xep_loai,
                        })
                      }
                    >
                      ✏️
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Xóa bản ghi này?")) return;
                        try {
                          await axios.delete(
                            `${API_URL}/api/diemrenluyen/${r.id_drl}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          alert("🗑️ Xóa thành công!");
                          fetchData();
                        } catch {
                          alert("❌ Lỗi khi xóa!");
                        }
                      }}
                    >
                      🗑️
                    </button>
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

export default DiemRenLuyenManager;
