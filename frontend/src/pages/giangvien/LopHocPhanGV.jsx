import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./LopHocPhanGV.css";

const LopHocPhanGV = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLopHocPhan();
  }, []);

  const fetchLopHocPhan = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lophocphan/giangvien", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setList(res.data.data);
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách lớp học phần:", error);
    }
  };

  const filtered = list.filter(
    (item) =>
      item.ma_lop_hp.toLowerCase().includes(search.toLowerCase()) ||
      item.ten_mon.toLowerCase().includes(search.toLowerCase()) ||
      item.ten_hoc_ky.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lop-hoc-phan-container">
      <h2>📘 Danh sách lớp học phần đang giảng dạy</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Tìm theo mã lớp, môn học, học kỳ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="lop-hoc-phan-table">
        <thead>
          <tr>
            <th>Mã lớp HP</th>
            <th>Môn học</th>
            <th>Học kỳ</th>
            <th>Phòng học</th>
            <th>Trạng thái</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <tr key={item.ma_lop_hp}>
                <td>{item.ma_lop_hp}</td>
                <td>{item.ten_mon}</td>
                <td>{item.ten_hoc_ky}</td>
                <td>{item.phong_hoc || "—"}</td>
                <td>
                  {item.trang_thai === "dangday" ? (
                    <span className="tag tag-green">Đang dạy</span>
                  ) : item.trang_thai === "daketthuc" ? (
                    <span className="tag tag-gray">Đã kết thúc</span>
                  ) : (
                    <span className="tag tag-blue">Đang mở</span>
                  )}
                </td>
                <td>
                  <Link to={`/giangvien/lophocphan/${item.ma_lop_hp}`} className="detail-btn">
                    Xem
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", color: "#888" }}>
                Không có lớp học phần nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LopHocPhanGV;
