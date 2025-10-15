import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SinhVienDangKy = () => {
  const [lopHocPhanList, setLopHocPhanList] = useState([]);
  const [daDangKy, setDaDangKy] = useState([]);
  const [keyword, setKeyword] = useState("");
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  // 🔄 Lấy danh sách lớp học phần đang mở
  const fetchLHP = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/lophocphan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : res.data;
      setLopHocPhanList(data.filter((x) => x.trang_thai === "dangmo"));
    } catch (err) {
      alert("Lỗi khi tải lớp học phần!");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Lấy danh sách môn đã đăng ký
  const fetchDaDangKy = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/dangky`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDaDangKy(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLHP();
    fetchDaDangKy();
  }, []);

  // 🧾 Đăng ký
  const handleDangKy = async (ma_lop_hp) => {
    try {
      await axios.post(
        `${API_URL}/api/dangky`,
        { ma_lop_hp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Đăng ký thành công!");
      fetchDaDangKy();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi đăng ký!");
    }
  };

  // ❌ Hủy đăng ký
  const handleHuy = async (ma_lop_hp) => {
    if (!window.confirm("Bạn có chắc muốn hủy đăng ký lớp này không?")) return;
    try {
      await axios.put(
        `${API_URL}/api/dangky/huy/${ma_lop_hp}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Hủy đăng ký thành công!");
      fetchDaDangKy();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi hủy đăng ký!");
    }
  };

  const daDangKyMa = daDangKy.map((dk) => dk.ma_lop_hp);

  return (
    <div className="admin-dashboard">
      <h1>🧾 Đăng ký môn học</h1>

      {/* 🔍 Tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm lớp, môn, giảng viên..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 📋 Danh sách lớp học phần */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã lớp HP</th>
                <th>Môn học</th>
                <th>Giảng viên</th>
                <th>Học kỳ</th>
                <th>Phòng</th>
                <th>Lịch học</th>
                <th>Đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {lopHocPhanList
                .filter((i) =>
                  keyword
                    ? i.ten_mon?.toLowerCase().includes(keyword.toLowerCase()) ||
                      i.ten_giang_vien?.toLowerCase().includes(keyword.toLowerCase())
                    : true
                )
                .map((item) => (
                  <tr key={item.ma_lop_hp}>
                    <td>{item.ma_lop_hp}</td>
                    <td>{item.ten_mon}</td>
                    <td>{item.ten_giang_vien || "-"}</td>
                    <td>{item.ten_hoc_ky}</td>
                    <td>{item.phong_hoc}</td>
                    <td>{item.lich_hoc}</td>
                    <td>
                      {daDangKyMa.includes(item.ma_lop_hp) ? (
                        <button
                          style={{ background: "#ef4444" }}
                          onClick={() => handleHuy(item.ma_lop_hp)}
                        >
                          ❌ Hủy
                        </button>
                      ) : (
                        <button
                          style={{ background: "#1e40af" }}
                          onClick={() => handleDangKy(item.ma_lop_hp)}
                        >
                          ➕ ĐK
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 📚 Danh sách đã đăng ký */}
      <h2 style={{ marginTop: "40px", color: "#1e3a8a" }}>📚 Môn đã đăng ký</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Môn học</th>
            <th>Giảng viên</th>
            <th>Học kỳ</th>
            <th>Phòng học</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {daDangKy.length === 0 ? (
            <tr>
              <td colSpan="6">Chưa có môn nào</td>
            </tr>
          ) : (
            daDangKy.map((item) => (
              <tr key={item.ma_lop_hp}>
                <td>{item.ten_mon}</td>
                <td>{item.giang_vien}</td>
                <td>{item.ten_hoc_ky}</td>
                <td>{item.phong_hoc}</td>
                <td>Đang học</td>
                <td>
                  <button onClick={() => handleHuy(item.ma_lop_hp)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SinhVienDangKy;
