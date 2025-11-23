import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const HocPhiManager = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    ma_hoc_ky: "",
    tong_tien_phai_nop: "",
    han_nop: "",
    ghi_chu: "",
    trang_thai: "ap_dung",
  });

  // 🔹 Lấy danh sách học phí
  const fetchHocPhi = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/hocphi`, {
        withCredentials: true,
      });
      setRecords(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách học phí:", err);
      alert("Không thể tải danh sách học phí!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHocPhi();
  }, []);

  // ➕ Thêm hoặc cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_hoc_ky || !form.tong_tien_phai_nop)
      return alert("⚠️ Vui lòng nhập Mã học kỳ và Tổng tiền phải nộp!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/hocphi/${editing}`, form, {
          withCredentials: true,
        });
        alert("✅ Cập nhật học phí thành công!");
      } else {
        await axios.post(`${API_URL}/api/hocphi`, form, {
          withCredentials: true,
        });
        alert("✅ Thêm học phí thành công!");
      }

      setForm({
        ma_hoc_ky: "",
        tong_tien_phai_nop: "",
        han_nop: "",
        ghi_chu: "",
        trang_thai: "ap_dung",
      });
      setEditing(null);
      fetchHocPhi();
    } catch (err) {
      console.error("❌ Lỗi khi lưu học phí:", err);
      alert(err.response?.data?.error || "Không thể lưu học phí!");
    }
  };

  // ✏️ Chọn để sửa
  const handleEdit = (item) => {
    setEditing(item.id_hoc_phi);
    setForm({
      ma_hoc_ky: item.ma_hoc_ky,
      tong_tien_phai_nop: item.tong_tien_phai_nop,
      han_nop: item.han_nop ? item.han_nop.split("T")[0] : "",
      ghi_chu: item.ghi_chu || "",
      trang_thai: item.trang_thai || "ap_dung",
    });
  };

  // 🗑️ Xóa học phí
  const handleDelete = async (id_hoc_phi) => {
    if (!window.confirm("Bạn có chắc muốn xóa bản ghi này?")) return;
    try {
      await axios.delete(`${API_URL}/api/hocphi/${id_hoc_phi}`, {
        withCredentials: true,
      });
      alert("🗑️ Xóa học phí thành công!");
      fetchHocPhi();
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert(err.response?.data?.error || "Không thể xóa học phí!");
    }
  };

  // 🔍 Lọc tìm kiếm
  const filtered = records.filter((r) =>
    [r.ma_hoc_ky, r.ten_hoc_ky, r.ghi_chu]
      .some((f) => f?.toLowerCase().includes(keyword.toLowerCase()))
  );

  // 🖥️ Giao diện
  return (
    <div className="admin-dashboard">
      <h1>💰 Quản lý học phí</h1>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm học kỳ, ghi chú..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Form thêm / sửa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa học phí học kỳ" : "➕ Thêm học phí mới"}</h3>

        {!editing && (
          <input
            type="text"
            placeholder="Mã học kỳ (VD: HK2025A)"
            value={form.ma_hoc_ky}
            onChange={(e) => setForm({ ...form, ma_hoc_ky: e.target.value })}
          />
        )}

        <input
          type="number"
          placeholder="Tổng tiền phải nộp (VNĐ)"
          value={form.tong_tien_phai_nop}
          onChange={(e) =>
            setForm({ ...form, tong_tien_phai_nop: e.target.value })
          }
        />

        <input
          type="date"
          placeholder="Hạn nộp"
          value={form.han_nop}
          onChange={(e) => setForm({ ...form, han_nop: e.target.value })}
        />

        <input
          type="text"
          placeholder="Ghi chú"
          value={form.ghi_chu}
          onChange={(e) => setForm({ ...form, ghi_chu: e.target.value })}
        />

        <select
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        >
          <option value="ap_dung">Áp dụng</option>
          <option value="ngung">Ngưng áp dụng</option>
        </select>

        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                ma_hoc_ky: "",
                tong_tien_phai_nop: "",
                han_nop: "",
                ghi_chu: "",
                trang_thai: "ap_dung",
              });
            }}
          >
            Hủy
          </button>
        )}
      </form>

      {/* Bảng danh sách */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã học kỳ</th>
                <th>Tổng tiền (VNĐ)</th>
                <th>Hạn nộp</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6">Không có dữ liệu</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id_hoc_phi}>
                    <td>{item.ma_hoc_ky}</td>
                    <td>{Number(item.tong_tien_phai_nop).toLocaleString()} ₫</td>
                    <td>
                      {item.han_nop
                        ? new Date(item.han_nop).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td
                      className={
                        item.trang_thai === "ap_dung"
                          ? "status green"
                          : "status red"
                      }
                    >
                      {item.trang_thai === "ap_dung"
                        ? "Áp dụng"
                        : "Ngưng áp dụng"}
                    </td>
                    <td>{item.ghi_chu || "—"}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item.id_hoc_phi)}>
                        🗑️
                      </button>
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
