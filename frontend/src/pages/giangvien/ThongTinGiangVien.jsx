import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThongTinGiangVien = () => {
  const token = localStorage.getItem("token");
  const [gv, setGv] = useState(null);
  const [form, setForm] = useState({ email: "", dien_thoai: "", anh_dai_dien: "" });
  const [editMode, setEditMode] = useState(false);

  // 📘 Lấy thông tin giảng viên
  const fetchThongTin = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/giangvien/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGv(res.data);
      setForm({
        email: res.data.email || "",
        dien_thoai: res.data.dien_thoai || "",
        anh_dai_dien: res.data.anh_dai_dien || "",
      });
    } catch (err) {
      console.error(err);
      alert("Không thể tải thông tin giảng viên!");
    }
  };

  useEffect(() => {
    fetchThongTin();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/giangvien/me`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Cập nhật thông tin thành công!");
      setEditMode(false);
      fetchThongTin();
    } catch (err) {
      alert("❌ Lỗi khi cập nhật!");
    }
  };

  if (!gv) return <p>⏳ Đang tải thông tin...</p>;

  return (
    <div className="page-container">
      <h2>👨‍🏫 Thông tin giảng viên</h2>

      <div className="profile-card">
        <img
          src={gv.anh_dai_dien || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
          alt="avatar"
          className="avatar"
        />
        <div>
          <h3>{gv.ho_ten}</h3>
          <p><b>Mã GV:</b> {gv.ma_giang_vien}</p>
          <p><b>Khoa:</b> {gv.ten_khoa}</p>
          <p><b>Học vị:</b> {gv.hoc_vi || "—"}</p>
          <p><b>Chức vụ:</b> {gv.chuc_vu || "—"}</p>
        </div>
      </div>

      <form className="edit-form" onSubmit={handleUpdate}>
        <label>Email:</label>
        <input
          type="email"
          value={form.email}
          disabled={!editMode}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label>Điện thoại:</label>
        <input
          type="text"
          value={form.dien_thoai}
          disabled={!editMode}
          onChange={(e) => setForm({ ...form, dien_thoai: e.target.value })}
        />

        <label>Ảnh đại diện (URL):</label>
        <input
          type="text"
          value={form.anh_dai_dien}
          disabled={!editMode}
          onChange={(e) => setForm({ ...form, anh_dai_dien: e.target.value })}
        />

        {editMode ? (
          <button type="submit" className="btn-save">💾 Lưu thay đổi</button>
        ) : (
          <button type="button" onClick={() => setEditMode(true)}>✏️ Chỉnh sửa</button>
        )}
      </form>
    </div>
  );
};

export default ThongTinGiangVien;
