import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ThoiKhoaBieuManager = () => {
  const [tkbs, setTkbs] = useState([]);
  const [lopList, setLopList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [buoiHocList, setBuoiHocList] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    ma_lop_hp: "",
    thu_trong_tuan: "",
    tiet_bat_dau: "",
    tiet_ket_thuc: "",
    phong_hoc: "",
    trang_thai: "hoc",
    tuan_bat_dau: "",
    tuan_ket_thuc: "",
  });

  // 🔹 Lấy danh sách lớp học phần & thời khóa biểu
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tkbRes, lopRes] = await Promise.all([
        axios.get(`${API_URL}/api/thoi-khoa-bieu`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { keyword },
        }),
        axios.get(`${API_URL}/api/lophocphan`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTkbs(tkbRes.data.data || []);
      setLopList(lopRes.data.data || lopRes.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải dữ liệu thời khóa biểu!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Lấy buổi học theo lớp HP
  const fetchBuoiHoc = async (ma_lop_hp) => {
    try {
      const res = await axios.get(`${API_URL}/api/buoihoc/${ma_lop_hp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuoiHocList(res.data.data || []);
      setExpanded(ma_lop_hp);
    } catch {
      alert("❌ Lỗi khi tải buổi học!");
    }
  };

  useEffect(() => {
    fetchData();
  }, [keyword]);

  const handleToggle = (ma_lop_hp) => {
    if (expanded === ma_lop_hp) {
      setExpanded(null);
      setBuoiHocList([]);
    } else {
      fetchBuoiHoc(ma_lop_hp);
    }
  };

  // ➕ Thêm hoặc ✏️ Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.ma_lop_hp || !form.thu_trong_tuan || !form.tiet_bat_dau || !form.tiet_ket_thuc)
        return alert("Vui lòng điền đủ thông tin!");

      if (editing) {
        await axios.put(`${API_URL}/api/thoi-khoa-bieu/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật thời khóa biểu thành công!");
      } else {
        await axios.post(`${API_URL}/api/thoi-khoa-bieu`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm thời khóa biểu và sinh buổi học thành công!");
      }

      setForm({
        ma_lop_hp: "",
        thu_trong_tuan: "",
        tiet_bat_dau: "",
        tiet_ket_thuc: "",
        phong_hoc: "",
        trang_thai: "hoc",
        tuan_bat_dau: "",
        tuan_ket_thuc: "",
      });
      setEditing(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Lỗi khi lưu thời khóa biểu!");
    }
  };

  // 🗑️ Xóa TKB
  const handleDelete = async (id_tkb) => {
    if (!window.confirm("Bạn có chắc muốn xóa thời khóa biểu này không?")) return;
    try {
      await axios.delete(`${API_URL}/api/thoi-khoa-bieu/${id_tkb}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ Đã xóa thời khóa biểu và buổi học!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa thời khóa biểu!");
    }
  };

  const filtered = tkbs.filter((t) =>
    [t.ten_mon, t.ma_lop_hp, t.phong_hoc, t.ten_giang_vien]
      .some((f) => f?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>📅 Quản lý thời khóa biểu</h1>

      {/* 🔍 Tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm môn học, giảng viên, phòng..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🧩 Form thêm / sửa */}
      <form className="create-form" onSubmit={handleSubmit}>
        <h3>{editing ? "✏️ Sửa thời khóa biểu" : "➕ Thêm thời khóa biểu mới"}</h3>
        <select
          value={form.ma_lop_hp}
          onChange={(e) => setForm({ ...form, ma_lop_hp: e.target.value })}
        >
          <option value="">-- Chọn lớp học phần --</option>
          {lopList.map((l) => (
            <option key={l.ma_lop_hp} value={l.ma_lop_hp}>
              {l.ma_lop_hp} - {l.ten_mon}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Thứ trong tuần (2-8)"
          value={form.thu_trong_tuan}
          onChange={(e) => setForm({ ...form, thu_trong_tuan: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tiết bắt đầu"
          value={form.tiet_bat_dau}
          onChange={(e) => setForm({ ...form, tiet_bat_dau: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tiết kết thúc"
          value={form.tiet_ket_thuc}
          onChange={(e) => setForm({ ...form, tiet_ket_thuc: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phòng học"
          value={form.phong_hoc}
          onChange={(e) => setForm({ ...form, phong_hoc: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tuần bắt đầu"
          value={form.tuan_bat_dau}
          onChange={(e) => setForm({ ...form, tuan_bat_dau: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tuần kết thúc"
          value={form.tuan_ket_thuc}
          onChange={(e) => setForm({ ...form, tuan_ket_thuc: e.target.value })}
        />
        <select
          value={form.trang_thai}
          onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
        >
          <option value="hoc">Đang học</option>
          <option value="hoanthanh">Hoàn thành</option>
        </select>

        <button type="submit">{editing ? "💾 Lưu" : "Thêm"}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                ma_lop_hp: "",
                thu_trong_tuan: "",
                tiet_bat_dau: "",
                tiet_ket_thuc: "",
                phong_hoc: "",
                trang_thai: "hoc",
                tuan_bat_dau: "",
                tuan_ket_thuc: "",
              });
            }}
          >
            Hủy
          </button>
        )}
      </form>

      {/* 📋 Bảng TKB */}
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
                <th>Thứ</th>
                <th>Tiết</th>
                <th>Phòng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8">Không có dữ liệu</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <React.Fragment key={t.id_tkb}>
                    <tr>
                      <td>{t.ma_lop_hp}</td>
                      <td>{t.ten_mon}</td>
                      <td>{t.ten_giang_vien}</td>
                      <td>{t.thu_trong_tuan}</td>
                      <td>{t.tiet_bat_dau}-{t.tiet_ket_thuc}</td>
                      <td>{t.phong_hoc}</td>
                      <td>{t.trang_thai}</td>
                      <td>
                        <button onClick={() => setEditing(t.id_tkb)}>✏️</button>
                        <button onClick={() => handleDelete(t.id_tkb)}>🗑️</button>
                        <button onClick={() => handleToggle(t.ma_lop_hp)}>
                          {expanded === t.ma_lop_hp ? "🔼" : "🔽"}
                        </button>
                      </td>
                    </tr>

                    {expanded === t.ma_lop_hp && (
                      <tr>
                        <td colSpan="8">
                          {buoiHocList.length ? (
                            <table className="sub-table">
                              <thead>
                                <tr>
                                  <th>Ngày học</th>
                                  <th>Thứ</th>
                                  <th>Tiết</th>
                                  <th>Phòng</th>
                                  <th>Trạng thái</th>
                                </tr>
                              </thead>
                              <tbody>
                                {buoiHocList.map((b, i) => (
                                  <tr key={i}>
                                    <td>{b.ngay_hoc?.split("T")[0]}</td>
                                    <td>{b.thu_trong_tuan}</td>
                                    <td>{b.tiet_bat_dau}-{b.tiet_ket_thuc}</td>
                                    <td>{b.phong_hoc}</td>
                                    <td>{b.trang_thai}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>Không có buổi học nào.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ThoiKhoaBieuManager;
