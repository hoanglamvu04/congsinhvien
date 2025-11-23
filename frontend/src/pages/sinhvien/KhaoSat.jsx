import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPoll,
  FaCheckCircle,
  FaBan,
  FaReply,
  FaStar,
  FaRegStar,
  FaPaperPlane,
  FaArrowLeft,
  FaUserSecret,
  FaRegClock,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/KhaoSat.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KhaoSat = () => {
  const [khaoSats, setKhaoSats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    diem_danh_gia: 0,
    noi_dung_phan_hoi: "",
    an_danh: false,
  });
  const [daTraLoi, setDaTraLoi] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📘 Lấy danh sách khảo sát
  const fetchKhaoSat = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/khaosat`, {
        withCredentials: true,
      });
      const list = res.data.data || [];
      setKhaoSats(list);

      // cập nhật lại danh sách đã trả lời
      const stored = JSON.parse(localStorage.getItem("daTraLoi") || "[]");
      const valid = stored.filter((id) =>
        list.some((ks) => ks.id_khao_sat === id)
      );
      setDaTraLoi(valid);
    } catch (err) {
      console.error("❌ Lỗi khi tải khảo sát:", err);
      toast.error("Không thể tải danh sách khảo sát!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhaoSat();
  }, []);

  // 🧭 Chọn khảo sát
  const handleSelect = (ks) => {
    if (ks.trang_thai !== "mo") {
      toast.warning("⛔ Khảo sát này đã đóng, bạn không thể trả lời!");
      return;
    }
    setSelected(ks);
    setForm({ diem_danh_gia: 0, noi_dung_phan_hoi: "", an_danh: false });
  };

  // 🧩 Gửi phản hồi
  const guiPhieu = async () => {
    if (!form.diem_danh_gia || !form.noi_dung_phan_hoi.trim()) {
      toast.warning("⚠️ Vui lòng chọn điểm và nhập phản hồi!");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/api/phieutraloi`,
        {
          id_khao_sat: selected.id_khao_sat,
          diem_danh_gia: form.diem_danh_gia,
          noi_dung_phan_hoi: form.noi_dung_phan_hoi.trim(),
          an_danh: form.an_danh,
        },
        { withCredentials: true }
      );
      toast.success("✅ Gửi phản hồi thành công!");
      const newList = [...new Set([...daTraLoi, selected.id_khao_sat])];
      setDaTraLoi(newList);
      localStorage.setItem("daTraLoi", JSON.stringify(newList));
      setSelected(null);
    } catch (err) {
      console.error("❌ Lỗi khi gửi phản hồi:", err);
      toast.error("Không thể gửi phản hồi!");
    }
  };

  return (
    <div className="page-container">
      <ToastContainer position="top-center" autoClose={2200} />

      <h2 className="title-header">
        <FaPoll style={{ color: "#007bff", marginRight: 8 }} />
        Khảo sát & Đánh giá
      </h2>

      {/* 📋 Danh sách khảo sát */}
      {!selected ? (
        <div className="survey-list">
          {loading ? (
            <p className="loading">
              <FaRegClock style={{ marginRight: 6 }} /> Đang tải dữ liệu...
            </p>
          ) : khaoSats.length === 0 ? (
            <p className="no-data">📭 Hiện chưa có khảo sát nào dành cho bạn.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tiêu đề</th>
                  <th>Đối tượng</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {khaoSats.map((ks, i) => (
                  <tr key={ks.id_khao_sat}>
                    <td>{i + 1}</td>
                    <td>{ks.tieu_de}</td>
                    <td>{ks.doi_tuong}</td>
                    <td>
                      {new Date(ks.ngay_bat_dau).toLocaleDateString("vi-VN")} –{" "}
                      {new Date(ks.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      {ks.trang_thai === "mo" ? (
                        <span className="status-open">
                          <FaCheckCircle /> Đang mở
                        </span>
                      ) : (
                        <span className="status-closed">
                          <FaBan /> Đã đóng
                        </span>
                      )}
                    </td>
                    <td>
                      {daTraLoi.includes(ks.id_khao_sat) ? (
                        <span className="answered">
                          <FaCheckCircle /> Đã trả lời
                        </span>
                      ) : (
                        <button
                          className={`btn-reply ${
                            ks.trang_thai !== "mo" ? "disabled" : ""
                          }`}
                          onClick={() => handleSelect(ks)}
                          disabled={ks.trang_thai !== "mo"}
                        >
                          <FaReply style={{ marginRight: 5 }} />
                          Trả lời
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        // 📝 Form trả lời khảo sát
        <div className="survey-form">
          <h4>
            <FaPoll style={{ color: "#007bff", marginRight: 6 }} />
            {selected.tieu_de}
          </h4>
          <p className="survey-content">{selected.noi_dung}</p>

          <label>Điểm đánh giá (1–5):</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                onClick={() => setForm({ ...form, diem_danh_gia: num })}
                className={`star ${
                  num <= form.diem_danh_gia ? "active" : "inactive"
                }`}
              >
                {num <= form.diem_danh_gia ? <FaStar /> : <FaRegStar />}
              </span>
            ))}
          </div>

          <textarea
            rows="5"
            placeholder="Nhập nội dung phản hồi của bạn..."
            value={form.noi_dung_phan_hoi}
            onChange={(e) =>
              setForm({ ...form, noi_dung_phan_hoi: e.target.value })
            }
          ></textarea>

          <div className="anon-toggle">
            <label>
              <input
                type="checkbox"
                checked={form.an_danh}
                onChange={(e) =>
                  setForm({ ...form, an_danh: e.target.checked })
                }
              />
              <FaUserSecret style={{ marginRight: 4 }} />
              Gửi ẩn danh
            </label>
          </div>

          <div className="form-actions">
            <button className="btn-send" onClick={guiPhieu}>
              <FaPaperPlane style={{ marginRight: 4 }} /> Gửi phản hồi
            </button>
            <button className="btn-back" onClick={() => setSelected(null)}>
              <FaArrowLeft style={{ marginRight: 4 }} /> Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KhaoSat;
