import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const KhaoSat = () => {
  const token = localStorage.getItem("token");
  const [khaoSats, setKhaoSats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    diem_danh_gia: 0,
    noi_dung_phan_hoi: "",
    an_danh: false,
  });
  const [daTraLoi, setDaTraLoi] = useState([]);

  // 📘 Lấy danh sách khảo sát
  useEffect(() => {
    const fetchKhaoSat = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/khaosat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKhaoSats(res.data.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải khảo sát:", err);
        alert("Không thể tải danh sách khảo sát!");
      }
    };
    fetchKhaoSat();
  }, [token]);

  // 📋 Lấy danh sách khảo sát đã trả lời (từ BE hoặc tạm lưu FE)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("daTraLoi") || "[]");
    setDaTraLoi(stored);
  }, []);

  const handleSelect = (ks) => {
    setSelected(ks);
    setForm({ diem_danh_gia: 0, noi_dung_phan_hoi: "", an_danh: false });
  };

  // 🧩 Gửi phản hồi khảo sát
  const guiPhieu = async () => {
    if (!form.diem_danh_gia || !form.noi_dung_phan_hoi) {
      alert("Vui lòng chọn điểm và nhập nội dung phản hồi!");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/api/phieutraloi`,
        {
          id_khao_sat: selected.id_khao_sat,
          diem_danh_gia: form.diem_danh_gia,
          noi_dung_phan_hoi: form.noi_dung_phan_hoi,
          an_danh: form.an_danh,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Gửi phản hồi thành công!");
      const newList = [...daTraLoi, selected.id_khao_sat];
      setDaTraLoi(newList);
      localStorage.setItem("daTraLoi", JSON.stringify(newList));
      setSelected(null);
    } catch (err) {
      console.error("❌ Lỗi khi gửi phản hồi:", err);
      alert("Không thể gửi phản hồi!");
    }
  };

  return (
    <div className="page-container">
      <h2>🧾 Khảo sát & Đánh giá</h2>

      {/* Danh sách khảo sát */}
      {!selected ? (
        <div className="survey-list">
          {khaoSats.length === 0 ? (
            <p>Hiện không có khảo sát nào dành cho bạn.</p>
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
                      {new Date(ks.ngay_bat_dau).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(ks.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{ks.trang_thai === "mo" ? "🟢 Đang mở" : "🔴 Đã đóng"}</td>
                    <td>
                      {daTraLoi.includes(ks.id_khao_sat) ? (
                        <span>✅ Đã trả lời</span>
                      ) : (
                        <button onClick={() => handleSelect(ks)}>Trả lời</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        // Form trả lời khảo sát
        <div className="survey-form">
          <h4>🗒️ Khảo sát: {selected.tieu_de}</h4>
          <p className="survey-content">{selected.noi_dung}</p>

          <label>Điểm đánh giá (1–5):</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                onClick={() => setForm({ ...form, diem_danh_gia: num })}
                style={{
                  cursor: "pointer",
                  fontSize: "1.5em",
                  color: num <= form.diem_danh_gia ? "#ffc107" : "#ccc",
                }}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            rows="4"
            placeholder="Nhập nội dung phản hồi của bạn..."
            value={form.noi_dung_phan_hoi}
            onChange={(e) => setForm({ ...form, noi_dung_phan_hoi: e.target.value })}
          ></textarea>

          <div className="anon-toggle">
            <input
              type="checkbox"
              checked={form.an_danh}
              onChange={(e) => setForm({ ...form, an_danh: e.target.checked })}
            />
            <label>Gửi ẩn danh</label>
          </div>

          <button onClick={guiPhieu}>📨 Gửi phản hồi</button>
          <button className="back-btn" onClick={() => setSelected(null)}>
            ← Quay lại
          </button>
        </div>
      )}
    </div>
  );
};

export default KhaoSat;
