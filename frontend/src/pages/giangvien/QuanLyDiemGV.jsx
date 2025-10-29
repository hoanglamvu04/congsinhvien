import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const QuanLyDiemGV = () => {
  const [lopList, setLopList] = useState([]);
  const [selectedLop, setSelectedLop] = useState("");
  const [diemList, setDiemList] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // 📘 Lấy danh sách lớp học phần mà giảng viên dạy
  const fetchLopHocPhan = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/lophocphan/giangvien`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLopList(res.data.data || []); // ✅ lấy toàn bộ kết quả trả về, không lọc nữa
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách lớp học phần:", error);
  }
};


  // 📘 Lấy danh sách điểm sinh viên trong lớp học phần
  const fetchDiemLop = async () => {
    if (!selectedLop) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/diem/giangvien?ma_lop_hp=${selectedLop}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiemList(res.data.data || []);
    } catch (error) {
      console.error("❌ Lỗi khi lấy điểm lớp học phần:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📤 Lưu điểm cho sinh viên
  const handleSave = async (sv) => {
    try {
      await axios.post(
        `${API_URL}/api/diem/giangvien`,
        {
          ma_sinh_vien: sv.ma_sinh_vien,
          ma_lop_hp: selectedLop,
          diem_hs1: sv.diem_hs1 || null,
          diem_hs2: sv.diem_hs2 || null,
          diem_thi: sv.diem_thi || null,
          diem_tong: sv.diem_tong || null,
          diem_thang_4: sv.diem_thang_4 || null,
          ket_qua: sv.ket_qua || "",
          trang_thai: "capnhat",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Cập nhật điểm thành công!");
      fetchDiemLop();
    } catch (error) {
      console.error("❌ Lỗi khi lưu điểm:", error);
      alert("Lỗi khi lưu điểm, xem console để biết thêm chi tiết!");
    }
  };

  // Khi chọn lớp học phần
  const handleChange = (e) => {
    setSelectedLop(e.target.value);
  };

  // Lấy danh sách lớp ngay khi load
  useEffect(() => {
    fetchLopHocPhan();
  }, []);

  // Lấy điểm khi chọn lớp
  useEffect(() => {
    fetchDiemLop();
  }, [selectedLop]);

  return (
    <div className="container mt-4">
      <h3>📘 Quản lý điểm sinh viên</h3>

      <div className="filter-section mb-3">
        <label htmlFor="lop">Lớp học phần: </label>
        <select
          id="lop"
          className="form-select"
          value={selectedLop}
          onChange={handleChange}
        >
          <option value="">-- Chọn lớp học phần --</option>
          {lopList.map((lop) => (
            <option key={lop.ma_lop_hp} value={lop.ma_lop_hp}>
              {lop.ma_lop_hp} - {lop.ten_mon}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>⏳ Đang tải dữ liệu...</p>
      ) : diemList.length === 0 ? (
        <p>Không có dữ liệu điểm cho lớp này.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-primary">
              <tr>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Điểm HS1</th>
                <th>Điểm HS2</th>
                <th>Điểm Thi</th>
                <th>Điểm Tổng</th>
                <th>Thang 4</th>
                <th>Kết quả</th>
                <th>Thao tác</th>
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
                      className="form-control"
                      value={sv.diem_hs1 || ""}
                      onChange={(e) =>
                        setDiemList((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, diem_hs1: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={sv.diem_hs2 || ""}
                      onChange={(e) =>
                        setDiemList((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, diem_hs2: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={sv.diem_thi || ""}
                      onChange={(e) =>
                        setDiemList((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, diem_thi: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={sv.diem_tong || ""}
                      onChange={(e) =>
                        setDiemList((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, diem_tong: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={sv.diem_thang_4 || ""}
                      onChange={(e) =>
                        setDiemList((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, diem_thang_4: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={sv.ket_qua || ""}
                      onChange={(e) =>
                        setDiemList((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, ket_qua: e.target.value }
                              : item
                          )
                        )
                      }
                    >
                      <option value="">--</option>
                      <option value="Đạt">Đạt</option>
                      <option value="Không đạt">Không đạt</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleSave(sv)}
                    >
                      💾 Lưu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuanLyDiemGV;
