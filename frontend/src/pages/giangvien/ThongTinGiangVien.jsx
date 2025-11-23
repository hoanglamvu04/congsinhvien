import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThongTinGiangVien = () => {
  const [gv, setGv] = useState(null);
  const [form, setForm] = useState({ email: "", dien_thoai: "", anh_dai_dien: "" });
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState("");

  // 🔹 Lấy thông tin giảng viên
  const fetchThongTin = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/giangvien/me`, {
        withCredentials: true,
      });
      const data = res.data;
      setGv(data);
      setForm({
        email: data.email || "",
        dien_thoai: data.dien_thoai || "",
        anh_dai_dien: data.anh_dai_dien || "",
      });
      setPreview(data.anh_dai_dien || "");
    } catch (err) {
      console.error("❌ Lỗi khi tải thông tin giảng viên:", err);
      toast.error("Không thể tải thông tin giảng viên!");
    }
  };

  useEffect(() => {
    fetchThongTin();
  }, []);

  // 🔹 Cập nhật thông tin
  const handleUpdate = async (e) => {
    e.preventDefault();

    // ⚠️ Kiểm tra định dạng
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.warn("📧 Email không hợp lệ!");
      return;
    }
    if (form.dien_thoai && !/^[0-9]{9,11}$/.test(form.dien_thoai)) {
      toast.warn("📞 Số điện thoại không hợp lệ!");
      return;
    }

    try {
      await axios.put(`${API_URL}/api/giangvien/me`, form, {
        withCredentials: true,
      });
      toast.success("💾 Cập nhật thông tin thành công!");
      setEditMode(false);
      fetchThongTin();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      toast.error("Không thể cập nhật thông tin!");
    }
  };

  if (!gv) return <p style={{ textAlign: "center" }}>⏳ Đang tải thông tin...</p>;

  return (
    <div className="admin-dashboard">
      <ToastContainer position="top-center" autoClose={2500} />

      <h1>👨‍🏫 Thông tin giảng viên</h1>

      {/* 🧩 Thẻ thông tin cơ bản */}
      <div className="profile-card">
        <img
          src={
            preview ||
            gv.anh_dai_dien ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }
          alt="avatar"
          className="avatar"
        />
        <div className="profile-info">
          <h2>{gv.ho_ten}</h2>
          <p><b>Mã GV:</b> {gv.ma_giang_vien}</p>
          <p><b>Khoa:</b> {gv.ten_khoa}</p>
          <p><b>Học vị:</b> {gv.hoc_vi || "—"}</p>
          <p><b>Chức vụ:</b> {gv.chuc_vu || "—"}</p>
        </div>
      </div>

      {/* 🧾 Form cập nhật */}
      <form className="create-form" onSubmit={handleUpdate}>
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
          onChange={(e) => {
            setForm({ ...form, anh_dai_dien: e.target.value });
            setPreview(e.target.value);
          }}
        />

        {editMode ? (
          <button type="submit" className="btn-save">
            💾 Lưu thay đổi
          </button>
        ) : (
          <button type="button" onClick={() => setEditMode(true)}>
            ✏️ Chỉnh sửa
          </button>
        )}
      </form>
    </div>
  );
};

export default ThongTinGiangVien;
