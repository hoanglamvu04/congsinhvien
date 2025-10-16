import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PhanHoi = () => {
  const token = localStorage.getItem("token");
  const [phanHoiList, setPhanHoiList] = useState([]);
  const [form, setForm] = useState({
    nguoi_nhan: "",
    chu_de: "",
    noi_dung: "",
  });
  const [loading, setLoading] = useState(true);

  // 🧩 Lấy danh sách phản hồi của sinh viên
  useEffect(() => {
    const fetchPhanHoi = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/phanhoi/sinhvien`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPhanHoiList(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải phản hồi:", err);
        alert("Không thể tải danh sách phản hồi!");
      } finally {
        setLoading(false);
      }
    };
    fetchPhanHoi();
  }, [token]);

  // ✏️ Gửi phản hồi
  const guiPhanHoi = async () => {
    if (!form.nguoi_nhan || !form.chu_de || !form.noi_dung) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    try {
      await axios.post(`${API_URL}/api/phanhoi`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Gửi phản hồi thành công!");
      setForm({ nguoi_nhan: "", chu_de: "", noi_dung: "" });
      const res = await axios.get(`${API_URL}/api/phanhoi/sinhvien`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhanHoiList(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi gửi phản hồi:", err);
      alert("Không thể gửi phản hồi!");
    }
  };

  return (
    <div className="page-container">
      <h2>💬 Phản hồi & góp ý</h2>

      {/* Form gửi phản hồi */}
      <div className="feedback-form">
        <h4>Gửi phản hồi mới</h4>
        <input
          type="text"
          placeholder="Người nhận (ví dụ: admin, phòng đào tạo...)"
          value={form.nguoi_nhan}
          onChange={(e) => setForm({ ...form, nguoi_nhan: e.target.value })}
        />
        <input
          type="text"
          placeholder="Chủ đề phản hồi"
          value={form.chu_de}
          onChange={(e) => setForm({ ...form, chu_de: e.target.value })}
        />
        <textarea
          placeholder="Nội dung phản hồi..."
          rows={4}
          value={form.noi_dung}
          onChange={(e) => setForm({ ...form, noi_dung: e.target.value })}
        ></textarea>
        <button onClick={guiPhanHoi}>📨 Gửi phản hồi</button>
      </div>

      <hr />

      {/* Lịch sử phản hồi */}
      <h4>📜 Lịch sử phản hồi của bạn</h4>
      {loading ? (
        <p>⏳ Đang tải dữ liệu...</p>
      ) : phanHoiList.length === 0 ? (
        <p>⚠️ Chưa có phản hồi nào.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Người nhận</th>
              <th>Chủ đề</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Phản hồi từ người nhận</th>
              <th>Ngày gửi</th>
            </tr>
          </thead>
          <tbody>
            {phanHoiList.map((item, i) => (
              <tr key={item.id_phan_hoi}>
                <td>{i + 1}</td>
                <td>{item.nguoi_nhan}</td>
                <td>{item.chu_de}</td>
                <td>{item.noi_dung}</td>
                <td>
                  {item.trang_thai === "choduyet" ? "⏳ Chờ duyệt" : "✅ Đã giải quyết"}
                </td>
                <td>{item.phan_hoi_tu_nguoi_nhan || "—"}</td>
                <td>
                  {new Date(item.ngay_gui).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PhanHoi;
