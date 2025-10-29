import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./LichDayGiangVien.css";

const API_URL = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/thoi-khoa-bieu/giangvien`;

const LichDayGiangVien = () => {
  const [lichDay, setLichDay] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState({
    ngay: "",
    tuan: "",
    mon: "",
    phong: "",
  });

  // 🧠 Lấy token từ localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLichDay();
  }, []);

  const fetchLichDay = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLichDay(res.data.data);
      setFiltered(res.data.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải lịch giảng dạy:", err);
    }
  };

  // 🎯 Lọc dữ liệu
  const handleFilter = () => {
    let result = lichDay;

    if (filter.ngay) {
      result = result.filter((x) => x.ngay_hoc === filter.ngay);
    }
    if (filter.tuan) {
      result = result.filter((x) =>
        String(x.tuan_hoc).includes(filter.tuan)
      );
    }
    if (filter.mon) {
      result = result.filter((x) =>
        x.ten_mon.toLowerCase().includes(filter.mon.toLowerCase())
      );
    }
    if (filter.phong) {
      result = result.filter((x) =>
        x.phong_hoc.toLowerCase().includes(filter.phong.toLowerCase())
      );
    }

    setFiltered(result);
  };

  const resetFilter = () => {
    setFilter({ ngay: "", tuan: "", mon: "", phong: "" });
    setFiltered(lichDay);
  };

  return (
    <div className="lichday-container">
      <h2>📅 Lịch giảng dạy của tôi</h2>

      <div className="filter-bar">
        <div className="filter-item">
          <label>Ngày:</label>
          <input
            type="date"
            value={filter.ngay}
            onChange={(e) => setFilter({ ...filter, ngay: e.target.value })}
          />
        </div>

        <div className="filter-item">
          <label>Tuần:</label>
          <input
            type="number"
            value={filter.tuan}
            onChange={(e) => setFilter({ ...filter, tuan: e.target.value })}
            placeholder="VD: 10"
          />
        </div>

        <div className="filter-item">
          <label>Môn:</label>
          <input
            type="text"
            value={filter.mon}
            onChange={(e) => setFilter({ ...filter, mon: e.target.value })}
            placeholder="Tên môn học"
          />
        </div>

        <div className="filter-item">
          <label>Phòng:</label>
          <input
            type="text"
            value={filter.phong}
            onChange={(e) => setFilter({ ...filter, phong: e.target.value })}
            placeholder="Phòng học"
          />
        </div>

        <button onClick={handleFilter} className="btn-filter">Lọc</button>
        <button onClick={resetFilter} className="btn-reset">Làm mới</button>
      </div>

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
                <td>{dayjs(item.ngay_hoc).format("DD/MM/YYYY")}</td>
                <td>
                  {item.tiet_bat_dau}–{item.tiet_ket_thuc}
                </td>
                <td>{item.phong_hoc}</td>
                <td>{item.tuan_hoc}</td>
                <td>
                  {item.trang_thai === "hoc" ? (
                    <span className="tag tag-green">Đang học</span>
                  ) : (
                    <span className="tag tag-gray">{item.trang_thai}</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", color: "#888" }}>
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LichDayGiangVien;
