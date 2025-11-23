import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./LichDayGiangVien.css";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

const LichDayGiangVien = () => {
  const [lichDay, setLichDay] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState({
    ngay: "",
    tuan: "",
    mon: "",
    phong: "",
  });
  const [loading, setLoading] = useState(false);

  // 🔹 Lấy lịch dạy giảng viên
  const fetchLichDay = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/thoi-khoa-bieu/giangvien`, {
        withCredentials: true,
      });
      const data = res.data.data || [];
      setLichDay(data);
      setFiltered(data);
    } catch (err) {
      console.error("❌ Lỗi khi tải lịch giảng dạy:", err);
      alert("Không thể tải dữ liệu lịch giảng dạy!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLichDay();
  }, []);

  // 🎯 Lọc dữ liệu
  const handleFilter = () => {
    let result = lichDay;

    if (filter.ngay)
      result = result.filter(
        (x) =>
          dayjs(x.ngay_hoc).format("YYYY-MM-DD") === filter.ngay
      );

    if (filter.tuan)
      result = result.filter((x) =>
        String(x.tuan_hoc).includes(filter.tuan)
      );

    if (filter.mon)
      result = result.filter((x) =>
        x.ten_mon?.toLowerCase().includes(filter.mon.toLowerCase())
      );

    if (filter.phong)
      result = result.filter((x) =>
        x.phong_hoc?.toLowerCase().includes(filter.phong.toLowerCase())
      );

    setFiltered(result);
  };

  const resetFilter = () => {
    setFilter({ ngay: "", tuan: "", mon: "", phong: "" });
    setFiltered(lichDay);
  };

  return (
    <div className="lichday-container">
      <div className="header-bar">
        <h2>📅 Lịch giảng dạy của tôi</h2>
        <button onClick={fetchLichDay}>🔄 Làm mới</button>
      </div>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <div className="filter-item">
          <label>Ngày:</label>
          <input
            type="date"
            value={filter.ngay}
            onChange={(e) =>
              setFilter({ ...filter, ngay: e.target.value })
            }
          />
        </div>

        <div className="filter-item">
          <label>Tuần:</label>
          <input
            type="number"
            placeholder="VD: 10"
            value={filter.tuan}
            onChange={(e) =>
              setFilter({ ...filter, tuan: e.target.value })
            }
          />
        </div>

        <div className="filter-item">
          <label>Môn:</label>
          <input
            type="text"
            placeholder="Tên môn học"
            value={filter.mon}
            onChange={(e) =>
              setFilter({ ...filter, mon: e.target.value })
            }
          />
        </div>

        <div className="filter-item">
          <label>Phòng:</label>
          <input
            type="text"
            placeholder="Phòng học"
            value={filter.phong}
            onChange={(e) =>
              setFilter({ ...filter, phong: e.target.value })
            }
          />
        </div>

        <button onClick={handleFilter} className="btn-filter">
          Lọc
        </button>
        <button onClick={resetFilter} className="btn-reset">
          Xóa lọc
        </button>
      </div>

      {/* Bảng dữ liệu */}
      {loading ? (
        <p style={{ textAlign: "center" }}>⏳ Đang tải dữ liệu...</p>
      ) : (
        <table className="lichday-table">
          <thead>
            <tr>
              <th>📘 Môn học</th>
              <th>🧾 Lớp HP</th>
              <th>📅 Ngày học</th>
              <th>⏰ Tiết</th>
              <th>🏫 Phòng học</th>
              <th>📆 Tuần</th>
              <th>🔖 Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id_tkb}>
                  <td>{item.ten_mon}</td>
                  <td>{item.ma_lop_hp}</td>
                  <td>
                    {item.ngay_hoc
                      ? dayjs(item.ngay_hoc).format("DD/MM/YYYY")
                      : "—"}
                  </td>
                  <td>
                    {item.tiet_bat_dau}–{item.tiet_ket_thuc}
                  </td>
                  <td>{item.phong_hoc || "—"}</td>
                  <td>{item.tuan_hoc || "—"}</td>
                  <td>
                    {item.trang_thai === "hoc" ? (
                      <span className="tag tag-green">Đang học</span>
                    ) : item.trang_thai === "hoanthanh" ? (
                      <span className="tag tag-gray">Hoàn thành</span>
                    ) : (
                      <span className="tag tag-blue">
                        {item.trang_thai || "Khác"}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "#888" }}>
                  Không có dữ liệu phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LichDayGiangVien;
