import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DiemManager = () => {
  const [diems, setDiems] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [chiTiet, setChiTiet] = useState([]);
  const [newChiTiet, setNewChiTiet] = useState({
    ten_bai_kt: "",
    loai_he_so: "HS1",
    diem: "",
  });
  const [form, setForm] = useState({
    ma_sinh_vien: "",
    ma_lop_hp: "",
    lan_hoc: 1,
    diem_hs1: "",
    diem_hs2: "",
    diem_thi: "",
    diem_tong: "",
    diem_thang_4: "",
    ket_qua: "",
    trang_thai: "dat",
  });

  const token = localStorage.getItem("token");

  const fetchDiems = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/diem/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiems(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách điểm!");
    }
  };

  const fetchChiTiet = async (id_diem) => {
    try {
       const res = await axios.get(`${API_URL}/api/diem/chi-tiet/${id_diem}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChiTiet(res.data.data || []);
      setExpanded(id_diem);
    } catch {
      alert("Lỗi khi tải chi tiết điểm!");
    }
  };

  const toggleExpand = (id_diem) => {
    if (expanded === id_diem) {
      setExpanded(null);
      setChiTiet([]);
    } else {
      fetchChiTiet(id_diem);
    }
  };

  const handleUpsert = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/diem`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Cập nhật điểm thành công!");
      setForm({
        ma_sinh_vien: "",
        ma_lop_hp: "",
        lan_hoc: 1,
        diem_hs1: "",
        diem_hs2: "",
        diem_thi: "",
        diem_tong: "",
        diem_thang_4: "",
        ket_qua: "",
        trang_thai: "dat",
      });
      fetchDiems();
    } catch (err) {
      alert("❌ Lỗi khi cập nhật điểm!");
    }
  };

  const handleAddChiTiet = async (id_diem) => {
    if (!newChiTiet.ten_bai_kt || !newChiTiet.diem) {
      return alert("Nhập đầy đủ tên bài và điểm!");
    }
    try {
      await axios.post(`${API_URL}/api/diem/chi-tiet`, { ...newChiTiet, id_diem },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Đã thêm bài kiểm tra!");
      setNewChiTiet({ ten_bai_kt: "", loai_he_so: "HS1", diem: "" });
      fetchChiTiet(id_diem);
      updateAverage(id_diem);
    } catch {
      alert("❌ Lỗi khi thêm chi tiết!");
    }
  };

  const handleDeleteChiTiet = async (id_ct, id_diem) => {
    if (!window.confirm("Xóa bài kiểm tra này?")) return;
    try {
      await axios.delete(`${API_URL}/api/diem/chi-tiet/${id_ct}`,  {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchChiTiet(id_diem);
      updateAverage(id_diem);
    } catch {
      alert("❌ Lỗi khi xóa chi tiết!");
    }
  };

  const updateAverage = async (id_diem) => {
    // tính trung bình ở FE (có thể để BE làm)
    const hs1 = chiTiet.filter((c) => c.loai_he_so === "HS1");
    const hs2 = chiTiet.filter((c) => c.loai_he_so === "HS2");
    const thi = chiTiet.filter((c) => c.loai_he_so === "THI");

    const avg = (arr) =>
      arr.length ? arr.reduce((sum, a) => sum + parseFloat(a.diem), 0) / arr.length : 0;

    const diem_hs1 = avg(hs1).toFixed(2);
    const diem_hs2 = avg(hs2).toFixed(2);
    const diem_thi = avg(thi).toFixed(2);
    const diem_tong = (0.3 * diem_hs1 + 0.3 * diem_hs2 + 0.4 * diem_thi).toFixed(2);

    try {
      await axios.post(
        `${API_URL}/api/diem`,
        {
          ...form,
          diem_hs1,
          diem_hs2,
          diem_thi,
          diem_tong,
          ma_sinh_vien: chiTiet[0]?.ma_sinh_vien || "",
          ma_lop_hp: chiTiet[0]?.ma_lop_hp || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDiems();
    } catch {
      console.warn("Không thể cập nhật điểm tổng!");
    }
  };

  useEffect(() => {
    fetchDiems();
  }, []);

  const filtered = diems.filter((d) =>
    [d.ten_sinh_vien, d.ma_sinh_vien, d.ten_mon, d.ma_lop_hp, d.ten_hoc_ky].some((f) =>
      f?.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  return (
    <div className="admin-dashboard">
      <h1>📊 Quản lý điểm sinh viên</h1>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm sinh viên, môn, lớp..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* FORM NHẬP TỔNG HỢP */}
      <form className="create-form" onSubmit={handleUpsert}>
        <h3>➕ Thêm / Cập nhật điểm tổng hợp</h3>
        <input
          type="text"
          placeholder="Mã sinh viên"
          value={form.ma_sinh_vien}
          onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mã lớp học phần"
          value={form.ma_lop_hp}
          onChange={(e) => setForm({ ...form, ma_lop_hp: e.target.value })}
        />
        <input
          type="number"
          placeholder="HS1"
          value={form.diem_hs1}
          onChange={(e) => setForm({ ...form, diem_hs1: e.target.value })}
        />
        <input
          type="number"
          placeholder="HS2"
          value={form.diem_hs2}
          onChange={(e) => setForm({ ...form, diem_hs2: e.target.value })}
        />
        <input
          type="number"
          placeholder="Thi"
          value={form.diem_thi}
          onChange={(e) => setForm({ ...form, diem_thi: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tổng"
          value={form.diem_tong}
          onChange={(e) => setForm({ ...form, diem_tong: e.target.value })}
        />
        <button type="submit">💾 Lưu</button>
      </form>

      {/* BẢNG DANH SÁCH ĐIỂM */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sinh viên</th>
              <th>MSSV</th>
              <th>Môn học</th>
              <th>Lớp HP</th>
              <th>HS1</th>
              <th>HS2</th>
              <th>Thi</th>
              <th>Tổng</th>
              <th>KQ</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map((d) => (
                <React.Fragment key={d.id_diem}>
                  <tr onClick={() => toggleExpand(d.id_diem)} style={{ cursor: "pointer" }}>
                    <td>{d.ten_sinh_vien}</td>
                    <td>{d.ma_sinh_vien}</td>
                    <td>{d.ten_mon}</td>
                    <td>{d.ma_lop_hp}</td>
                    <td>{d.diem_hs1}</td>
                    <td>{d.diem_hs2}</td>
                    <td>{d.diem_thi}</td>
                    <td>{d.diem_tong}</td>
                    <td>{d.ket_qua}</td>
                    <td>{expanded === d.id_diem ? "▲" : "▼"}</td>
                  </tr>

                  {expanded === d.id_diem && (
                    <tr>
                      <td colSpan="10">
                        <div className="sub-table-wrapper">
                          <h4>📄 Chi tiết bài kiểm tra</h4>
                          <table className="sub-table">
                            <thead>
                              <tr>
                                <th>Tên bài kiểm tra</th>
                                <th>Hệ số</th>
                                <th>Điểm</th>
                                <th>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chiTiet.length === 0 ? (
                                <tr>
                                  <td colSpan="4">Chưa có bài kiểm tra</td>
                                </tr>
                              ) : (
                                chiTiet.map((ct) => (
                                  <tr key={ct.id_ct}>
                                    <td>{ct.ten_bai_kt}</td>
                                    <td>{ct.loai_he_so}</td>
                                    <td>{ct.diem}</td>
                                    <td>
                                      <button onClick={() => handleDeleteChiTiet(ct.id_ct, d.id_diem)}>
                                        🗑️
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>

                          <div className="add-detail">
                            <input
                              type="text"
                              placeholder="Tên bài KT"
                              value={newChiTiet.ten_bai_kt}
                              onChange={(e) =>
                                setNewChiTiet({ ...newChiTiet, ten_bai_kt: e.target.value })
                              }
                            />
                            <select
                              value={newChiTiet.loai_he_so}
                              onChange={(e) =>
                                setNewChiTiet({ ...newChiTiet, loai_he_so: e.target.value })
                              }
                            >
                              <option value="HS1">HS1</option>
                              <option value="HS2">HS2</option>
                              <option value="THI">Thi</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Điểm"
                              value={newChiTiet.diem}
                              onChange={(e) =>
                                setNewChiTiet({ ...newChiTiet, diem: e.target.value })
                              }
                            />
                            <button onClick={() => handleAddChiTiet(d.id_diem)}>➕ Thêm</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiemManager;
