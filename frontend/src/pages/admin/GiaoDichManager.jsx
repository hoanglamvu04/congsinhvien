import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GiaoDichManager = () => {
  const [giaoDichList, setGiaoDichList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id_hoc_phi: "",
    so_tien: "",
    phuong_thuc: "",
  });
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách giao dịch
  const fetchGiaoDich = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/giaodich`, {
        headers: { Authorization: `Bearer ${token}` },
        params: keyword ? { q: keyword } : {},
      });
      setGiaoDichList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải danh sách giao dịch!");
    } finally {
      setLoading(false);
    }
  };

  // 🧭 Load dữ liệu ban đầu & khi tìm kiếm
  useEffect(() => {
    fetchGiaoDich();
  }, []);

  useEffect(() => {
    fetchGiaoDich();
  }, [keyword]);

  // ➕ Thêm giao dịch (SV nộp học phí)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id_hoc_phi, so_tien, phuong_thuc } = form;
    if (!id_hoc_phi || !so_tien || !phuong_thuc)
      return alert("⚠️ Vui lòng nhập đủ thông tin giao dịch!");

    try {
      await axios.post(`${API_URL}/api/giaodich`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Tạo giao dịch thành công (đang chờ duyệt)");
      setForm({ id_hoc_phi: "", so_tien: "", phuong_thuc: "" });
      fetchGiaoDich();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Lỗi khi tạo giao dịch!");
    }
  };

  // ✏️ Duyệt giao dịch (Admin)
  const handleApprove = async (id, status) => {
    if (!window.confirm(`Xác nhận cập nhật giao dịch #${id} thành ${status}?`))
      return;
    try {
      await axios.put(
        `${API_URL}/api/giaodich`,
        { id_giao_dich: id, trang_thai: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Cập nhật giao dịch thành công!");
      fetchGiaoDich();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật giao dịch!");
    }
  };

  // 🗑️ Xóa giao dịch (Admin)
  const handleDelete = async (id) => {
    if (!window.confirm(`Bạn có chắc muốn xóa giao dịch #${id}?`)) return;
    try {
      await axios.delete(`${API_URL}/api/giaodich/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Đã xóa giao dịch!");
      fetchGiaoDich();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa giao dịch!");
    }
  };

  // 💰 Format tiền VND
  const formatCurrency = (num) => {
    if (!num) return "0";
    return Number(num).toLocaleString("vi-VN");
  };

  return (
    <div className="admin-dashboard">
      <h1>💳 Quản lý giao dịch</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Nhập mã sinh viên, học kỳ hoặc trạng thái..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm giao dịch */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>➕ Tạo giao dịch mới</h3>
        <input
          type="text"
          placeholder="ID học phí (id_hoc_phi)"
          value={form.id_hoc_phi}
          onChange={(e) => setForm({ ...form, id_hoc_phi: e.target.value })}
        />
        <input
          type="number"
          placeholder="Số tiền nộp"
          value={form.so_tien}
          onChange={(e) => setForm({ ...form, so_tien: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phương thức (chuyển khoản / tiền mặt)"
          value={form.phuong_thuc}
          onChange={(e) => setForm({ ...form, phuong_thuc: e.target.value })}
        />
        <button type="submit">Tạo giao dịch</button>
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
                <th>Học kỳ</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Ngày GD</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {giaoDichList.length === 0 ? (
                <tr>
                  <td colSpan="8">Không có dữ liệu</td>
                </tr>
              ) : (
                giaoDichList.map((item) => (
                  <tr key={item.id_giao_dich}>
                    <td>{item.id_giao_dich}</td>
                    <td>{item.ma_sinh_vien}</td>
                    <td>{item.ten_hoc_ky}</td>
                    <td>{formatCurrency(item.so_tien)}</td>
                    <td>{item.phuong_thuc}</td>
                    <td>
                      {new Date(item.ngay_giao_dich).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      <span
                        style={{
                          color:
                            item.trang_thai === "da_duyet"
                              ? "green"
                              : item.trang_thai === "huy"
                              ? "red"
                              : "orange",
                          fontWeight: "600",
                        }}
                      >
                        {item.trang_thai}
                      </span>
                    </td>
                    <td>
                      {item.trang_thai === "cho_duyet" && (
                        <>
                          <button
                            onClick={() =>
                              handleApprove(item.id_giao_dich, "da_duyet")
                            }
                          >
                            ✅
                          </button>
                          <button
                            onClick={() =>
                              handleApprove(item.id_giao_dich, "huy")
                            }
                          >
                            ❌
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(item.id_giao_dich)}>
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

export default GiaoDichManager;
    