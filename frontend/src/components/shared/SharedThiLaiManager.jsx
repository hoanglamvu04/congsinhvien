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

  // ➕ Thêm thủ công thi lại
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/thilai/add`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Thêm thi lại thành công!");
      setForm({
        ma_sinh_vien: "",
        ma_lop_hp: "",
        diem_thi_lai: "",
        ngay_thi_lai: "",
        le_phi_thi_lai: "",
      });
      fetchThiLai();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi thêm thi lại!");
    }
  };

  // ✏️ Cập nhật điểm thi lại
  const handleUpdate = async (id_thi_lai) => {
    const diem_thi_lai = prompt("Nhập điểm thi lại mới:");
    if (!diem_thi_lai) return;
    try {
      await axios.put(
        `${API_URL}/api/thilai/${id_thi_lai}`,
        { diem_thi_lai },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Cập nhật điểm thi lại thành công!");
      fetchThiLai();
    } catch {
      alert("❌ Lỗi khi cập nhật!");
    }
  };

  // 🤖 Quét tự động SV có điểm <5
  const handleAutoDetect = async () => {
    if (!window.confirm("Quét tự động sinh viên có điểm tổng dưới 5?")) return;
    try {
      const res = await axios.post(`${API_URL}/api/thilai/auto`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || "✅ Đã quét tự động.");
      fetchThiLai();
    } catch {
      alert("❌ Lỗi khi quét tự động!");
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

      {/* Bộ lọc + nút tự động */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm sinh viên, môn học, lớp..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className="btn-auto" onClick={handleAutoDetect}>
          🔍 Quét tự động SV dưới 5 điểm
        </button>
      </div>

      {/* Form thêm thủ công */}
      <form className="create-form" onSubmit={handleAdd}>
        <h3>➕ Thêm sinh viên thi lại (thủ công)</h3>
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
          type="date"
          placeholder="Ngày thi lại"
          value={form.ngay_thi_lai}
          onChange={(e) => setForm({ ...form, ngay_thi_lai: e.target.value })}
        />
        <input
          type="number"
          placeholder="Lệ phí thi lại"
          value={form.le_phi_thi_lai}
          onChange={(e) => setForm({ ...form, le_phi_thi_lai: e.target.value })}
        />
        <button type="submit">💾 Thêm</button>
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
              <th>Điểm cũ</th>
              <th>Lần thi</th>
              <th>Điểm thi lại</th>
              <th>Kết quả</th>
              <th>Trạng thái</th>
              <th>Ngày thi</th>
              <th>Lệ phí</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="12">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id_thi_lai}>
                  <td>{t.ten_sinh_vien}</td>
                  <td>{t.ma_sinh_vien}</td>
                  <td>{t.ten_mon}</td>
                  <td>{t.ma_lop_hp}</td>
                  <td>{t.diem_cu ?? "-"}</td>
                  <td>{t.lan_thi}</td>
                  <td>{t.diem_thi_lai ?? "-"}</td>
                  <td>
                    {t.ket_qua === "dat" ? "✅ Đạt" :
                     t.ket_qua === "khongdat" ? "❌ Rớt" : "⏳ Chưa thi"}
                  </td>
                  <td>
                    {t.trang_thai === "hoan_tat"
                      ? "🟢 Hoàn tất"
                      : t.trang_thai === "da_thi"
                      ? "🟡 Đã thi"
                      : "⚪ Chưa thi"}
                  </td>
                  <td>{t.ngay_thi_lai?.split("T")[0] ?? "-"}</td>
                  <td>{t.le_phi_thi_lai ?? "-"}</td>
                  <td>
                    <button onClick={() => handleUpdate(t.id_thi_lai)}>✏️</button>
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
