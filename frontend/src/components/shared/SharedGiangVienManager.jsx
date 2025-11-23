import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SharedGiangVienManager = () => {
  const [giangVienList, setGiangVienList] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({
    ma_giang_vien: "",
    ho_ten: "",
    hoc_vi: "",
    chuc_vu: "",
    ma_khoa: "",
    email: "",
    dien_thoai: "",
    anh_dai_dien: "",
  });
  const [editing, setEditing] = useState(null);
  const [mode, setMode] = useState("admin"); // admin | khoa
  const [user, setUser] = useState(null);

  // 🧠 Lấy thông tin người dùng hiện tại
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          withCredentials: true,
        });
        const userData = res.data.user;
        setUser(userData);

        if (
          userData.role === "admin" ||
          userData.ten_phong === "Phòng Đào Tạo"
        ) {
          setMode("admin");
        } else {
          setMode("khoa");
        }
      } catch (err) {
        console.error("Không thể xác thực người dùng:", err);
      }
      
    };
    fetchUser();
  }, []);

  // 🔹 Lấy danh sách giảng viên (theo mode)
  const fetchGiangVien = async () => {
    try {
      const endpoint =
        mode === "khoa"
          ? `${API_URL}/api/giangvien/theo-khoa`
          : `${API_URL}/api/giangvien`;
      const res = await axios.get(endpoint, {
        withCredentials: true,
        params: { q: keyword },
      });
      setGiangVienList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách giảng viên:", err);
      alert("Không thể tải danh sách giảng viên!");
    }
  };

  // 🔹 Lấy danh sách khoa (chỉ admin)
  const fetchKhoa = async () => {
    if (mode !== "admin") return;
    try {
      const res = await axios.get(`${API_URL}/api/khoa`, {
        withCredentials: true,
      });
      setKhoaList(res.data.data || res.data);
    } catch (err) {
      console.error("⚠️ Không thể tải danh sách khoa:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchKhoa();
    fetchGiangVien();
    // eslint-disable-next-line
  }, [user, keyword, mode]);

  // ✏️ Sửa giảng viên
  const handleEdit = (item) => {
    setEditing(item.ma_giang_vien);
    setForm({
      ma_giang_vien: item.ma_giang_vien,
      ho_ten: item.ho_ten,
      hoc_vi: item.hoc_vi || "",
      chuc_vu: item.chuc_vu || "",
      ma_khoa: item.ma_khoa || "",
      email: item.email || "",
      dien_thoai: item.dien_thoai || "",
      anh_dai_dien: item.anh_dai_dien || "",
    });
  };

  // 🧩 Thêm hoặc cập nhật giảng viên
  const handleUpsert = async (e) => {
    e.preventDefault();
    if (!form.ma_giang_vien || !form.ho_ten || !form.ma_khoa)
      return alert("⚠️ Điền đầy đủ Mã giảng viên, Họ tên, và Khoa!");

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/giangvien/${editing}`, form, {
          withCredentials: true,
        });
        alert("✅ Cập nhật giảng viên thành công!");
      } else {
        await axios.post(`${API_URL}/api/giangvien`, form, {
          withCredentials: true,
        });
        alert("✅ Thêm giảng viên thành công!");
      }

      setForm({
        ma_giang_vien: "",
        ho_ten: "",
        hoc_vi: "",
        chuc_vu: "",
        ma_khoa: "",
        email: "",
        dien_thoai: "",
        anh_dai_dien: "",
      });
      setEditing(null);
      fetchGiangVien();
    } catch (err) {
      console.error("❌ Lỗi khi lưu giảng viên:", err);
      alert(err.response?.data?.error || "Không thể lưu giảng viên!");
    }
  };

  // 🗑️ Xóa giảng viên
  const handleDelete = async (ma_giang_vien) => {
    if (!window.confirm("Bạn có chắc muốn xóa giảng viên này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/giangvien/${ma_giang_vien}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa giảng viên!");
      fetchGiangVien();
    } catch (err) {
      console.error("❌ Lỗi khi xóa giảng viên:", err);
      alert("Không thể xóa giảng viên này!");
    }
  };

  const isReadOnly = mode === "khoa";

  // 🔹 Giao diện
  return (
    <div className="admin-dashboard">
      <h1 className="text-2xl font-bold mb-3">
        {isReadOnly ? "👨‍🏫 Giảng viên của khoa" : "👨‍🏫 Quản lý giảng viên"}
      </h1>

      {/* Bộ lọc */}
       {user ? (
        <div
          style={{
            background: "#f0f6ff",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <p>
            <b>Tên đăng nhập:</b> {user?.ten_dang_nhap || "—"}
          </p>
          <p>
            <b>Vai trò:</b> {user?.role || "—"}
          </p>
          {user?.ten_phong && (
            <p>
              <b>Phòng/Khoa:</b> {user.ten_phong}
            </p>
          )}
          {user?.ma_phong && (
            <p>
              <b>Mã phòng:</b> {user.ma_phong}</p>
          )}
        </div>
      ) : (
        <p>⏳ Đang tải thông tin người dùng...</p>
      )}

      <div className="filter-bar mb-3">
        <input
          type="text"
          placeholder="Tìm mã, tên, khoa, chức vụ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* ✅ Form chỉ hiển thị cho admin */}
      {!isReadOnly && (
        <form className="create-form" onSubmit={handleUpsert}>
          <h3>{editing ? "✏️ Sửa giảng viên" : "➕ Thêm giảng viên mới"}</h3>
          {!editing && (
            <input
              type="text"
              placeholder="Mã giảng viên"
              value={form.ma_giang_vien}
              onChange={(e) =>
                setForm({ ...form, ma_giang_vien: e.target.value })
              }
            />
          )}
          <input
            type="text"
            placeholder="Họ tên"
            value={form.ho_ten}
            onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
          />
          <input
            type="text"
            placeholder="Học vị (ThS, TS, PGS, GS...)"
            value={form.hoc_vi}
            onChange={(e) => setForm({ ...form, hoc_vi: e.target.value })}
          />
          <input
            type="text"
            placeholder="Chức vụ"
            value={form.chuc_vu}
            onChange={(e) => setForm({ ...form, chuc_vu: e.target.value })}
          />

          <select
            value={form.ma_khoa}
            onChange={(e) => setForm({ ...form, ma_khoa: e.target.value })}
          >
            <option value="">-- Chọn khoa --</option>
            {khoaList.map((k) => (
              <option key={k.ma_khoa} value={k.ma_khoa}>
                {k.ten_khoa}
              </option>
            ))}
          </select>

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Số điện thoại"
            value={form.dien_thoai}
            onChange={(e) => setForm({ ...form, dien_thoai: e.target.value })}
          />
          <input
            type="text"
            placeholder="Ảnh đại diện (URL)"
            value={form.anh_dai_dien}
            onChange={(e) =>
              setForm({ ...form, anh_dai_dien: e.target.value })
            }
          />

          <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({
                  ma_giang_vien: "",
                  ho_ten: "",
                  hoc_vi: "",
                  chuc_vu: "",
                  ma_khoa: "",
                  email: "",
                  dien_thoai: "",
                  anh_dai_dien: "",
                });
              }}
            >
              Hủy
            </button>
          )}
        </form>
      )}

      {/* Bảng danh sách */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Mã GV</th>
              <th>Họ tên</th>
              <th>Học vị</th>
              <th>Chức vụ</th>
              <th>Khoa</th>
              <th>Email</th>
              <th>Điện thoại</th>
              {!isReadOnly && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {giangVienList.length === 0 ? (
              <tr>
                <td colSpan={isReadOnly ? 8 : 9}>Không có dữ liệu</td>
              </tr>
            ) : (
              giangVienList.map((gv) => (
                <tr key={gv.ma_giang_vien}>
                  <td>
                    {gv.anh_dai_dien ? (
                      <img
                        src={gv.anh_dai_dien}
                        alt="avatar"
                        className="avatar-thumb"
                      />
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td>{gv.ma_giang_vien}</td>
                  <td>{gv.ho_ten}</td>
                  <td>{gv.hoc_vi || "—"}</td>
                  <td>{gv.chuc_vu || "—"}</td>
                  <td>{gv.ten_khoa || "—"}</td>
                  <td>{gv.email || "—"}</td>
                  <td>{gv.dien_thoai || "—"}</td>
                  {!isReadOnly && (
                    <td>
                      <button onClick={() => handleEdit(gv)}>✏️</button>
                      <button
                        onClick={() => handleDelete(gv.ma_giang_vien)}
                        className="text-red-600"
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SharedGiangVienManager;
