import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThongBao = () => {
  const [thongBaoList, setThongBaoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/thongbao`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setThongBaoList(res.data.data || []);
      } catch (err) {
        console.error(err);
        alert("❌ Không thể tải thông báo!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>⏳ Đang tải thông báo...</p>;

  return (
    <div className="page-container">
      <h2>📢 Thông báo</h2>

      {thongBaoList.length === 0 ? (
        <p>⚠️ Không có thông báo nào.</p>
      ) : (
        <div className="notice-list">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Đối tượng</th>
                <th>Ngày gửi</th>
                <th>Người gửi</th>
              </tr>
            </thead>
            <tbody>
              {thongBaoList.map((tb) => (
                <tr
                  key={tb.id_thong_bao}
                  onClick={() => setSelected(tb)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{tb.tieu_de}</td>
                  <td>
                    {tb.doi_tuong === "tatca"
                      ? "📢 Toàn trường"
                      : tb.doi_tuong === "lop"
                      ? `👥 Lớp ${tb.ma_doi_tuong}`
                      : "👤 Cá nhân"}
                  </td>
                  <td>
                    {new Date(tb.ngay_gui).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td>{tb.nguoi_gui}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="notice-detail">
          <h3>{selected.tieu_de}</h3>
          <p><strong>Người gửi:</strong> {selected.nguoi_gui}</p>
          <p><strong>Ngày gửi:</strong> {new Date(selected.ngay_gui).toLocaleString("vi-VN")}</p>
          <hr />
          <p>{selected.noi_dung}</p>
          {selected.tep_dinh_kem && (
            <p>
              📎 <a href={selected.tep_dinh_kem} target="_blank" rel="noreferrer">Xem tệp đính kèm</a>
            </p>
          )}
          <button onClick={() => setSelected(null)}>⬅️ Quay lại</button>
        </div>
      )}
    </div>
  );
};

export default ThongBao;
