import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBullhorn,
  FaUserCircle,
  FaUsers,
  FaCalendarAlt,
  FaPaperclip,
  FaTimes,
  FaRegClock,
  FaInfoCircle,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/ThongBao.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThongBao = () => {
  const [thongBaoList, setThongBaoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // 📬 Lấy danh sách thông báo
  const fetchThongBao = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/thongbao`, {
        withCredentials: true,
      });
      setThongBaoList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải thông báo:", err);
      toast.error("Không thể tải thông báo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThongBao();
  }, []);

  // ⛔ Đóng modal khi click ngoài hoặc nhấn ESC
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (loading)
    return (
      <p className="loading">
        <FaRegClock style={{ marginRight: 6 }} /> Đang tải thông báo...
      </p>
    );

  return (
    <div className="page-container">
      <ToastContainer position="top-center" autoClose={2000} />

      <h2 className="notice-title">
        <FaBullhorn style={{ color: "#007bff", marginRight: 8 }} />
        Thông báo
      </h2>

      {thongBaoList.length === 0 ? (
        <p className="no-data">📭 Không có thông báo nào.</p>
      ) : (
        <div className="table-wrapper">
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
                  className="row-click"
                >
                  <td className="tb-title">
                    <FaInfoCircle
                      style={{ color: "#007bff", marginRight: 6 }}
                    />
                    {tb.tieu_de}
                  </td>
                  <td>
                    {tb.doi_tuong === "tatca" ? (
                      <>
                        <FaBullhorn
                          style={{ color: "#007bff", marginRight: 4 }}
                        />
                        Toàn trường
                      </>
                    ) : tb.doi_tuong === "lop" ? (
                      <>
                        <FaUsers
                          style={{ color: "#28a745", marginRight: 4 }}
                        />
                        Lớp {tb.ma_doi_tuong}
                      </>
                    ) : (
                      <>
                        <FaUserCircle
                          style={{ color: "#6c757d", marginRight: 4 }}
                        />
                        Cá nhân
                      </>
                    )}
                  </td>
                  <td>
                    <FaCalendarAlt
                      style={{ color: "#ffc107", marginRight: 4 }}
                    />
                    {new Date(tb.ngay_gui).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{tb.nguoi_gui}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🧾 Modal xem chi tiết */}
      {selected && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target.classList.contains("modal-overlay") && setSelected(null)
          }
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FaBullhorn style={{ color: "#007bff", marginRight: 8 }} />
                {selected.tieu_de}
              </h3>
              <FaTimes className="close-icon" onClick={() => setSelected(null)} />
            </div>

            <div className="modal-body">
              <p>
                <strong>Người gửi:</strong> {selected.nguoi_gui}
              </p>
              <p>
                <strong>Ngày gửi:</strong>{" "}
                {new Date(selected.ngay_gui).toLocaleString("vi-VN")}
              </p>
              <hr />
              <p className="tb-content">{selected.noi_dung}</p>

              {selected.tep_dinh_kem && (
                <p className="tb-file">
                  <FaPaperclip style={{ marginRight: 6 }} />
                  <a
                    href={selected.tep_dinh_kem}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Xem tệp đính kèm
                  </a>
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-close" onClick={() => setSelected(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThongBao;
