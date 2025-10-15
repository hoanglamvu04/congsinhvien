import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThiLaiManager = () => {
  const [thiLaiList, setThiLaiList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({
    ma_sinh_vien: "",
    ma_lop_hp: "",
    diem_thi_lai: "",
    ngay_thi_lai: "",
    le_phi_thi_lai: "",
    duoc_cap_nhat: 0,
  });

  const token = localStorage.getItem("token");

  // 📘 Lấy danh sách thi lại
  const fetchThiLai = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/thilai/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setThiLaiList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải danh sách thi lại!");
    }
  };

  useEffect(() => {
    fetchThiLai();
  }, []);

  // ➕ Thêm / cập nhật thi lại
  const handleUpsert = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/thilai`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Cập nhật thi lại thành công!");
      setForm({
        ma_sinh_vien: "",
        ma_lop_hp: "",
        diem_thi_lai: "",
        ngay_thi_lai: "",
        le_phi_thi_lai: "",
        duoc_cap_nhat: 0,
      });
      fetchThiLai();
    } catch {
      alert("❌ Lỗi khi cập nhật thi lại!");
    }
  };

  // 🔍 Lọc dữ liệu
  const filtered = thiLaiList.filter((t) =>
    [t.ten_sinh_vien, t.ma_sinh_vien, t.ten_mon, t.ma_lop_hp]
      .some((f) => f?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>🧾 Quản lý thi lại</h1>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm sinh viên, môn học, lớp..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Form thêm/cập nhật */}
      <form className="create-form" onSubmit={handleUpsert}>
        <h3>➕ Thêm / Cập nhật thi lại</h3>
        <input
          type="text"
          placeholder="Mã sinh viên"
          value={form.ma_sinh_vien}
          onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mã lớp học phần"
          value={form.ma_lop_hp}
          onChange={(e) => setForm({ ...form, ma_lop_hp: e.target.value })}
        />
        <input
          type="number"
          placeholder="Điểm thi lại"
          value={form.diem_thi_lai}
          onChange={(e) => setForm({ ...form, diem_thi_lai: e.target.value })}
        />
        <input
          type="date"
          placeholder="Ngày thi lại"
          value={form.ngay_thi_lai}
          onChange={(e) => setForm({ ...form, ngay_thi_lai: e.target.value })}
        />
        <input
          type="number"
          placeholder="Lệ phí"
          value={form.le_phi_thi_lai}
          onChange={(e) => setForm({ ...form, le_phi_thi_lai: e.target.value })}
        />
        <select
          value={form.duoc_cap_nhat}
          onChange={(e) => setForm({ ...form, duoc_cap_nhat: e.target.value })}
        >
          <option value={0}>Chưa cập nhật</option>
          <option value={1}>Đã cập nhật</option>
        </select>
        <button type="submit">💾 Lưu</button>
      </form>

      {/* Bảng danh sách thi lại */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sinh viên</th>
              <th>MSSV</th>
              <th>Môn học</th>
              <th>Lớp HP</th>
              <th>Điểm thi lại</th>
              <th>Ngày thi lại</th>
              <th>Lệ phí</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id_thi_lai}>
                  <td>{t.ten_sinh_vien}</td>
                  <td>{t.ma_sinh_vien}</td>
                  <td>{t.ten_mon}</td>
                  <td>{t.ma_lop_hp}</td>
                  <td>{t.diem_thi_lai ?? "-"}</td>
                  <td>{t.ngay_thi_lai?.split("T")[0] ?? "-"}</td>
                  <td>{t.le_phi_thi_lai ?? "-"}</td>
                  <td>{t.duoc_cap_nhat ? "✅ Đã cập nhật" : "❌ Chưa"}</td>
                  <td>
                    <button
                      onClick={() =>
                        setForm({
                          ma_sinh_vien: t.ma_sinh_vien,
                          ma_lop_hp: t.ma_lop_hp,
                          diem_thi_lai: t.diem_thi_lai,
                          ngay_thi_lai: t.ngay_thi_lai?.split("T")[0],
                          le_phi_thi_lai: t.le_phi_thi_lai,
                          duoc_cap_nhat: t.duoc_cap_nhat,
                        })
                      }
                    >
                      ✏️
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Xóa bản ghi thi lại này?")) return;
                        try {
                          await axios.delete(`${API_URL}/api/thilai/${t.id_thi_lai}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          alert("🗑️ Xóa thành công!");
                          fetchThiLai();
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

export default ThiLaiManager;
