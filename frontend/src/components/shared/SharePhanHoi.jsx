import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PhanHoiManager = () => {
  const [phanHoiList, setPhanHoiList] = useState([]);
  const [thongKe, setThongKe] = useState({});
  const [khoas, setKhoas] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    ma_sinh_vien: "",
    loai_nguoi_nhan: "pdt",
    ma_khoa: "",
    chu_de: "",
    noi_dung: "",
    trang_thai: "choduyet",
  });

  // 🔹 Lấy danh sách phản hồi
  const fetchPhanHoi = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/phanhoi`, {
        withCredentials: true,
        params: keyword ? { q: keyword } : {},
      });
      setPhanHoiList(res.data.data || res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải phản hồi:", err);
      alert("Không thể tải danh sách phản hồi!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Lấy thống kê phản hồi
  const fetchThongKe = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/phanhoi/thongke`, {
        withCredentials: true,
      });
      setThongKe(res.data);
    } catch (err) {
      console.error("⚠️ Lỗi tải thống kê phản hồi:", err);
    }
  };

  // 🔹 Lấy danh sách khoa (dropdown)
  const fetchKhoa = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/khoa`, { withCredentials: true });
      setKhoas(res.data.data || []);
    } catch (err) {
      console.error("⚠️ Lỗi khi tải danh sách khoa:", err);
    }
  };

  useEffect(() => {
    fetchPhanHoi();
    fetchThongKe();
    fetchKhoa();
  }, [keyword]);

  // ➕ Thêm / sửa phản hồi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_sinh_vien || !form.chu_de || !form.noi_dung)
      return alert("⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/phanhoi/${editing}`, form, {
          withCredentials: true,
        });
        alert("✅ Cập nhật phản hồi thành công!");
      } else {
        await axios.post(`${API_URL}/api/phanhoi/admin`, form, {
          withCredentials: true,
        });
        alert("✅ Thêm phản hồi mới thành công!");
      }

      setForm({
        ma_sinh_vien: "",
        loai_nguoi_nhan: "pdt",
        ma_khoa: "",
        chu_de: "",
        noi_dung: "",
        trang_thai: "choduyet",
      });
      setEditing(null);
      fetchPhanHoi();
      fetchThongKe();
    } catch (err) {
      console.error("❌ Lỗi khi lưu phản hồi:", err);
      alert(err.response?.data?.error || "Không thể lưu phản hồi!");
    }
  };

  // ✏️ Chọn phản hồi để sửa
  const handleEdit = (item) => {
    setEditing(item.id_phan_hoi);
    setForm({
      ma_sinh_vien: item.ma_sinh_vien,
      loai_nguoi_nhan: item.loai_nguoi_nhan || "pdt",
      ma_khoa: item.ma_khoa || "",
      chu_de: item.chu_de || "",
      noi_dung: item.noi_dung || "",
      trang_thai: item.trang_thai || "choduyet",
    });
  };

  // 🗑️ Xóa phản hồi
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phản hồi này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/phanhoi/${id}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa phản hồi!");
      fetchPhanHoi();
      fetchThongKe();
    } catch (err) {
      console.error("❌ Lỗi khi xóa phản hồi:", err);
      alert(err.response?.data?.error || "Không thể xóa phản hồi!");
    }
  };

  // 🧭 Giao diện
  return (
    <div className="admin-dashboard">
      <h1>💬 Quản lý phản hồi</h1>

      {/* 📊 Thống kê nhanh */}
      <div className="stats-bar">
        <p>📨 Tổng phản hồi: <b>{thongKe.tong || 0}</b></p>
        <p>⏳ Chờ duyệt: <b>{thongKe.cho_duyet || 0}</b></p>
        <p>✅ Đã giải quyết: <b>{thongKe.da_giai_quyet || 0}</b></p>
      </div>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm họ tên, chủ đề, nội dung..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={fetchPhanHoi}>🔄 Làm mới</button>
      </div>

      {/* 🧩 Form thêm / sửa phản hồi */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa phản hồi" : "➕ Thêm phản hồi thủ công"}</h3>

        <input
          type="text"
          placeholder="Mã sinh viên"
          value={form.ma_sinh_vien}
          onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
          disabled={!!editing}
        />

        <select
          value={form.loai_nguoi_nhan}
          onChange={(e) =>
            setForm({ ...form, loai_nguoi_nhan: e.target.value, ma_khoa: "" })
          }
        >
          <option value="pdt">Phòng đào tạo</option>
          <option value="khoa">Khoa</option>
          <option value="admin">Ban quản trị</option>
        </select>

        {form.loai_nguoi_nhan === "khoa" && (
          <select
            value={form.ma_khoa}
            onChange={(e) => setForm({ ...form, ma_khoa: e.target.value })}
          >
            <option value="">-- Chọn khoa --</option>
            {khoas.map((k) => (
              <option key={k.ma_khoa} value={k.ma_khoa}>
                {k.ten_khoa}
              </option>
            ))}
          </select>
        )}

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
          <option value="choduyet">⏳ Chờ duyệt</option>
          <option value="dagiaiquyet">✅ Đã giải quyết</option>
        </select>

        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                ma_sinh_vien: "",
                loai_nguoi_nhan: "pdt",
                ma_khoa: "",
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

      {/* 📋 Bảng danh sách phản hồi */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Loại người nhận</th>
                <th>Khoa</th>
                <th>Chủ đề</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {phanHoiList.length === 0 ? (
                <tr>
                  <td colSpan="8">Không có dữ liệu</td>
                </tr>
              ) : (
                phanHoiList.map((item) => (
                  <tr key={item.id_phan_hoi}>
                    <td>{item.ma_sinh_vien}</td>
                    <td>{item.ho_ten || "—"}</td>
                    <td>{item.loai_nguoi_nhan}</td>
                    <td>{item.ten_khoa || "—"}</td>
                    <td>{item.chu_de}</td>
                    <td>{item.noi_dung}</td>
                    <td
                      style={{
                        color:
                          item.trang_thai === "dagiaiquyet"
                            ? "green"
                            : "#d39e00",
                        fontWeight: 600,
                      }}
                    >
                      {item.trang_thai === "dagiaiquyet"
                        ? "Đã giải quyết"
                        : "Chờ duyệt"}
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
