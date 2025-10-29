import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThongBaoGiangVien = () => {
  const token = localStorage.getItem("token");
  const [lopList, setLopList] = useState([]);
  const [form, setForm] = useState({
    ma_lop_hp: "",
    tieu_de: "",
    noi_dung: "",
    tep_dinh_kem: null,
  });
  const [sending, setSending] = useState(false);

  // 📘 Lấy danh sách lớp học phần mà giảng viên đang dạy
  const fetchLopHocPhan = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lophocphan/giangvien`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLopList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách lớp học phần:", err);
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
      toast.warn("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("ma_lop_hp", form.ma_lop_hp);
      formData.append("tieu_de", form.tieu_de);
      formData.append("noi_dung", form.noi_dung);
      if (form.tep_dinh_kem) formData.append("tep_dinh_kem", form.tep_dinh_kem);

      await axios.post(`${API_URL}/api/thongbao/giangvien`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("📢 Gửi thông báo thành công!");
      setForm({ ma_lop_hp: "", tieu_de: "", noi_dung: "", tep_dinh_kem: null });
    } catch (err) {
      console.error("❌ Lỗi khi gửi thông báo:", err);
      toast.error("Không thể gửi thông báo. Kiểm tra console để biết chi tiết!");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>📢 Gửi thông báo cho lớp học phần</h3>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label fw-bold">Lớp học phần:</label>
          <select
            className="form-select"
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
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Tiêu đề:</label>
          <input
            type="text"
            className="form-control"
            value={form.tieu_de}
            onChange={(e) => setForm({ ...form, tieu_de: e.target.value })}
            placeholder="Nhập tiêu đề thông báo..."
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Nội dung:</label>
          <textarea
            className="form-control"
            rows="6"
            value={form.noi_dung}
            onChange={(e) => setForm({ ...form, noi_dung: e.target.value })}
            placeholder="Nhập nội dung thông báo..."
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Tệp đính kèm (tuỳ chọn):</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) =>
              setForm({ ...form, tep_dinh_kem: e.target.files[0] })
            }
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending}
        >
          {sending ? "⏳ Đang gửi..." : "📨 Gửi thông báo"}
        </button>
      </form>
    </div>
  );
};

export default ThongBaoGiangVien;
