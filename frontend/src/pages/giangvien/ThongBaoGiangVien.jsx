import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThongBaoGiangVien = () => {
  const [lopList, setLopList] = useState([]);
  const [form, setForm] = useState({
    ma_lop_hp: "",
    tieu_de: "",
    noi_dung: "",
    tep_dinh_kem: null,
  });
  const [sending, setSending] = useState(false);

  // 🔹 Lấy danh sách lớp học phần giảng viên đang dạy
  const fetchLopHocPhan = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lophocphan/giangvien`, {
        withCredentials: true,
      });
      setLopList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi lấy lớp học phần:", err);
      toast.error("Không thể tải danh sách lớp học phần!");
    }
  };

  useEffect(() => {
    fetchLopHocPhan();
  }, []);

  // 📤 Gửi thông báo
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ma_lop_hp || !form.tieu_de || !form.noi_dung) {
      toast.warn("⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    // 🧩 Kiểm tra tệp (nếu có)
    if (form.tep_dinh_kem) {
      const file = form.tep_dinh_kem;
      const allowed = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowed.includes(file.type)) {
        toast.error("❌ Chỉ chấp nhận file PDF, JPG, PNG, Word, Excel!");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("❌ Kích thước file tối đa 10MB!");
        return;
      }
    }

    setSending(true);

    try {
      const formData = new FormData();
      formData.append("ma_lop_hp", form.ma_lop_hp);
      formData.append("tieu_de", form.tieu_de);
      formData.append("noi_dung", form.noi_dung);
      if (form.tep_dinh_kem) formData.append("tep_dinh_kem", form.tep_dinh_kem);

      await axios.post(`${API_URL}/api/thongbao/giangvien`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("📢 Gửi thông báo thành công!");
      setForm({ ma_lop_hp: "", tieu_de: "", noi_dung: "", tep_dinh_kem: null });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("❌ Lỗi khi gửi thông báo:", err);
      toast.error("Không thể gửi thông báo, vui lòng thử lại!");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <ToastContainer position="top-center" autoClose={2500} />

      <h1>📢 Gửi thông báo đến sinh viên</h1>

      <form className="create-form" onSubmit={handleSubmit}>
        <label>🎓 Lớp học phần:</label>
        <select
          value={form.ma_lop_hp}
          onChange={(e) => setForm({ ...form, ma_lop_hp: e.target.value })}
        >
          <option value="">-- Chọn lớp học phần --</option>
          {lopList.map((lop) => (
            <option key={lop.ma_lop_hp} value={lop.ma_lop_hp}>
              {lop.ma_lop_hp} - {lop.ten_mon}
            </option>
          ))}
        </select>

        <label>📝 Tiêu đề:</label>
        <input
          type="text"
          placeholder="Nhập tiêu đề thông báo..."
          value={form.tieu_de}
          onChange={(e) => setForm({ ...form, tieu_de: e.target.value })}
        />

        <label>📄 Nội dung:</label>
        <textarea
          rows="6"
          placeholder="Nhập nội dung chi tiết..."
          value={form.noi_dung}
          onChange={(e) => setForm({ ...form, noi_dung: e.target.value })}
        ></textarea>

        <label>📎 Tệp đính kèm (tuỳ chọn):</label>
        <input
          type="file"
          onChange={(e) =>
            setForm({ ...form, tep_dinh_kem: e.target.files[0] })
          }
        />

        <button type="submit" disabled={sending}>
          {sending ? "⏳ Đang gửi..." : "📨 Gửi thông báo"}
        </button>
      </form>
    </div>
  );
};

export default ThongBaoGiangVien;
