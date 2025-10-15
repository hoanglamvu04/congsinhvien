import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AccountManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [vaiTro, setVaiTro] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ten_dang_nhap: "", mat_khau: "", vai_tro: "sinhvien" });
  const token = localStorage.getItem("token");

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/accounts`, {
        params: { keyword, vai_tro: vaiTro },
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [keyword, vaiTro]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.ten_dang_nhap || !form.mat_khau) return alert("Điền đủ thông tin!");
    try {
      await axios.post(`${API_URL}/api/admin/create-account`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Tạo tài khoản thành công!");
      setForm({ ten_dang_nhap: "", mat_khau: "", vai_tro: "sinhvien" });
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo tài khoản");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts();
    } catch {
      alert("Lỗi khi xóa tài khoản!");
    }
  };

  const handleResetPassword = async (id) => {
    const newPass = prompt("Nhập mật khẩu mới:");
    if (!newPass) return;
    try {
      await axios.put(
        `${API_URL}/api/admin/accounts/${id}/reset-password`,
        { mat_khau_moi: newPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Đặt lại mật khẩu thành công!");
    } catch {
      alert("Lỗi khi đặt lại mật khẩu!");
    }
  };

  const handleUpdate = async (id, newRole, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/accounts/${id}`,
        { vai_tro: newRole, trang_thai: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAccounts();
    } catch {
      alert("Lỗi khi cập nhật tài khoản!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>👤 Quản lý tài khoản</h1>

      {/* 🔍 Bộ lọc */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm tên đăng nhập..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select value={vaiTro} onChange={(e) => setVaiTro(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          <option value="sinhvien">Sinh viên</option>
          <option value="giangvien">Giảng viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      {/* 🧩 Form thêm tài khoản */}
      <form className="create-form" onSubmit={handleCreate}>
        <h3>Tạo tài khoản mới</h3>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={form.ten_dang_nhap}
          onChange={(e) => setForm({ ...form, ten_dang_nhap: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.mat_khau}
          onChange={(e) => setForm({ ...form, mat_khau: e.target.value })}
        />
        <select
          value={form.vai_tro}
          onChange={(e) => setForm({ ...form, vai_tro: e.target.value })}
        >
          <option value="sinhvien">Sinh viên</option>
          <option value="giangvien">Giảng viên</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">➕ Thêm</button>
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
                <th>Tên đăng nhập</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan="6">Không có dữ liệu</td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id_tai_khoan}>
                    <td>{acc.id_tai_khoan}</td>
                    <td>{acc.ten_dang_nhap}</td>
                    <td>
                      <select
                        value={acc.vai_tro}
                        onChange={(e) =>
                          handleUpdate(acc.id_tai_khoan, e.target.value, acc.trang_thai)
                        }
                      >
                        <option value="sinhvien">Sinh viên</option>
                        <option value="giangvien">Giảng viên</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={acc.trang_thai}
                        onChange={(e) =>
                          handleUpdate(acc.id_tai_khoan, acc.vai_tro, e.target.value)
                        }
                      >
                        <option value="hoatdong">Hoạt động</option>
                        <option value="khoa">Khóa</option>
                      </select>
                    </td>
                    <td>{new Date(acc.ngay_tao).toLocaleDateString("vi-VN")}</td>
                    <td>
                      <button onClick={() => handleResetPassword(acc.id_tai_khoan)}>🔑</button>
                      <button onClick={() => handleDelete(acc.id_tai_khoan)}>🗑️</button>
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

export default AccountManager;
