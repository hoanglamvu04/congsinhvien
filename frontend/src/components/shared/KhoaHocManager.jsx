import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const HocKyKhoaHocManager = () => {
  /* ======================= KHÓA HỌC ======================= */
  const [khoaList, setKhoaList] = useState([]);
  const [khoaForm, setKhoaForm] = useState({
    ma_khoa_hoc: "",
    ten_khoa_hoc: "",
    nam_bat_dau: "",
    nam_ket_thuc: "",
  });
  const [editKhoa, setEditKhoa] = useState(null);

  // 🔹 Lấy danh sách khóa học
  const fetchKhoaHoc = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/khoahoc-hocky/khoahoc`, {
        withCredentials: true,
      });
      setKhoaList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách khóa học:", err);
      alert("Không thể tải danh sách khóa học!");
    }
  };

  // 🔹 Thêm / Sửa khóa học
  const handleSaveKhoaHoc = async (e) => {
    e.preventDefault();
    if (!khoaForm.ma_khoa_hoc || !khoaForm.ten_khoa_hoc)
      return alert("⚠️ Điền đủ mã và tên khóa học!");
    try {
      if (editKhoa) {
        await axios.put(
          `${API_URL}/api/khoahoc-hocky/khoahoc/${editKhoa}`,
          khoaForm,
          { withCredentials: true }
        );
        alert("✅ Cập nhật khóa học thành công!");
      } else {
        await axios.post(`${API_URL}/api/khoahoc-hocky/khoahoc`, khoaForm, {
          withCredentials: true,
        });
        alert("✅ Thêm khóa học thành công!");
      }
      setKhoaForm({
        ma_khoa_hoc: "",
        ten_khoa_hoc: "",
        nam_bat_dau: "",
        nam_ket_thuc: "",
      });
      setEditKhoa(null);
      fetchKhoaHoc();
    } catch (err) {
      console.error("❌ Lỗi khi lưu khóa học:", err);
      alert(err.response?.data?.error || "Không thể lưu khóa học!");
    }
  };

  const handleEditKhoa = (item) => {
    setEditKhoa(item.ma_khoa_hoc);
    setKhoaForm({
      ma_khoa_hoc: item.ma_khoa_hoc,
      ten_khoa_hoc: item.ten_khoa_hoc,
      nam_bat_dau: item.nam_bat_dau || "",
      nam_ket_thuc: item.nam_ket_thuc || "",
    });
  };

  const handleDeleteKhoa = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/khoahoc-hocky/khoahoc/${id}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa khóa học!");
      fetchKhoaHoc();
    } catch (err) {
      console.error("❌ Lỗi khi xóa khóa học:", err);
      alert(err.response?.data?.error || "Không thể xóa khóa học!");
    }
  };

  /* ======================= HỌC KỲ ======================= */
  const [hocKyList, setHocKyList] = useState([]);
  const [form, setForm] = useState({
    ma_hoc_ky: "",
    ten_hoc_ky: "",
    nam_hoc: "",
    ma_khoa_hoc: "",
    da_khoa: 0,
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
  });
  const [editHK, setEditHK] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Lấy danh sách học kỳ
  const fetchHocKy = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/khoahoc-hocky/hocky`, {
        withCredentials: true,
      });
      setHocKyList(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách học kỳ:", err);
      alert("Không thể tải danh sách học kỳ!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Thêm / Sửa học kỳ
  const handleSaveHocKy = async (e) => {
    e.preventDefault();
    if (!form.ma_hoc_ky || !form.ten_hoc_ky || !form.nam_hoc)
      return alert("⚠️ Điền đủ mã, tên và năm học!");
    try {
      if (editHK) {
        await axios.put(`${API_URL}/api/khoahoc-hocky/hocky/${editHK}`, form, {
          withCredentials: true,
        });
        alert("✅ Cập nhật học kỳ thành công!");
      } else {
        await axios.post(`${API_URL}/api/khoahoc-hocky/hocky`, form, {
          withCredentials: true,
        });
        alert("✅ Thêm học kỳ thành công!");
      }
      setForm({
        ma_hoc_ky: "",
        ten_hoc_ky: "",
        nam_hoc: "",
        ma_khoa_hoc: "",
        da_khoa: 0,
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
      });
      setEditHK(null);
      fetchHocKy();
    } catch (err) {
      console.error("❌ Lỗi khi lưu học kỳ:", err);
      alert(err.response?.data?.error || "Không thể lưu học kỳ!");
    }
  };

  const handleEditHK = (item) => {
    setEditHK(item.ma_hoc_ky);
    setForm({
      ma_hoc_ky: item.ma_hoc_ky,
      ten_hoc_ky: item.ten_hoc_ky,
      nam_hoc: item.nam_hoc,
      ma_khoa_hoc: item.ma_khoa_hoc || "",
      da_khoa: item.da_khoa,
      ngay_bat_dau: item.ngay_bat_dau
        ? item.ngay_bat_dau.split("T")[0]
        : "",
      ngay_ket_thuc: item.ngay_ket_thuc
        ? item.ngay_ket_thuc.split("T")[0]
        : "",
    });
  };

  const handleDeleteHK = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa học kỳ này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/khoahoc-hocky/hocky/${id}`, {
        withCredentials: true,
      });
      alert("🗑️ Đã xóa học kỳ!");
      fetchHocKy();
    } catch (err) {
      console.error("❌ Lỗi khi xóa học kỳ:", err);
      alert(err.response?.data?.error || "Không thể xóa học kỳ!");
    }
  };

  /* ======================= LOAD DATA ======================= */
  useEffect(() => {
    fetchKhoaHoc();
    fetchHocKy();
  }, []);

  /* ======================= UI ======================= */
  return (
    <div className="admin-dashboard">
      <h1>🎓 Quản lý khóa học & học kỳ</h1>

      {/* ----------- KHÓA HỌC ----------- */}
      <div className="section">
        <h2>📘 Quản lý khóa học</h2>
        <form className="create-form" onSubmit={handleSaveKhoaHoc}>
          {!editKhoa && (
            <input
              type="text"
              placeholder="Mã khóa học (VD: K01)"
              value={khoaForm.ma_khoa_hoc}
              onChange={(e) =>
                setKhoaForm({ ...khoaForm, ma_khoa_hoc: e.target.value })
              }
            />
          )}
          <input
            type="text"
            placeholder="Tên khóa học (VD: Khóa 2020–2024)"
            value={khoaForm.ten_khoa_hoc}
            onChange={(e) =>
              setKhoaForm({ ...khoaForm, ten_khoa_hoc: e.target.value })
            }
          />
          <div className="row">
            <input
              type="number"
              placeholder="Năm bắt đầu"
              value={khoaForm.nam_bat_dau}
              onChange={(e) =>
                setKhoaForm({ ...khoaForm, nam_bat_dau: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Năm kết thúc"
              value={khoaForm.nam_ket_thuc}
              onChange={(e) =>
                setKhoaForm({ ...khoaForm, nam_ket_thuc: e.target.value })
              }
            />
          </div>
          <button type="submit">{editKhoa ? "💾 Lưu" : "➕ Thêm"}</button>
          {editKhoa && (
            <button
              type="button"
              onClick={() => {
                setEditKhoa(null);
                setKhoaForm({
                  ma_khoa_hoc: "",
                  ten_khoa_hoc: "",
                  nam_bat_dau: "",
                  nam_ket_thuc: "",
                });
              }}
            >
              Hủy
            </button>
          )}
        </form>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã khóa</th>
              <th>Tên khóa</th>
              <th>Thời gian</th>
              <th>Số học kỳ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {khoaList.length === 0 ? (
              <tr>
                <td colSpan="5">Không có dữ liệu</td>
              </tr>
            ) : (
              khoaList.map((khoa) => (
                <tr key={khoa.ma_khoa_hoc}>
                  <td>{khoa.ma_khoa_hoc}</td>
                  <td>{khoa.ten_khoa_hoc}</td>
                  <td>
                    {khoa.nam_bat_dau} – {khoa.nam_ket_thuc}
                  </td>
                  <td>{khoa.so_hoc_ky || 0}</td>
                  <td>
                    <button onClick={() => handleEditKhoa(khoa)}>✏️</button>
                    <button
                      onClick={() => handleDeleteKhoa(khoa.ma_khoa_hoc)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ----------- HỌC KỲ ----------- */}
      <div className="section">
        <h2>📅 Quản lý học kỳ</h2>
        <form className="create-form" onSubmit={handleSaveHocKy}>
          {!editHK && (
            <input
              type="text"
              placeholder="Mã học kỳ"
              value={form.ma_hoc_ky}
              onChange={(e) => setForm({ ...form, ma_hoc_ky: e.target.value })}
            />
          )}
          <input
            type="text"
            placeholder="Tên học kỳ"
            value={form.ten_hoc_ky}
            onChange={(e) => setForm({ ...form, ten_hoc_ky: e.target.value })}
          />
          <input
            type="text"
            placeholder="Năm học (VD: 2024–2025)"
            value={form.nam_hoc}
            onChange={(e) => setForm({ ...form, nam_hoc: e.target.value })}
          />
          <select
            value={form.ma_khoa_hoc}
            onChange={(e) =>
              setForm({ ...form, ma_khoa_hoc: e.target.value })
            }
          >
            <option value="">— Chọn khóa học —</option>
            {khoaList.map((k) => (
              <option key={k.ma_khoa_hoc} value={k.ma_khoa_hoc}>
                {k.ten_khoa_hoc}
              </option>
            ))}
          </select>

          <label>Ngày bắt đầu</label>
          <input
            type="date"
            value={form.ngay_bat_dau}
            onChange={(e) =>
              setForm({ ...form, ngay_bat_dau: e.target.value })
            }
          />
          <label>Ngày kết thúc</label>
          <input
            type="date"
            value={form.ngay_ket_thuc}
            onChange={(e) =>
              setForm({ ...form, ngay_ket_thuc: e.target.value })
            }
          />
          <select
            value={form.da_khoa}
            onChange={(e) =>
              setForm({ ...form, da_khoa: Number(e.target.value) })
            }
          >
            <option value={0}>Đang mở</option>
            <option value={1}>Đã khóa</option>
          </select>
          <button type="submit">{editHK ? "💾 Lưu" : "➕ Thêm"}</button>
          {editHK && (
            <button
              type="button"
              onClick={() => {
                setEditHK(null);
                setForm({
                  ma_hoc_ky: "",
                  ten_hoc_ky: "",
                  nam_hoc: "",
                  ma_khoa_hoc: "",
                  da_khoa: 0,
                  ngay_bat_dau: "",
                  ngay_ket_thuc: "",
                });
              }}
            >
              Hủy
            </button>
          )}
        </form>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã học kỳ</th>
                <th>Tên học kỳ</th>
                <th>Năm học</th>
                <th>Khóa học</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {hocKyList.length === 0 ? (
                <tr>
                  <td colSpan="8">Không có dữ liệu</td>
                </tr>
              ) : (
                hocKyList.map((hk) => (
                  <tr key={hk.ma_hoc_ky}>
                    <td>{hk.ma_hoc_ky}</td>
                    <td>{hk.ten_hoc_ky}</td>
                    <td>{hk.nam_hoc}</td>
                    <td>{hk.ten_khoa_hoc || "—"}</td>
                    <td>
                      {hk.ngay_bat_dau
                        ? hk.ngay_bat_dau.split("T")[0]
                        : "-"}
                    </td>
                    <td>
                      {hk.ngay_ket_thuc
                        ? hk.ngay_ket_thuc.split("T")[0]
                        : "-"}
                    </td>
                    <td>{hk.da_khoa ? "Đã khóa" : "Đang mở"}</td>
                    <td>
                      <button onClick={() => handleEditHK(hk)}>✏️</button>
                      <button onClick={() => handleDeleteHK(hk.ma_hoc_ky)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HocKyKhoaHocManager;
