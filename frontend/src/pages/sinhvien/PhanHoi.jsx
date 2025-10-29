import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaPlusCircle,
  FaPaperPlane,
  FaTimes,
  FaCommentDots,
  FaClipboardList,
} from "react-icons/fa";
import "../../styles/PhanHoi.css";

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
  const [showModal, setShowModal] = useState(false);

  // 🔄 Lấy danh sách phản hồi
  useEffect(() => {
    const fetchPhanHoi = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/phanhoi/sinhvien`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPhanHoiList(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải phản hồi:", err);
        toast.error("Không thể tải danh sách phản hồi!");
      } finally {
        setLoading(false);
      }
    };
    fetchPhanHoi();
  }, [token]);

  // 📤 Gửi phản hồi
  const guiPhanHoi = async () => {
    if (!form.nguoi_nhan || !form.chu_de || !form.noi_dung) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const confirmSend = window.confirm("Xác nhận gửi phản hồi này?");
    if (!confirmSend) return;

    try {
      await axios.post(`${API_URL}/api/phanhoi`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Gửi phản hồi thành công!");
      setForm({ nguoi_nhan: "", chu_de: "", noi_dung: "" });
      setShowModal(false);

      const res = await axios.get(`${API_URL}/api/phanhoi/sinhvien`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhanHoiList(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi gửi phản hồi:", err);
      toast.error("Không thể gửi phản hồi!");
    }
  };

  return (
    <div className="page-container">
      <ToastContainer position="top-center" autoClose={2000} />

      {/* Header */}
      <div className="feedback-header">
        <h2>
          <FaCommentDots style={{ marginRight: 8, color: "#007bff" }} />
          Phản hồi & Góp ý
        </h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <FaPlusCircle style={{ marginRight: 6 }} />
          Thêm phản hồi mới
        </button>
      </div>

      {/* Modal thêm phản hồi */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              <FaClipboardList style={{ marginRight: 6, color: "#003366" }} />
              Gửi phản hồi mới
            </h3>

            <input
              type="text"
              placeholder="Người nhận (ví dụ: admin, phòng đào tạo...)"
              value={form.nguoi_nhan}
              onChange={(e) =>
                setForm({ ...form, nguoi_nhan: e.target.value })
              }
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

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                <FaTimes style={{ marginRight: 4 }} />
                Hủy
              </button>
              <button className="btn-send" onClick={guiPhanHoi}>
                <FaPaperPlane style={{ marginRight: 4 }} />
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lịch sử phản hồi */}
      <h4 style={{ marginTop: "20px" }}>
        <FaClipboardList style={{ marginRight: 6, color: "#003366" }} />
        Lịch sử phản hồi của bạn
      </h4>

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
                  {item.trang_thai === "choduyet" ? (
                    <span style={{ color: "#ff9800" }}>⏳ Chờ duyệt</span>
                  ) : (
                    <span style={{ color: "green" }}>✅ Đã giải quyết</span>
                  )}
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
