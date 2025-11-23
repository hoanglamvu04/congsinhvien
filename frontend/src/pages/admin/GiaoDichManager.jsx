import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GiaoDichHocPhiManager = () => {
  const [records, setRecords] = useState([]);
  const [hocPhis, setHocPhis] = useState([]);
  const [sinhViens, setSinhViens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({
    ma_sinh_vien: "",
    id_hoc_phi: "",
    so_tien_nop: "",
    phuong_thuc: "tien_mat",
    trang_thai: "thanh_cong",
    ghi_chu: "",
  });

  // 🔹 Lấy danh sách giao dịch học phí
  const fetchGiaoDich = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/giaodichhocphi`, {
        withCredentials: true,
      });
      setRecords(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách giao dịch:", err);
      alert("Không thể tải danh sách giao dịch!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Lấy danh sách học phí (học kỳ)
  const fetchHocPhi = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/hocphi`, {
        withCredentials: true,
      });
      setHocPhis(res.data.data || []);
    } catch {
      console.warn("⚠️ Không thể tải danh sách học phí!");
    }
  };

  // 🔹 Lấy danh sách sinh viên
  const fetchSinhVien = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sinhvien`, {
        withCredentials: true,
      });
      setSinhViens(res.data.data || []);
    } catch {
      console.warn("⚠️ Không thể tải danh sách sinh viên!");
    }
  };

  useEffect(() => {
    fetchGiaoDich();
    fetchHocPhi();
    fetchSinhVien();
  }, []);

  // ➕ Thêm giao dịch mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_sinh_vien || !form.id_hoc_phi || !form.so_tien_nop)
      return alert("⚠️ Vui lòng nhập đầy đủ thông tin!");

    try {
      await axios.post(`${API_URL}/api/giaodichhocphi`, form, {
        withCredentials: true,
      });
      alert("✅ Giao dịch học phí đã được ghi nhận!");
      setForm({
        ma_sinh_vien: "",
        id_hoc_phi: "",
        so_tien_nop: "",
        phuong_thuc: "tien_mat",
        trang_thai: "thanh_cong",
        ghi_chu: "",
      });
      fetchGiaoDich();
    } catch (err) {
      console.error("❌ Lỗi khi lưu giao dịch:", err);
      alert(err.response?.data?.error || "Không thể lưu giao dịch!");
    }
  };

  // 🗑️ Xóa giao dịch
  const handleDelete = async (id_gd) => {
    if (!window.confirm("Bạn có chắc muốn xóa giao dịch này?")) return;
    try {
      await axios.delete(`${API_URL}/api/giaodichhocphi/${id_gd}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa giao dịch!");
      fetchGiaoDich();
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa giao dịch!");
    }
  };

  // 🔍 Lọc danh sách
  const filtered = records.filter((r) =>
    [r.ho_ten, r.ma_sinh_vien, r.ten_hoc_ky, r.phuong_thuc, r.trang_thai]
      .some((f) => f?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>💳 Quản lý giao dịch học phí</h1>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm sinh viên, học kỳ, phương thức..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Form thêm giao dịch */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>➕ Ghi nhận giao dịch mới</h3>

        <select
          value={form.ma_sinh_vien}
          onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
        >
          <option value="">-- Chọn sinh viên --</option>
          {sinhViens.map((sv) => (
            <option key={sv.ma_sinh_vien} value={sv.ma_sinh_vien}>
              {sv.ho_ten} ({sv.ma_sinh_vien})
            </option>
          ))}
        </select>

        <select
          value={form.id_hoc_phi}
          onChange={(e) => setForm({ ...form, id_hoc_phi: e.target.value })}
        >
          <option value="">-- Chọn học kỳ --</option>
          {hocPhis.map((hp) => (
            <option key={hp.id_hoc_phi} value={hp.id_hoc_phi}>
              {hp.ma_hoc_ky} – {Number(hp.tong_tien_phai_nop).toLocaleString()} ₫
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Số tiền nộp (VNĐ)"
          value={form.so_tien_nop}
          onChange={(e) => setForm({ ...form, so_tien_nop: e.target.value })}
        />

        <select
          value={form.phuong_thuc}
          onChange={(e) => setForm({ ...form, phuong_thuc: e.target.value })}
        >
          <option value="tien_mat">Tiền mặt</option>
          <option value="chuyen_khoan">Chuyển khoản</option>
          <option value="online">Online</option>
        </select>

        <select
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        >
          <option value="thanh_cong">Thành công</option>
          <option value="cho_duyet">Chờ duyệt</option>
          <option value="that_bai">Thất bại</option>
        </select>

        <input
          type="text"
          placeholder="Ghi chú"
          value={form.ghi_chu}
          onChange={(e) => setForm({ ...form, ghi_chu: e.target.value })}
        />

        <button type="submit">💾 Lưu</button>
      </form>

      {/* Bảng danh sách giao dịch */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>MSSV</th>
                <th>Học kỳ</th>
                <th>Số tiền nộp</th>
                <th>Ngày nộp</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9">Không có dữ liệu</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id_gd}>
                    <td>{r.ho_ten}</td>
                    <td>{r.ma_sinh_vien}</td>
                    <td>{r.ten_hoc_ky}</td>
                    <td>{Number(r.so_tien_nop).toLocaleString()} ₫</td>
                    <td>
                      {new Date(r.ngay_nop).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{r.phuong_thuc}</td>
                    <td
                      className={
                        r.trang_thai === "thanh_cong"
                          ? "status green"
                          : r.trang_thai === "cho_duyet"
                          ? "status orange"
                          : "status red"
                      }
                    >
                      {r.trang_thai === "thanh_cong"
                        ? "Thành công"
                        : r.trang_thai === "cho_duyet"
                        ? "Chờ duyệt"
                        : "Thất bại"}
                    </td>
                    <td>{r.ghi_chu || "—"}</td>
                    <td>
                      <button onClick={() => handleDelete(r.id_gd)}>🗑️</button>
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

export default GiaoDichHocPhiManager;
