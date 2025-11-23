import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SharedKhaoSatManager = ({ role }) => {
  const [khaoSatList, setKhaoSatList] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    tieu_de: "",
    noi_dung: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    doi_tuong: "tatca",
    trang_thai: "dang_mo",
    ma_khoa: "",
  });

  // 🔹 Load danh sách khoa (chỉ khi admin/pdt)
  const fetchKhoa = async () => {
    if (role === "admin" || role === "pdt") {
      try {
        const res = await axios.get(`${API_URL}/api/khoa`, { withCredentials: true });
        setKhoas(res.data.data || res.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách khoa:", err);
      }
    }
  };

  // 🔹 Lấy danh sách khảo sát (lọc tự động theo vai trò)
  const fetchKhaoSat = async () => {
    try {
      setLoading(true);
      let endpoint = `${API_URL}/api/khaosat`;

      if (role === "khoa") {
        endpoint = `${API_URL}/api/khaosat/theo-khoa`;
      }

      const res = await axios.get(endpoint, {
        withCredentials: true,
        params: keyword ? { q: keyword } : {},
      });
      setKhaoSatList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách khảo sát:", err);
      alert("Không thể tải danh sách khảo sát!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhoa();
    fetchKhaoSat();
    // eslint-disable-next-line
  }, [keyword]);

  // ➕ Thêm / Sửa khảo sát
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { tieu_de, noi_dung, ngay_bat_dau, ngay_ket_thuc } = form;
    if (!tieu_de || !noi_dung || !ngay_bat_dau || !ngay_ket_thuc) {
      return alert("⚠️ Vui lòng nhập đủ thông tin bắt buộc!");
    }

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/khaosat/${editing}`, form, { withCredentials: true });
        alert("✅ Cập nhật khảo sát thành công!");
      } else {
        await axios.post(`${API_URL}/api/khaosat`, form, { withCredentials: true });
        alert("✅ Thêm khảo sát thành công!");
      }

      resetForm();
      fetchKhaoSat();
    } catch (err) {
      console.error("❌ Lỗi khi lưu khảo sát:", err);
      alert(err.response?.data?.error || "Không thể lưu khảo sát!");
    }
  };

  // ✏️ Chọn khảo sát để sửa
  const handleEdit = (item) => {
    setEditing(item.id_khao_sat);
    setForm({
      tieu_de: item.tieu_de,
      noi_dung: item.noi_dung,
      ngay_bat_dau: item.ngay_bat_dau?.slice(0, 10) || "",
      ngay_ket_thuc: item.ngay_ket_thuc?.slice(0, 10) || "",
      doi_tuong: item.doi_tuong,
      trang_thai: item.trang_thai,
      ma_khoa: item.ma_khoa || "",
    });
  };

  // 🗑️ Xóa khảo sát
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khảo sát này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/khaosat/${id}`, { withCredentials: true });
      alert("🗑️ Đã xóa khảo sát!");
      fetchKhaoSat();
    } catch (err) {
      console.error("❌ Lỗi khi xóa khảo sát:", err);
      alert("Không thể xóa khảo sát!");
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      tieu_de: "",
      noi_dung: "",
      ngay_bat_dau: "",
      ngay_ket_thuc: "",
      doi_tuong: "tatca",
      trang_thai: "dang_mo",
      ma_khoa: "",
    });
  };

  return (
    <div className="admin-dashboard">
      <h1>📝 Quản lý khảo sát</h1>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề, nội dung hoặc trạng thái..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {(role === "admin" || role === "pdt" || role === "khoa") && (
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

          {(role === "admin" || role === "pdt") && (
            <select
              value={form.ma_khoa}
              onChange={(e) => setForm({ ...form, ma_khoa: e.target.value })}
            >
              <option value="">Không thuộc khoa</option>
              {khoas.map((k) => (
                <option key={k.ma_khoa} value={k.ma_khoa}>
                  {k.ten_khoa}
                </option>
              ))}
            </select>
          )}

          <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
          {editing && (
            <button type="button" onClick={resetForm} style={{ marginLeft: "8px" }}>
              Hủy
            </button>
          )}
        </form>
      )}

      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Khoa</th>
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
                  <td colSpan="8">Không có dữ liệu</td>
                </tr>
              ) : (
                khaoSatList.map((item) => (
                  <tr key={item.id_khao_sat}>
                    <td>{item.id_khao_sat}</td>
                    <td>{item.tieu_de}</td>
                    <td>{item.ten_khoa || "—"}</td>
                    <td>{item.doi_tuong}</td>
                    <td>{new Date(item.ngay_bat_dau).toLocaleDateString("vi-VN")}</td>
                    <td>{new Date(item.ngay_ket_thuc).toLocaleDateString("vi-VN")}</td>
                    <td
                      style={{
                        color: item.trang_thai === "dang_mo" ? "green" : "gray",
                        fontWeight: 600,
                      }}
                    >
                      {item.trang_thai === "dang_mo" ? "Đang mở" : "Đã đóng"}
                    </td>
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

export default SharedKhaoSatManager;
