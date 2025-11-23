import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SharedMonHocManager = ({ mode = "admin" }) => {
  const [monHocList, setMonHocList] = useState([]);
  const [nganhList, setNganhList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedNganh, setSelectedNganh] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    ma_mon: "",
    ten_mon: "",
    ma_nganh: "",
    loai_mon: "",
    so_tin_chi: "",
    don_gia_tin_chi: "",
    hoc_phan_tien_quyet: "",
    chi_nganh: 0,
    mo_ta: "",
  });

  // 🔄 Lấy danh sách môn học
  const fetchMonHoc = async () => {
    try {
      setLoading(true);
      const url =
        mode === "khoa"
          ? `${API_URL}/api/monhoc/theo-khoa`
          : `${API_URL}/api/monhoc`;

      const res = await axios.get(url, {
        withCredentials: true,
        params: { q: keyword },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      setMonHocList(data);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách môn học:", err);
      alert("Không thể tải danh sách môn học!");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Lấy danh sách ngành
  const fetchNganh = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/nganh`, {
        withCredentials: true,
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      setNganhList(data);
    } catch (err) {
      console.error("⚠️ Lỗi tải danh sách ngành:", err);
      setNganhList([]);
    }
  };

  useEffect(() => {
    fetchMonHoc();
    fetchNganh();
    // eslint-disable-next-line
  }, [keyword]);

  // ➕ Thêm / Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_mon || !form.ten_mon)
      return alert("⚠️ Vui lòng nhập đầy đủ Mã và Tên môn học!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/monhoc/${editing}`, form, {
          withCredentials: true,
        });
        alert("✅ Cập nhật môn học thành công!");
      } else {
        await axios.post(`${API_URL}/api/monhoc`, form, {
          withCredentials: true,
        });
        alert("✅ Thêm môn học thành công!");
      }

      // Reset form
      setForm({
        ma_mon: "",
        ten_mon: "",
        ma_nganh: "",
        loai_mon: "",
        so_tin_chi: "",
        don_gia_tin_chi: "",
        hoc_phan_tien_quyet: "",
        chi_nganh: 0,
        mo_ta: "",
      });
      setEditing(null);
      fetchMonHoc();
    } catch (err) {
      console.error("❌ Lỗi khi lưu môn học:", err);
      alert(err.response?.data?.error || "Không thể lưu môn học!");
    }
  };

  // ✏️ Sửa
  const handleEdit = (item) => {
    setEditing(item.ma_mon);
    setForm({
      ma_mon: item.ma_mon || "",
      ten_mon: item.ten_mon || "",
      ma_nganh: item.ma_nganh || "",
      loai_mon: item.loai_mon || "",
      so_tin_chi: item.so_tin_chi || "",
      don_gia_tin_chi: item.don_gia_tin_chi || "",
      hoc_phan_tien_quyet: item.hoc_phan_tien_quyet || "",
      chi_nganh: item.chi_nganh || 0,
      mo_ta: item.mo_ta || "",
    });
  };

  // 🗑️ Xóa
  const handleDelete = async (ma_mon) => {
    if (!window.confirm("Bạn có chắc muốn xóa môn học này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/monhoc/${ma_mon}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa môn học!");
      fetchMonHoc();
    } catch (err) {
      console.error("❌ Lỗi khi xóa môn học:", err);
      alert(err.response?.data?.error || "Không thể xóa môn học!");
    }
  };

  // 🔎 Lọc theo ngành
  const filteredList = monHocList.filter(
    (item) =>
      (!selectedNganh || item.ma_nganh === selectedNganh) &&
      (item.ten_mon?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.ma_mon?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.ten_nganh?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>{mode === "khoa" ? "📘 Môn học của Khoa" : "📘 Quản lý Môn học"}</h1>

      {/* 🔍 Bộ lọc */}
      <div className="filter-bar flex gap-2">
        <input
          type="text"
          placeholder="Tìm mã, tên, ngành..."
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

      {/* 🧩 Form thêm / sửa (chỉ Admin/PĐT) */}
      {mode === "admin" && (
        <form className="create-form" onSubmit={handleSubmit}>
          <h3>{editing ? "✏️ Sửa môn học" : "➕ Thêm môn học mới"}</h3>
          {!editing && (
            <input
              type="text"
              placeholder="Mã môn"
              value={form.ma_mon}
              onChange={(e) => setForm({ ...form, ma_mon: e.target.value })}
            />
          )}
          <input
            type="text"
            placeholder="Tên môn học"
            value={form.ten_mon}
            onChange={(e) => setForm({ ...form, ten_mon: e.target.value })}
          />
          <select
            value={form.ma_nganh}
            onChange={(e) => setForm({ ...form, ma_nganh: e.target.value })}
          >
            <option value="">-- Chọn ngành --</option>
            {nganhList.map((n) => (
              <option key={n.ma_nganh} value={n.ma_nganh}>
                {n.ten_nganh}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Loại môn (bắt buộc / tự chọn)"
            value={form.loai_mon}
            onChange={(e) => setForm({ ...form, loai_mon: e.target.value })}
          />
          <input
            type="number"
            placeholder="Số tín chỉ"
            value={form.so_tin_chi}
            onChange={(e) => setForm({ ...form, so_tin_chi: e.target.value })}
          />
          <input
            type="number"
            placeholder="Đơn giá / tín chỉ"
            value={form.don_gia_tin_chi}
            onChange={(e) =>
              setForm({ ...form, don_gia_tin_chi: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Học phần tiên quyết"
            value={form.hoc_phan_tien_quyet}
            onChange={(e) =>
              setForm({ ...form, hoc_phan_tien_quyet: e.target.value })
            }
          />
          <select
            value={form.chi_nganh}
            onChange={(e) =>
              setForm({ ...form, chi_nganh: Number(e.target.value) })
            }
          >
            <option value={0}>Chung</option>
            <option value={1}>Chuyên ngành</option>
          </select>
          <input
            type="text"
            placeholder="Mô tả"
            value={form.mo_ta}
            onChange={(e) => setForm({ ...form, mo_ta: e.target.value })}
          />

          <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({
                  ma_mon: "",
                  ten_mon: "",
                  ma_nganh: "",
                  loai_mon: "",
                  so_tin_chi: "",
                  don_gia_tin_chi: "",
                  hoc_phan_tien_quyet: "",
                  chi_nganh: 0,
                  mo_ta: "",
                });
              }}
            >
              Hủy
            </button>
          )}
        </form>
      )}

      {/* 📋 Bảng danh sách */}
      <div className="table-container">
        {loading ? (
          <p>⏳ Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã môn</th>
                <th>Tên môn</th>
                <th>Ngành</th>
                <th>Tín chỉ</th>
                <th>Đơn giá</th>
                <th>Tổng tiền</th>
                <th>Loại</th>
                <th>Tiên quyết</th>
                <th>Chi ngành</th>
                <th>Mô tả</th>
                {mode === "admin" && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={mode === "admin" ? 11 : 10}>Không có dữ liệu</td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.ma_mon}>
                    <td>{item.ma_mon}</td>
                    <td>{item.ten_mon}</td>
                    <td>{item.ten_nganh || "-"}</td>
                    <td>{item.so_tin_chi}</td>
                    <td>{item.don_gia_tin_chi?.toLocaleString()}</td>
                    <td>
                      {(item.so_tin_chi * item.don_gia_tin_chi)?.toLocaleString()}
                    </td>
                    <td>{item.loai_mon || "-"}</td>
                    <td>{item.hoc_phan_tien_quyet || "-"}</td>
                    <td>{item.chi_nganh ? "Chuyên ngành" : "Chung"}</td>
                    <td>{item.mo_ta || "-"}</td>
                    {mode === "admin" && (
                      <td>
                        <button onClick={() => handleEdit(item)}>✏️</button>
                        <button onClick={() => handleDelete(item.ma_mon)}>🗑️</button>
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

export default SharedMonHocManager;
