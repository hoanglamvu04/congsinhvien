import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";
import "../../styles/admin/adminmodal.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DiemRenLuyenManager = () => {
  const [records, setRecords] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [khoas, setKhoas] = useState([]);
  const [nganhs, setNganhs] = useState([]);
  const [lops, setLops] = useState([]);
  const [sinhViens, setSinhViens] = useState([]);

  const [filter, setFilter] = useState({
    khoa: "",
    nganh: "",
    lop: "",
  });

  const [form, setForm] = useState({
    ma_sinh_vien: "",
    ma_hoc_ky: "",
    diem_tu_danh_gia: "",
    diem_co_van: "",
    diem_chung_ket: "",
    xep_loai: "",
  });

  // 🔹 Lấy danh sách điểm rèn luyện
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/diemrenluyen/all`, {
        withCredentials: true,
      });
      setRecords(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách điểm rèn luyện:", err);
      alert("Không thể tải danh sách điểm rèn luyện!");
    }
  };

  // 🔹 Fetch theo chuỗi Khoa → Ngành → Lớp → Sinh viên
  const fetchKhoas = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/khoa`, { withCredentials: true });
      setKhoas(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải khoa:", err);
    }
  };

  const fetchNganhs = async (ma_khoa) => {
    if (!ma_khoa) return setNganhs([]);
    try {
      const res = await axios.get(`${API_URL}/api/nganh/by-khoa/${ma_khoa}`, {
        withCredentials: true,
      });
      setNganhs(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải ngành:", err);
    }
  };

  const fetchLops = async (ma_nganh) => {
    if (!ma_nganh) return setLops([]);
    try {
      const res = await axios.get(`${API_URL}/api/lop/by-nganh/${ma_nganh}`, {
        withCredentials: true,
      });
      setLops(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải lớp:", err);
    }
  };

  const fetchSinhVienByLop = async (ma_lop) => {
    if (!ma_lop) return setSinhViens([]);
    try {
      const res = await axios.get(`${API_URL}/api/sinhvien/by-lop/${ma_lop}`, {
        withCredentials: true,
      });
      setSinhViens(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải sinh viên:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchKhoas();
  }, []);

  // 🔹 Tự động tính điểm chung kết & xếp loại
  useEffect(() => {
    const tuDG = parseFloat(form.diem_tu_danh_gia) || 0;
    const coVan = parseFloat(form.diem_co_van) || 0;
    const chungKet = ((tuDG + coVan) / 2).toFixed(1);

    let xepLoai = "";
    if (chungKet >= 90) xepLoai = "Xuất sắc";
    else if (chungKet >= 80) xepLoai = "Tốt";
    else if (chungKet >= 65) xepLoai = "Khá";
    else if (chungKet >= 50) xepLoai = "Trung bình";
    else xepLoai = "Yếu";

    setForm((f) => ({
      ...f,
      diem_chung_ket: chungKet,
      xep_loai: xepLoai,
    }));
  }, [form.diem_tu_danh_gia, form.diem_co_van]);

  // 🔹 Lưu / Cập nhật điểm rèn luyện
  const handleUpsert = async (e) => {
    e.preventDefault();
    if (!form.ma_sinh_vien || !form.ma_hoc_ky)
      return alert("⚠️ Vui lòng chọn sinh viên và nhập mã học kỳ!");

    try {
      await axios.post(`${API_URL}/api/diemrenluyen`, form, {
        withCredentials: true,
      });
      alert("✅ Lưu điểm thành công!");
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("❌ Lỗi khi lưu điểm:", err);
      alert("Không thể lưu điểm rèn luyện!");
    }
  };

  // 🔹 Xóa bản ghi
  const handleDelete = async (id_drl) => {
    if (!window.confirm("Bạn có chắc muốn xóa bản ghi này?")) return;
    try {
      await axios.delete(`${API_URL}/api/diemrenluyen/${id_drl}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa!");
      fetchData();
    } catch {
      alert("❌ Lỗi khi xóa bản ghi!");
    }
  };

  const filtered = records.filter((r) =>
    [r.ten_sinh_vien, r.ma_sinh_vien, r.ten_hoc_ky].some((f) =>
      f?.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  return (
    <div className="admin-dashboard">
      <h1>🎯 Quản lý điểm rèn luyện</h1>

      {/* Thanh lọc + nút thêm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm sinh viên, học kỳ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          style={{ backgroundColor: "#007bff", color: "white" }}
          onClick={() => {
            setForm({
              ma_sinh_vien: "",
              ma_hoc_ky: "",
              diem_tu_danh_gia: "",
              diem_co_van: "",
              diem_chung_ket: "",
              xep_loai: "",
            });
            setShowModal(true);
          }}
        >
          ➕ Thêm mới
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sinh viên</th>
              <th>MSSV</th>
              <th>Học kỳ</th>
              <th>Tự đánh giá</th>
              <th>Cố vấn</th>
              <th>Chung kết</th>
              <th>Xếp loại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id_drl}>
                  <td>{r.ten_sinh_vien}</td>
                  <td>{r.ma_sinh_vien}</td>
                  <td>{r.ten_hoc_ky}</td>
                  <td>{r.diem_tu_danh_gia ?? "-"}</td>
                  <td>{r.diem_co_van ?? "-"}</td>
                  <td>{r.diem_chung_ket ?? "-"}</td>
                  <td>{r.xep_loai ?? "-"}</td>
                  <td>
                    <button
                      onClick={() => {
                        setForm(r);
                        setShowModal(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(r.id_drl)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm / cập nhật */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal large">
            <h3>📝 Thêm / Cập nhật điểm rèn luyện</h3>
            <form onSubmit={handleUpsert}>
              <div className="form-grid">
                {/* Khoa */}
                <div>
                  <label>Khoa</label>
                  <select
                    value={filter.khoa}
                    onChange={(e) => {
                      const ma_khoa = e.target.value;
                      setFilter({ khoa: ma_khoa, nganh: "", lop: "" });
                      fetchNganhs(ma_khoa);
                      setLops([]);
                      setSinhViens([]);
                    }}
                  >
                    <option value="">-- Chọn khoa --</option>
                    {khoas.map((k) => (
                      <option key={k.ma_khoa} value={k.ma_khoa}>
                        {k.ten_khoa}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ngành */}
                <div>
                  <label>Ngành</label>
                  <select
                    value={filter.nganh}
                    onChange={(e) => {
                      const ma_nganh = e.target.value;
                      setFilter({ ...filter, nganh: ma_nganh, lop: "" });
                      fetchLops(ma_nganh);
                      setSinhViens([]);
                    }}
                  >
                    <option value="">-- Chọn ngành --</option>
                    {nganhs.map((n) => (
                      <option key={n.ma_nganh} value={n.ma_nganh}>
                        {n.ten_nganh}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lớp */}
                <div>
                  <label>Lớp</label>
                  <select
                    value={filter.lop}
                    onChange={(e) => {
                      const ma_lop = e.target.value;
                      setFilter({ ...filter, lop: ma_lop });
                      fetchSinhVienByLop(ma_lop);
                    }}
                  >
                    <option value="">-- Chọn lớp --</option>
                    {lops.map((l) => (
                      <option key={l.ma_lop} value={l.ma_lop}>
                        {l.ten_lop}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sinh viên */}
                <div>
                  <label>Sinh viên</label>
                  <select
                    value={form.ma_sinh_vien}
                    onChange={(e) =>
                      setForm({ ...form, ma_sinh_vien: e.target.value })
                    }
                  >
                    <option value="">-- Chọn sinh viên --</option>
                    {sinhViens.map((sv) => (
                      <option key={sv.ma_sinh_vien} value={sv.ma_sinh_vien}>
                        {sv.ho_ten} ({sv.ma_sinh_vien})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Học kỳ */}
                <div>
                  <label>Mã học kỳ</label>
                  <input
                    type="text"
                    value={form.ma_hoc_ky}
                    onChange={(e) =>
                      setForm({ ...form, ma_hoc_ky: e.target.value })
                    }
                  />
                </div>

                {/* Điểm */}
                <div>
                  <label>Điểm tự đánh giá</label>
                  <input
                    type="number"
                    value={form.diem_tu_danh_gia}
                    onChange={(e) =>
                      setForm({ ...form, diem_tu_danh_gia: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label>Điểm cố vấn</label>
                  <input
                    type="number"
                    value={form.diem_co_van}
                    onChange={(e) =>
                      setForm({ ...form, diem_co_van: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label>Điểm chung kết</label>
                  <input type="number" value={form.diem_chung_ket} disabled />
                </div>

                <div>
                  <label>Xếp loại</label>
                  <input type="text" value={form.xep_loai} disabled />
                </div>
              </div>

              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <button type="submit" style={{ backgroundColor: "#28a745" }}>
                  💾 Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ marginLeft: "10px" }}
                >
                  ❌ Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiemRenLuyenManager;
