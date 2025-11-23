import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SharedLopHocPhanManager = ({ mode = "admin" }) => {
  const [lopHocPhanList, setLopHocPhanList] = useState([]);
  const [monList, setMonList] = useState([]);
  const [gvList, setGvList] = useState([]);
  const [hocKyList, setHocKyList] = useState([]);
  const [nganhList, setNganhList] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [selectedNganh, setSelectedNganh] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    ma_lop_hp: "",
    ma_mon: "",
    ma_giang_vien: "",
    ma_hoc_ky: "",
    phong_hoc: "",
    lich_hoc: "",
    gioi_han_dang_ky: "",
    trang_thai: "dangmo",
  });

  // 🔄 Lấy danh sách dữ liệu
  const fetchData = async () => {
    try {
      setLoading(true);

      const lhpUrl =
        mode === "khoa"
          ? `${API_URL}/api/lophocphan/theo-khoa`
          : `${API_URL}/api/lophocphan`;

      const [lhpRes, monRes, gvRes, hkRes, nganhRes] = await Promise.all([
        axios.get(lhpUrl, { withCredentials: true, params: { q: keyword } }),
        axios.get(`${API_URL}/api/monhoc`, { withCredentials: true }),
        axios.get(`${API_URL}/api/giangvien`, { withCredentials: true }),
        axios.get(`${API_URL}/api/khoahoc-hocky/hocky`, { withCredentials: true }),
        axios.get(`${API_URL}/api/nganh`, { withCredentials: true }),
      ]);

      setLopHocPhanList(lhpRes.data.data || lhpRes.data);
      setMonList(Array.isArray(monRes.data) ? monRes.data : monRes.data.data || []);
      setGvList(Array.isArray(gvRes.data) ? gvRes.data : gvRes.data.data || []);
      setHocKyList(Array.isArray(hkRes.data) ? hkRes.data : hkRes.data.data || []);
      setNganhList(Array.isArray(nganhRes.data) ? nganhRes.data : nganhRes.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
      alert("Không thể tải danh sách lớp học phần!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [keyword]);

  // ➕ Thêm / Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_lop_hp || !form.ma_mon || !form.ma_hoc_ky)
      return alert("⚠️ Điền đầy đủ Mã lớp, Môn và Học kỳ!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/lophocphan/${editing}`, form, {
          withCredentials: true,
        });
        alert("✅ Cập nhật lớp học phần thành công!");
      } else {
        await axios.post(`${API_URL}/api/lophocphan`, form, {
          withCredentials: true,
        });
        alert("✅ Thêm lớp học phần mới thành công!");
      }
      setEditing(null);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("❌ Lỗi khi lưu lớp học phần:", err);
      alert(err.response?.data?.error || "Không thể lưu lớp học phần!");
    }
  };

  const resetForm = () => {
    setForm({
      ma_lop_hp: "",
      ma_mon: "",
      ma_giang_vien: "",
      ma_hoc_ky: "",
      phong_hoc: "",
      lich_hoc: "",
      gioi_han_dang_ky: "",
      trang_thai: "dangmo",
    });
  };

  // ✏️ Sửa
  const handleEdit = (item) => {
    setEditing(item.ma_lop_hp);
    setForm({
      ma_lop_hp: item.ma_lop_hp,
      ma_mon: item.ma_mon || "",
      ma_giang_vien: item.ma_giang_vien || "",
      ma_hoc_ky: item.ma_hoc_ky || "",
      phong_hoc: item.phong_hoc || "",
      lich_hoc: item.lich_hoc || "",
      gioi_han_dang_ky: item.gioi_han_dang_ky || "",
      trang_thai: item.trang_thai || "dangmo",
    });
  };

  // 🗑️ Xóa
  const handleDelete = async (ma_lop_hp) => {
    if (!window.confirm("Bạn có chắc muốn xóa lớp học phần này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/lophocphan/${ma_lop_hp}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa lớp học phần!");
      fetchData();
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert(err.response?.data?.error || "Không thể xóa lớp học phần!");
    }
  };

  // 🔎 Lọc theo ngành (chỉ hiển thị client-side)
  const filteredList = lopHocPhanList.filter(
    (item) =>
      (!selectedNganh || item.ma_nganh === selectedNganh) &&
      (item.ten_mon?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.ten_giang_vien?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.ten_nganh?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.ma_lop_hp?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>{mode === "khoa" ? "🏫 Lớp học phần của Khoa" : "🏫 Quản lý lớp học phần"}</h1>

      {/* 🔍 Bộ lọc */}
      <div className="filter-bar flex gap-2">
        <input
          type="text"
          placeholder="Tìm mã lớp, môn, giảng viên..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          value={selectedNganh}
          onChange={(e) => setSelectedNganh(e.target.value)}
        >
          <option value="">-- Tất cả ngành --</option>
          {nganhList.map((n) => (
            <option key={n.ma_nganh} value={n.ma_nganh}>
              {n.ten_nganh}
            </option>
          ))}
        </select>
      </div>

      {/* 🧩 Form (chỉ cho Admin/PĐT) */}
      {mode === "admin" && (
        <form className="create-form" onSubmit={handleSubmit}>
          <h3>{editing ? "✏️ Sửa lớp học phần" : "➕ Thêm lớp học phần mới"}</h3>
          {!editing && (
            <input
              type="text"
              placeholder="Mã lớp học phần"
              value={form.ma_lop_hp}
              onChange={(e) => setForm({ ...form, ma_lop_hp: e.target.value })}
            />
          )}
          <select
            value={form.ma_mon}
            onChange={(e) => setForm({ ...form, ma_mon: e.target.value })}
          >
            <option value="">-- Chọn môn học --</option>
            {monList.map((m) => (
              <option key={m.ma_mon} value={m.ma_mon}>
                {m.ten_mon}
              </option>
            ))}
          </select>
          <select
            value={form.ma_giang_vien}
            onChange={(e) => setForm({ ...form, ma_giang_vien: e.target.value })}
          >
            <option value="">-- Chọn giảng viên --</option>
            {gvList.map((g) => (
              <option key={g.ma_giang_vien} value={g.ma_giang_vien}>
                {g.ho_ten}
              </option>
            ))}
          </select>
          <select
            value={form.ma_hoc_ky}
            onChange={(e) => setForm({ ...form, ma_hoc_ky: e.target.value })}
          >
            <option value="">-- Chọn học kỳ --</option>
            {hocKyList.map((h) => (
              <option key={h.ma_hoc_ky} value={h.ma_hoc_ky}>
                {h.ten_hoc_ky}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Phòng học"
            value={form.phong_hoc}
            onChange={(e) => setForm({ ...form, phong_hoc: e.target.value })}
          />
          <input
            type="text"
            placeholder="Lịch học"
            value={form.lich_hoc}
            onChange={(e) => setForm({ ...form, lich_hoc: e.target.value })}
          />
          <input
            type="number"
            placeholder="Giới hạn đăng ký"
            value={form.gioi_han_dang_ky}
            onChange={(e) =>
              setForm({ ...form, gioi_han_dang_ky: e.target.value })
            }
          />
          <select
            value={form.trang_thai}
            onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
          >
            <option value="dangmo">Đang mở</option>
            <option value="dong">Đóng</option>
            <option value="hoanthanh">Hoàn thành</option>
          </select>
          <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); resetForm(); }}>
              Hủy
            </button>
          )}
        </form>
      )}

      {/* 📋 Bảng */}
      <div className="table-container">
        {loading ? (
          <p>⏳ Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã lớp HP</th>
                <th>Môn học</th>
                <th>Ngành</th>
                <th>Giảng viên</th>
                <th>Học kỳ</th>
                <th>Phòng học</th>
                <th>Lịch học</th>
                <th>Giới hạn</th>
                <th>Trạng thái</th>
                {mode === "admin" && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={mode === "admin" ? 10 : 9}>Không có dữ liệu</td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.ma_lop_hp}>
                    <td>{item.ma_lop_hp}</td>
                    <td>{item.ten_mon}</td>
                    <td>{item.ten_nganh || "-"}</td>
                    <td>{item.ten_giang_vien || "-"}</td>
                    <td>{item.ten_hoc_ky}</td>
                    <td>{item.phong_hoc || "-"}</td>
                    <td>{item.lich_hoc || "-"}</td>
                    <td>{item.gioi_han_dang_ky}</td>
                    <td>
                      {item.trang_thai === "dangmo"
                        ? "Đang mở"
                        : item.trang_thai === "hoanthanh"
                        ? "Hoàn thành"
                        : "Đóng"}
                    </td>
                    {mode === "admin" && (
                      <td>
                        <button onClick={() => handleEdit(item)}>✏️</button>
                        <button onClick={() => handleDelete(item.ma_lop_hp)}>🗑️</button>
                      </td>
                    )}
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

export default SharedLopHocPhanManager;
