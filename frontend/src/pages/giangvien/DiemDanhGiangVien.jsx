import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DiemDanhGiangVien.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DiemDanhGiangVien = () => {
  const [lopHocPhanList, setLopHocPhanList] = useState([]);
  const [selectedLop, setSelectedLop] = useState("");
  const [buoiList, setBuoiList] = useState([]);
  const [selectedBuoi, setSelectedBuoi] = useState("");
  const [dsSinhVien, setDsSinhVien] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Lấy danh sách lớp học phần giảng viên đang dạy
  const fetchLopHocPhan = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lophocphan`, {
        withCredentials: true,
      });
      setLopHocPhanList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách lớp học phần:", err);
      alert("Không thể tải danh sách lớp học phần!");
    }
  };

  useEffect(() => {
    fetchLopHocPhan();
  }, []);

  // 🔹 Khi chọn lớp → lấy danh sách buổi học
  const fetchBuoiHoc = async () => {
    if (!selectedLop) return;
    try {
      const res = await axios.get(`${API_URL}/api/buoihoc/${selectedLop}`, {
        withCredentials: true,
      });
      setBuoiList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi lấy buổi học:", err);
      alert("Không thể tải buổi học!");
    }
  };

  useEffect(() => {
    fetchBuoiHoc();
  }, [selectedLop]);

  // 🔹 Khi chọn buổi → lấy danh sách sinh viên điểm danh
  const fetchDsSinhVien = async () => {
    if (!selectedBuoi || !selectedLop) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/diemdanh/buoi/${selectedBuoi}`, {
        withCredentials: true,
      });

      if (res.data.data && res.data.data.length > 0) {
        setDsSinhVien(res.data.data);
      } else {
        // Nếu chưa có dữ liệu → lấy danh sách sinh viên đăng ký lớp
        const res2 = await axios.get(`${API_URL}/api/dangky/lop/${selectedLop}`, {
          withCredentials: true,
        });
        setDsSinhVien(
          (res2.data.data || []).map((sv) => ({
            ma_sinh_vien: sv.ma_sinh_vien,
            ho_ten: sv.ho_ten,
            trang_thai: "comat",
            ghi_chu: "",
          }))
        );
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách sinh viên:", err);
      alert("Không thể tải danh sách sinh viên!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDsSinhVien();
  }, [selectedBuoi]);

  // 🔹 Cập nhật trạng thái chọn
  const handleChangeTrangThai = (ma_sinh_vien, trang_thai) => {
    setDsSinhVien((prev) =>
      prev.map((sv) =>
        sv.ma_sinh_vien === ma_sinh_vien ? { ...sv, trang_thai } : sv
      )
    );
  };

  // 🔹 Lưu điểm danh (theo mảng)
  const handleLuu = async () => {
    if (!selectedLop || !selectedBuoi) {
      alert("⚠️ Vui lòng chọn lớp học phần và buổi học!");
      return;
    }

    try {
      const payload = dsSinhVien.map((sv) => ({
        ma_lop_hp: selectedLop,
        id_tkb: selectedBuoi,
        ma_sinh_vien: sv.ma_sinh_vien,
        trang_thai: sv.trang_thai,
      }));

      await axios.post(`${API_URL}/api/diemdanh/batch`, payload, {
        withCredentials: true,
      });

      alert("✅ Lưu điểm danh thành công!");
      fetchDsSinhVien();
    } catch (err) {
      console.error("❌ Lỗi khi lưu điểm danh:", err);
      alert(err.response?.data?.error || "Không thể lưu điểm danh!");
    }
  };

  return (
    <div className="diemdanh-container">
      <div className="header-bar">
        <h2>📋 Điểm danh sinh viên</h2>
        <button onClick={fetchLopHocPhan}>🔄 Làm mới lớp học phần</button>
      </div>

      {/* Bộ lọc lớp và buổi */}
      <div className="diemdanh-filters">
        <div>
          <label>Lớp học phần:</label>
          <select
            value={selectedLop}
            onChange={(e) => {
              setSelectedLop(e.target.value);
              setSelectedBuoi("");
              setDsSinhVien([]);
            }}
          >
            <option value="">-- Chọn lớp học phần --</option>
            {lopHocPhanList.map((lop) => (
              <option key={lop.ma_lop_hp} value={lop.ma_lop_hp}>
                {lop.ma_lop_hp} - {lop.ten_mon}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Buổi học:</label>
          <select
            value={selectedBuoi}
            onChange={(e) => setSelectedBuoi(e.target.value)}
            disabled={!selectedLop}
          >
            <option value="">-- Chọn buổi học --</option>
            {buoiList.map((b) => (
              <option key={b.id_tkb} value={b.id_tkb}>
                {b.ngay_hoc?.substring(0, 10)} (Tiết {b.tiet_bat_dau} - {b.tiet_ket_thuc})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Danh sách sinh viên */}
      {loading ? (
        <p>⏳ Đang tải danh sách sinh viên...</p>
      ) : (
        <>
          {dsSinhVien.length > 0 ? (
            <table className="diemdanh-table">
              <thead>
                <tr>
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {dsSinhVien.map((sv) => (
                  <tr key={sv.ma_sinh_vien}>
                    <td>{sv.ma_sinh_vien}</td>
                    <td>{sv.ho_ten}</td>
                    <td>
                      {["comat", "vang", "tre", "vesom"].map((tt) => (
                        <label key={tt} className={`radio-${tt}`}>
                          <input
                            type="radio"
                            name={sv.ma_sinh_vien}
                            value={tt}
                            checked={sv.trang_thai === tt}
                            onChange={(e) =>
                              handleChangeTrangThai(sv.ma_sinh_vien, e.target.value)
                            }
                          />
                          {tt === "comat"
                            ? "Có mặt"
                            : tt === "vang"
                            ? "Vắng"
                            : tt === "tre"
                            ? "Trễ"
                            : "Về sớm"}
                        </label>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            selectedBuoi && <p>Không có sinh viên nào trong lớp này.</p>
          )}
        </>
      )}

      {/* Nút lưu */}
      {dsSinhVien.length > 0 && (
        <button className="btn-save" onClick={handleLuu}>
          💾 Lưu điểm danh
        </button>
      )}
    </div>
  );
};

export default DiemDanhGiangVien;
