import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const QuanLyDiemGV = () => {
  const [lopList, setLopList] = useState([]);
  const [selectedLop, setSelectedLop] = useState("");
  const [diemList, setDiemList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Lấy danh sách lớp giảng viên dạy
  const fetchLopHocPhan = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lophocphan/giangvien`, {
        withCredentials: true,
      });
      setLopList(res.data.data || []);
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách lớp học phần:", error);
      alert("Không thể tải danh sách lớp học phần!");
    }
  };

  // 🔹 Lấy điểm lớp học phần
  const fetchDiemLop = async () => {
    if (!selectedLop) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/diem/giangvien?ma_lop_hp=${selectedLop}`,
        { withCredentials: true }
      );
      setDiemList(res.data.data || []);
    } catch (error) {
      console.error("❌ Lỗi khi lấy điểm lớp học phần:", error);
      alert("Không thể tải danh sách điểm!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Lưu điểm cho 1 sinh viên
  const handleSaveSingle = async (sv) => {
    try {
      await axios.post(`${API_URL}/api/diem/giangvien`, {
        ma_sinh_vien: sv.ma_sinh_vien,
        ma_lop_hp: selectedLop,
        diem_hs1: sv.diem_hs1 || null,
        diem_hs2: sv.diem_hs2 || null,
        diem_thi: sv.diem_thi || null,
        diem_tong: sv.diem_tong || null,
        diem_thang_4: sv.diem_thang_4 || null,
        ket_qua: sv.ket_qua || "",
        trang_thai: "capnhat",
      }, { withCredentials: true });
    } catch (error) {
      console.error("❌ Lỗi khi lưu điểm:", error);
    }
  };

  // 🔹 Lưu toàn bộ danh sách điểm
  const handleSaveAll = async () => {
    if (!selectedLop) return alert("⚠️ Vui lòng chọn lớp học phần!");
    try {
      const payload = diemList.map((sv) => ({
        ma_sinh_vien: sv.ma_sinh_vien,
        ma_lop_hp: selectedLop,
        diem_hs1: sv.diem_hs1 || null,
        diem_hs2: sv.diem_hs2 || null,
        diem_thi: sv.diem_thi || null,
        diem_tong:
          sv.diem_tong ||
          ((Number(sv.diem_hs1) + Number(sv.diem_hs2) + Number(sv.diem_thi)) / 3).toFixed(2),
        diem_thang_4: sv.diem_thang_4 || null,
        ket_qua: sv.ket_qua || "",
        trang_thai: "capnhat",
      }));

      await axios.post(`${API_URL}/api/diem/giangvien/batch`, payload, {
        withCredentials: true,
      });

      alert("✅ Lưu toàn bộ điểm thành công!");
      fetchDiemLop();
    } catch (error) {
      console.error("❌ Lỗi khi lưu điểm:", error);
      alert("Không thể lưu điểm! Xem console để biết chi tiết.");
    }
  };

  // 🔹 Khi chọn lớp
  const handleChangeLop = (e) => setSelectedLop(e.target.value);

  useEffect(() => {
    fetchLopHocPhan();
  }, []);

  useEffect(() => {
    fetchDiemLop();
  }, [selectedLop]);

  return (
    <div className="admin-dashboard">
      <h1>📊 Quản lý điểm sinh viên</h1>

      <div className="filter-bar">
        <select value={selectedLop} onChange={handleChangeLop}>
          <option value="">-- Chọn lớp học phần --</option>
          {lopList.map((lop) => (
            <option key={lop.ma_lop_hp} value={lop.ma_lop_hp}>
              {lop.ma_lop_hp} - {lop.ten_mon}
            </option>
          ))}
        </select>

        <button onClick={fetchDiemLop}>🔄 Làm mới</button>
        {selectedLop && diemList.length > 0 && (
          <button onClick={handleSaveAll} className="btn-save-all">
            💾 Lưu toàn bộ
          </button>
        )}
      </div>

      {loading ? (
        <p>⏳ Đang tải dữ liệu...</p>
      ) : !selectedLop ? (
        <p>👉 Vui lòng chọn lớp học phần để xem danh sách điểm.</p>
      ) : diemList.length === 0 ? (
        <p>⚠️ Không có dữ liệu điểm cho lớp này.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Họ tên</th>
              <th>HS1</th>
              <th>HS2</th>
              <th>Thi</th>
              <th>Tổng</th>
              <th>Thang 4</th>
              <th>Kết quả</th>
              <th>💾</th>
            </tr>
          </thead>
          <tbody>
            {diemList.map((sv, index) => (
              <tr key={index}>
                <td>{sv.ma_sinh_vien}</td>
                <td>{sv.ten_sinh_vien}</td>
                <td>
                  <input
                    type="number"
                    value={sv.diem_hs1 || ""}
                    onChange={(e) =>
                      setDiemList((prev) =>
                        prev.map((x, i) =>
                          i === index ? { ...x, diem_hs1: e.target.value } : x
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={sv.diem_hs2 || ""}
                    onChange={(e) =>
                      setDiemList((prev) =>
                        prev.map((x, i) =>
                          i === index ? { ...x, diem_hs2: e.target.value } : x
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={sv.diem_thi || ""}
                    onChange={(e) =>
                      setDiemList((prev) =>
                        prev.map((x, i) =>
                          i === index ? { ...x, diem_thi: e.target.value } : x
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={
                      sv.diem_tong ||
                      (
                        (Number(sv.diem_hs1) +
                          Number(sv.diem_hs2) +
                          Number(sv.diem_thi)) /
                        3
                      ).toFixed(2)
                    }
                    onChange={(e) =>
                      setDiemList((prev) =>
                        prev.map((x, i) =>
                          i === index ? { ...x, diem_tong: e.target.value } : x
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={sv.diem_thang_4 || ""}
                    onChange={(e) =>
                      setDiemList((prev) =>
                        prev.map((x, i) =>
                          i === index ? { ...x, diem_thang_4: e.target.value } : x
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <select
                    value={sv.ket_qua || ""}
                    onChange={(e) =>
                      setDiemList((prev) =>
                        prev.map((x, i) =>
                          i === index ? { ...x, ket_qua: e.target.value } : x
                        )
                      )
                    }
                  >
                    <option value="">—</option>
                    <option value="Đạt">Đạt</option>
                    <option value="Không đạt">Không đạt</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn-row-save"
                    onClick={() => handleSaveSingle(sv)}
                  >
                    💾
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default QuanLyDiemGV;
