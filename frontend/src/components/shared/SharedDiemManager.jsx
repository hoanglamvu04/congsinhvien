import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/adminmodal.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SharedDiemManager = ({ mode = "admin" }) => {
  const [diems, setDiems] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [nganhs, setNganhs] = useState([]);
  const [lops, setLops] = useState([]);
  const [hocKys, setHocKys] = useState([]);

  const [filters, setFilters] = useState({
    ma_khoa: "",
    ma_nganh: "",
    ma_lop: "",
    ma_hoc_ky: "",
  });
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [expanded, setExpanded] = useState(null);
  const [chiTiet, setChiTiet] = useState([]);
  const [lanThi, setLanThi] = useState([]);
  const [newChiTiet, setNewChiTiet] = useState({
    ten_bai_kt: "",
    loai_he_so: "HS1",
    diem: "",
  });

  const [thiLai, setThiLai] = useState({ id_diem: "", diem_thi: "", ghi_chu: "" });
  const [showThiLai, setShowThiLai] = useState(false);

  const [form, setForm] = useState({
    ma_sinh_vien: "",
    ma_lop_hp: "",
    lan_hoc: 1,
    diem_hs1: "",
    diem_hs2: "",
    diem_thi: "",
    diem_tong: "",
    ket_qua: "",
    trang_thai: "dat",
  });

  // 🧠 Load danh mục filter
  const fetchFilters = async () => {
    try {
      const [khoaRes, nganhRes, lopRes, hkRes] = await Promise.all([
        axios.get(`${API_URL}/api/khoa`, { withCredentials: true }),
        axios.get(`${API_URL}/api/nganh`, { withCredentials: true }),
        axios.get(`${API_URL}/api/lop`, { withCredentials: true }),
        axios.get(`${API_URL}/api/hocky`, { withCredentials: true }),
      ]);
      setKhoas(khoaRes.data.data || []);
      setNganhs(nganhRes.data.data || []);
      setLops(lopRes.data.data || []);
      setHocKys(hkRes.data.data || []);
    } catch (err) {
      console.error("⚠️ Lỗi tải danh mục:", err);
    }
  };

  // 📡 Lấy danh sách điểm
  const fetchDiems = async () => {
    try {
      const url =
        mode === "khoa"
          ? `${API_URL}/api/diem/theo-khoa`
          : `${API_URL}/api/diem/all`;

      const res = await axios.get(url, {
        withCredentials: true,
        params: {
          ...filters,
          keyword,
          page,
          limit,
        },
      });

      setDiems(res.data.data || []);
      setTotal(res.data.total || res.data.data?.length || 0);
    } catch (err) {
      console.error("❌ Lỗi khi tải điểm:", err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchDiems();
  }, [page, filters, keyword]);

  // 🔍 Xem chi tiết điểm
  const fetchChiTiet = async (id_diem) => {
    try {
      const [ct, lt] = await Promise.all([
        axios.get(`${API_URL}/api/diem/chi-tiet/${id_diem}`, { withCredentials: true }),
        axios.get(`${API_URL}/api/diem/lan-thi/${id_diem}`, { withCredentials: true }),
      ]);
      setChiTiet(ct.data.data || []);
      setLanThi(lt.data.data || []);
      setExpanded(id_diem);
    } catch (err) {
      alert("❌ Lỗi khi tải chi tiết!");
    }
  };

  const toggleExpand = (id_diem) => {
    if (expanded === id_diem) {
      setExpanded(null);
      setChiTiet([]);
      setLanThi([]);
    } else {
      fetchChiTiet(id_diem);
    }
  };

  // 💾 Lưu điểm tổng hợp
  const handleUpsert = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/diem`, form, { withCredentials: true });
      alert("✅ Cập nhật điểm thành công!");
      setForm({
        ma_sinh_vien: "",
        ma_lop_hp: "",
        lan_hoc: 1,
        diem_hs1: "",
        diem_hs2: "",
        diem_thi: "",
        diem_tong: "",
        ket_qua: "",
        trang_thai: "dat",
      });
      fetchDiems();
    } catch {
      alert("❌ Lỗi khi cập nhật điểm!");
    }
  };

  // ➕ Thêm chi tiết điểm
  const handleAddChiTiet = async (id_diem) => {
    if (!newChiTiet.ten_bai_kt || !newChiTiet.diem)
      return alert("⚠️ Nhập đầy đủ tên bài và điểm!");
    try {
      await axios.post(
        `${API_URL}/api/diem/chi-tiet`,
        { ...newChiTiet, id_diem },
        { withCredentials: true }
      );
      setNewChiTiet({ ten_bai_kt: "", loai_he_so: "HS1", diem: "" });
      fetchChiTiet(id_diem);
    } catch {
      alert("❌ Lỗi khi thêm chi tiết!");
    }
  };

  // ❌ Xóa chi tiết
  const handleDeleteChiTiet = async (id_ct, id_diem) => {
    if (!window.confirm("Xóa bài kiểm tra này?")) return;
    try {
      await axios.delete(`${API_URL}/api/diem/chi-tiet/${id_ct}`, {
        withCredentials: true,
      });
      fetchChiTiet(id_diem);
    } catch {
      alert("❌ Lỗi khi xóa chi tiết!");
    }
  };

  // ➕ Thêm điểm thi lại
  const handleAddThiLai = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/diem/lan-thi/add`, thiLai, {
        withCredentials: true,
      });
      alert("✅ Đã thêm điểm thi lại!");
      setShowThiLai(false);
      fetchDiems();
    } catch {
      alert("❌ Không thể thêm điểm thi lại!");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-dashboard">
      <h1>
        📊 {mode === "khoa" ? "Xem điểm theo khoa" : "Quản lý điểm sinh viên"}
      </h1>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm sinh viên, môn, lớp..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        {mode !== "khoa" && (
          <select
            value={filters.ma_khoa}
            onChange={(e) =>
              setFilters({
                ...filters,
                ma_khoa: e.target.value,
                ma_nganh: "",
                ma_lop: "",
              })
            }
          >
            <option value="">Tất cả khoa</option>
            {khoas.map((k) => (
              <option key={k.ma_khoa} value={k.ma_khoa}>
                {k.ten_khoa}
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.ma_nganh}
          onChange={(e) =>
            setFilters({ ...filters, ma_nganh: e.target.value })
          }
        >
          <option value="">Tất cả ngành</option>
          {nganhs
            .filter(
              (n) => !filters.ma_khoa || n.ma_khoa === filters.ma_khoa
            )
            .map((n) => (
              <option key={n.ma_nganh} value={n.ma_nganh}>
                {n.ten_nganh}
              </option>
            ))}
        </select>

        <select
          value={filters.ma_hoc_ky}
          onChange={(e) =>
            setFilters({ ...filters, ma_hoc_ky: e.target.value })
          }
        >
          <option value="">Tất cả học kỳ</option>
          {hocKys.map((h) => (
            <option key={h.ma_hoc_ky} value={h.ma_hoc_ky}>
              {h.ten_hoc_ky} ({h.nam_hoc})
            </option>
          ))}
        </select>
      </div>

      {/* Form nhập điểm tổng hợp */}
      {mode === "admin" && (
        <form className="create-form" onSubmit={handleUpsert}>
          <h3>➕ Thêm / Cập nhật điểm tổng hợp</h3>
          <input
            type="text"
            placeholder="Mã sinh viên"
            value={form.ma_sinh_vien}
            onChange={(e) =>
              setForm({ ...form, ma_sinh_vien: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Mã lớp học phần"
            value={form.ma_lop_hp}
            onChange={(e) =>
              setForm({ ...form, ma_lop_hp: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="HS1"
            value={form.diem_hs1}
            onChange={(e) =>
              setForm({ ...form, diem_hs1: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="HS2"
            value={form.diem_hs2}
            onChange={(e) =>
              setForm({ ...form, diem_hs2: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Thi"
            value={form.diem_thi}
            onChange={(e) =>
              setForm({ ...form, diem_thi: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Tổng"
            value={form.diem_tong}
            onChange={(e) =>
              setForm({ ...form, diem_tong: e.target.value })
            }
          />
          <button type="submit">💾 Lưu</button>
        </form>
      )}

      {/* Danh sách điểm */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sinh viên</th>
              <th>MSSV</th>
              <th>Môn học</th>
              <th>Học kỳ</th>
              <th>HS1</th>
              <th>HS2</th>
              <th>Thi</th>
              <th>Tổng</th>
              <th>Kết quả</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {diems.length === 0 ? (
              <tr>
                <td colSpan="10">Không có dữ liệu</td>
              </tr>
            ) : (
              diems.map((d) => (
                <React.Fragment key={d.id_diem}>
                  <tr
                    onClick={() => toggleExpand(d.id_diem)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{d.ten_sinh_vien}</td>
                    <td>{d.ma_sinh_vien}</td>
                    <td>{d.ten_mon}</td>
                    <td>{d.ten_hoc_ky}</td>
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
                                <th>Tên bài</th>
                                <th>Hệ số</th>
                                <th>Điểm</th>
                                {mode === "admin" && <th></th>}
                              </tr>
                            </thead>
                            <tbody>
                              {chiTiet.length === 0 ? (
                                <tr>
                                  <td colSpan={mode === "admin" ? 4 : 3}>
                                    Chưa có bài kiểm tra
                                  </td>
                                </tr>
                              ) : (
                                chiTiet.map((ct) => (
                                  <tr key={ct.id_ct}>
                                    <td>{ct.ten_bai_kt}</td>
                                    <td>{ct.loai_he_so}</td>
                                    <td>{ct.diem}</td>
                                    {mode === "admin" && (
                                      <td>
                                        <button
                                          onClick={() =>
                                            handleDeleteChiTiet(
                                              ct.id_ct,
                                              d.id_diem
                                            )
                                          }
                                        >
                                          🗑️
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>

                          {mode === "admin" && (
                            <div className="add-detail">
                              <input
                                type="text"
                                placeholder="Tên bài KT"
                                value={newChiTiet.ten_bai_kt}
                                onChange={(e) =>
                                  setNewChiTiet({
                                    ...newChiTiet,
                                    ten_bai_kt: e.target.value,
                                  })
                                }
                              />
                              <select
                                value={newChiTiet.loai_he_so}
                                onChange={(e) =>
                                  setNewChiTiet({
                                    ...newChiTiet,
                                    loai_he_so: e.target.value,
                                  })
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
                                  setNewChiTiet({
                                    ...newChiTiet,
                                    diem: e.target.value,
                                  })
                                }
                              />
                              <button
                                onClick={() => handleAddChiTiet(d.id_diem)}
                              >
                                ➕ Thêm
                              </button>
                            </div>
                          )}

                          <h4 style={{ marginTop: "15px" }}>🕓 Lịch sử thi lại</h4>
                          <table className="sub-table">
                            <thead>
                              <tr>
                                <th>Lần thi</th>
                                <th>Điểm</th>
                                <th>Ngày thi</th>
                                <th>Ghi chú</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lanThi.length === 0 ? (
                                <tr>
                                  <td colSpan="4">Chưa có thi lại</td>
                                </tr>
                              ) : (
                                lanThi.map((lt) => (
                                  <tr key={lt.lan_thi}>
                                    <td>{lt.lan_thi}</td>
                                    <td>{lt.diem_thi}</td>
                                    <td>
                                      {new Date(
                                        lt.ngay_thi
                                      ).toLocaleDateString()}
                                    </td>
                                    <td>{lt.ghi_chu || "-"}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              ◀ Trước
            </button>
            <span>
              Trang {page}/{totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Sau ▶
            </button>
          </div>
        )}
      </div>

      {/* Modal thi lại */}
      {showThiLai && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>➕ Nhập điểm thi lại</h3>
            <form onSubmit={handleAddThiLai}>
              <input
                type="text"
                placeholder="ID điểm (id_diem)"
                value={thiLai.id_diem}
                onChange={(e) =>
                  setThiLai({ ...thiLai, id_diem: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Điểm thi lại"
                value={thiLai.diem_thi}
                onChange={(e) =>
                  setThiLai({ ...thiLai, diem_thi: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Ghi chú (nếu có)"
                value={thiLai.ghi_chu}
                onChange={(e) =>
                  setThiLai({ ...thiLai, ghi_chu: e.target.value })
                }
              />
              <div style={{ marginTop: "10px" }}>
                <button type="submit">💾 Lưu</button>
                <button
                  type="button"
                  onClick={() => setShowThiLai(false)}
                  style={{ marginLeft: "8px" }}
                >
                  ❌ Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedDiemManager;
