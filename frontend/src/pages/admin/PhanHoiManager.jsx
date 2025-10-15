import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PhanHoiManager = () => {
  const [phanHoiList, setPhanHoiList] = useState([]);
  const [thongKe, setThongKe] = useState({});
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ma_sinh_vien: "",
    nguoi_nhan: "",
    chu_de: "",
    noi_dung: "",
    trang_thai: "choduyet",
  });
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  const fetchPhanHoi = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/phanhoi`, {
        headers: { Authorization: `Bearer ${token}` },
        params: keyword ? { q: keyword } : {},
      });
      setPhanHoiList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải danh sách phản hồi!");
    } finally {
      setLoading(false);
    }
  };

  const fetchThongKe = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/phanhoi/thongke`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setThongKe(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPhanHoi();
    fetchThongKe();
  }, [keyword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_sinh_vien || !form.chu_de || !form.noi_dung)
      return alert("⚠️ Điền đủ thông tin bắt buộc!");
    try {
      if (editing) {
        await axios.put(`${API_URL}/api/phanhoi/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật phản hồi thành công!");
      } else {
        await axios.post(`${API_URL}/api/phanhoi/admin`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm phản hồi mới thành công!");
      }
      setForm({
        ma_sinh_vien: "",
        nguoi_nhan: "",
        chu_de: "",
        noi_dung: "",
        trang_thai: "choduyet",
      });
      setEditing(null);
      fetchPhanHoi();
      fetchThongKe();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi lưu phản hồi!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phản hồi này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/phanhoi/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa phản hồi!");
      fetchPhanHoi();
      fetchThongKe();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa phản hồi!");
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id_phan_hoi);
    setForm({
      ma_sinh_vien: item.ma_sinh_vien,
      nguoi_nhan: item.nguoi_nhan,
      chu_de: item.chu_de,
      noi_dung: item.noi_dung,
      trang_thai: item.trang_thai,
    });
  };

  return (
    <div className="admin-dashboard">
      <h1>💬 Quản lý phản hồi</h1>

      <div className="stats-bar">
        <p>📨 Tổng phản hồi: <b>{thongKe.tong_phan_hoi || 0}</b></p>
        <p>⏳ Chờ duyệt: <b>{thongKe.cho_duyet || 0}</b></p>
        <p>✅ Đã giải quyết: <b>{thongKe.da_giai_quyet || 0}</b></p>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm họ tên, chủ đề, nội dung..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa phản hồi" : "➕ Thêm phản hồi thủ công"}</h3>
        <input
          type="text"
          placeholder="Mã sinh viên"
          value={form.ma_sinh_vien}
          onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
          disabled={editing}
        />
        <input
          type="text"
          placeholder="Người nhận"
          value={form.nguoi_nhan}
          onChange={(e) => setForm({ ...form, nguoi_nhan: e.target.value })}
        />
        <input
          type="text"
          placeholder="Chủ đề"
          value={form.chu_de}
          onChange={(e) => setForm({ ...form, chu_de: e.target.value })}
        />
        <textarea
          placeholder="Nội dung phản hồi"
          value={form.noi_dung}
          onChange={(e) => setForm({ ...form, noi_dung: e.target.value })}
        />
        <select
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        >
          <option value="choduyet">Chờ duyệt</option>
          <option value="dagiaiquyet">Đã giải quyết</option>
        </select>
        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                ma_sinh_vien: "",
                nguoi_nhan: "",
                chu_de: "",
                noi_dung: "",
                trang_thai: "choduyet",
              });
            }}
          >
            Hủy
          </button>
        )}
      </form>

      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Người nhận</th>
                <th>Chủ đề</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {phanHoiList.length === 0 ? (
                <tr>
                  <td colSpan="7">Không có dữ liệu</td>
                </tr>
              ) : (
                phanHoiList.map((item) => (
                  <tr key={item.id_phan_hoi}>
                    <td>{item.ma_sinh_vien}</td>
                    <td>{item.ho_ten}</td>
                    <td>{item.nguoi_nhan || "—"}</td>
                    <td>{item.chu_de}</td>
                    <td>{item.noi_dung}</td>
                    <td>
                      {item.trang_thai === "dagiaiquyet" ? "✅ Đã giải quyết" : "⏳ Chờ duyệt"}
                    </td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.id_phan_hoi)}>🗑️</button>
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

export default PhanHoiManager;
