import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KhenThuongManager = () => {
  const [khenThuongList, setKhenThuongList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ma_sinh_vien: "",
    ma_khoa: "",
    ngay_khen_thuong: "",
    noi_dung: "",
    so_tien: "",
  });
  const [editing, setEditing] = useState(null);

  // 🔹 Lấy danh sách khen thưởng
  const fetchKhenThuong = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/khenthuong`, {
        withCredentials: true, // ✅ Cookie JWT tự động gửi
        params: keyword ? { q: keyword } : {},
      });
      setKhenThuongList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách khen thưởng:", err);
      alert("Không thể tải danh sách khen thưởng!");
    } finally {
      setLoading(false);
    }
  };

  // 🧭 Load dữ liệu ban đầu & khi tìm kiếm
  useEffect(() => {
    fetchKhenThuong();
    // eslint-disable-next-line
  }, [keyword]);

  // ➕ Thêm hoặc sửa khen thưởng
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ma_sinh_vien, ngay_khen_thuong, noi_dung } = form;
    if (!ma_sinh_vien || !ngay_khen_thuong || !noi_dung)
      return alert("⚠️ Vui lòng nhập đủ thông tin bắt buộc!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/khenthuong/${editing}`, form, {
          withCredentials: true,
        });
        alert("✅ Cập nhật khen thưởng thành công!");
      } else {
        await axios.post(`${API_URL}/api/khenthuong`, form, {
          withCredentials: true,
        });
        alert("✅ Thêm khen thưởng thành công!");
      }

      setForm({
        ma_sinh_vien: "",
        ma_khoa: "",
        ngay_khen_thuong: "",
        noi_dung: "",
        so_tien: "",
      });
      setEditing(null);
      fetchKhenThuong();
    } catch (err) {
      console.error("❌ Lỗi khi lưu khen thưởng:", err);
      alert(err.response?.data?.error || "Không thể lưu khen thưởng!");
    }
  };

  // ✏️ Chọn để sửa
  const handleEdit = (item) => {
    setEditing(item.id_khen_thuong);
    setForm({
      ma_sinh_vien: item.ma_sinh_vien,
      ma_khoa: item.ma_khoa || "",
      ngay_khen_thuong: item.ngay_khen_thuong?.slice(0, 10) || "",
      noi_dung: item.noi_dung || "",
      so_tien: item.so_tien || "",
    });
  };

  // 🗑️ Xóa khen thưởng
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khen thưởng này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/khenthuong/${id}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa khen thưởng!");
      fetchKhenThuong();
    } catch (err) {
      console.error("❌ Lỗi khi xóa khen thưởng:", err);
      alert("Không thể xóa khen thưởng!");
    }
  };

  // 💰 Format tiền VND
  const formatCurrency = (num) => {
    if (!num) return "0";
    return Number(num).toLocaleString("vi-VN");
  };

  // 🖥️ Giao diện
  return (
    <div className="admin-dashboard">
      <h1>🏅 Quản lý khen thưởng</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo mã sinh viên, khoa hoặc nội dung..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm/sửa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa khen thưởng" : "➕ Thêm khen thưởng"}</h3>

        <input
          type="text"
          placeholder="Mã sinh viên"
          value={form.ma_sinh_vien}
          onChange={(e) =>
            setForm({ ...form, ma_sinh_vien: e.target.value })
          }
          disabled={!!editing}
        />
        <input
          type="text"
          placeholder="Mã khoa (nếu có)"
          value={form.ma_khoa}
          onChange={(e) => setForm({ ...form, ma_khoa: e.target.value })}
        />
        <input
          type="date"
          placeholder="Ngày khen thưởng"
          value={form.ngay_khen_thuong}
          onChange={(e) =>
            setForm({ ...form, ngay_khen_thuong: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Nội dung khen thưởng"
          value={form.noi_dung}
          onChange={(e) => setForm({ ...form, noi_dung: e.target.value })}
        />
        <input
          type="number"
          placeholder="Số tiền (VNĐ)"
          value={form.so_tien}
          onChange={(e) => setForm({ ...form, so_tien: e.target.value })}
        />

        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                ma_sinh_vien: "",
                ma_khoa: "",
                ngay_khen_thuong: "",
                noi_dung: "",
                so_tien: "",
              });
            }}
          >
            Hủy
          </button>
        )}
      </form>

      {/* 📋 Bảng danh sách */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Khoa</th>
                <th>Ngày</th>
                <th>Nội dung</th>
                <th>Số tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {khenThuongList.length === 0 ? (
                <tr>
                  <td colSpan="8">Không có dữ liệu</td>
                </tr>
              ) : (
                khenThuongList.map((item) => (
                  <tr key={item.id_khen_thuong}>
                    <td>{item.id_khen_thuong}</td>
                    <td>{item.ma_sinh_vien}</td>
                    <td>{item.ho_ten || "—"}</td>
                    <td>{item.ten_khoa || "—"}</td>
                    <td>
                      {item.ngay_khen_thuong
                        ? new Date(item.ngay_khen_thuong).toLocaleDateString(
                            "vi-VN"
                          )
                        : "—"}
                    </td>
                    <td>{item.noi_dung}</td>
                    <td>{formatCurrency(item.so_tien)}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button
                        onClick={() => handleDelete(item.id_khen_thuong)}
                      >
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

export default KhenThuongManager;
