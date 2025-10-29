import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SinhVienManager = () => {
  const [sinhViens, setSinhViens] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [preview, setPreview] = useState(null); // preview ảnh
  const [file, setFile] = useState(null); // file ảnh upload

  const [form, setForm] = useState({
    ma_sinh_vien: "",
    cccd: "",
    ho_ten: "",
    ngay_sinh: "",
    gioi_tinh: "",
    ma_lop: "",
    ma_nganh: "",
    ma_khoa: "",
    khoa_hoc: "",
    dia_chi: "",
    nguoi_giam_ho: "",
    sdt_giam_ho: "",
    dien_thoai: "",
    email: "",
    trang_thai_hoc_tap: "danghoc",
  });

  const token = localStorage.getItem("token");

  // 🔄 Lấy danh sách sinh viên
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sinhvien`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSinhViens(res.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải danh sách sinh viên!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🧾 Reset form
  const resetForm = () => {
    setForm({
      ma_sinh_vien: "",
      cccd: "",
      ho_ten: "",
      ngay_sinh: "",
      gioi_tinh: "",
      ma_lop: "",
      ma_nganh: "",
      ma_khoa: "",
      khoa_hoc: "",
      dia_chi: "",
      nguoi_giam_ho: "",
      sdt_giam_ho: "",
      dien_thoai: "",
      email: "",
      trang_thai_hoc_tap: "danghoc",
    });
    setFile(null);
    setPreview(null);
  };

  // 📸 Xử lý chọn ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // 💾 Thêm sinh viên (có ảnh)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!form.ma_sinh_vien) return alert("⚠️ Vui lòng nhập mã sinh viên!");

      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (file) data.append("hinh_anh", file);

      await axios.post(`${API_URL}/api/sinhvien`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Thêm sinh viên thành công!");
      fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi thêm sinh viên!");
    }
  };

  // ✏️ Cập nhật sinh viên
  const handleUpdate = async () => {
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (file) data.append("hinh_anh", file);

      await axios.put(`${API_URL}/api/sinhvien/${form.ma_sinh_vien}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Cập nhật sinh viên thành công!");
      fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật!");
    }
  };

  // 🗑️ Xóa sinh viên
  const handleDelete = async (ma_sinh_vien) => {
    if (!window.confirm("Xác nhận xóa sinh viên này?")) return;
    try {
      await axios.delete(`${API_URL}/api/sinhvien/${ma_sinh_vien}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ Đã xóa sinh viên!");
      fetchData();
    } catch (err) {
      alert("❌ Lỗi khi xóa sinh viên!");
    }
  };

  // 🔍 Lọc danh sách
  const filtered = sinhViens.filter((s) =>
    [s.ho_ten, s.ma_sinh_vien, s.ten_lop, s.ten_nganh, s.ten_khoa]
      .some((f) => f?.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <h1>🎒 Quản lý sinh viên</h1>

      {/* Tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm tên, mã SV, lớp, ngành..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Form thêm / cập nhật */}
      <form className="create-form" onSubmit={handleSave}>
        <h3>➕ Thêm / Cập nhật sinh viên</h3>

        <div className="form-grid">
          <input
            type="text"
            placeholder="Mã sinh viên"
            value={form.ma_sinh_vien}
            onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })}
          />
          <input
            type="text"
            placeholder="CCCD"
            value={form.cccd}
            onChange={(e) => setForm({ ...form, cccd: e.target.value })}
          />
          <input
            type="text"
            placeholder="Họ tên"
            value={form.ho_ten}
            onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
          />
          <input
            type="date"
            value={form.ngay_sinh}
            onChange={(e) => setForm({ ...form, ngay_sinh: e.target.value })}
          />
          <select
            value={form.gioi_tinh}
            onChange={(e) => setForm({ ...form, gioi_tinh: e.target.value })}
          >
            <option value="">Giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
          <input
            type="text"
            placeholder="Mã lớp"
            value={form.ma_lop}
            onChange={(e) => setForm({ ...form, ma_lop: e.target.value })}
          />
          <input
            type="text"
            placeholder="Mã ngành"
            value={form.ma_nganh}
            onChange={(e) => setForm({ ...form, ma_nganh: e.target.value })}
          />
          <input
            type="text"
            placeholder="Mã khoa"
            value={form.ma_khoa}
            onChange={(e) => setForm({ ...form, ma_khoa: e.target.value })}
          />
          <input
            type="text"
            placeholder="Khóa học (VD: K47)"
            value={form.khoa_hoc}
            onChange={(e) => setForm({ ...form, khoa_hoc: e.target.value })}
          />
          <input
            type="text"
            placeholder="Địa chỉ"
            value={form.dia_chi}
            onChange={(e) => setForm({ ...form, dia_chi: e.target.value })}
          />
          <input
            type="text"
            placeholder="Người giám hộ"
            value={form.nguoi_giam_ho}
            onChange={(e) => setForm({ ...form, nguoi_giam_ho: e.target.value })}
          />
          <input
            type="text"
            placeholder="SĐT giám hộ"
            value={form.sdt_giam_ho}
            onChange={(e) => setForm({ ...form, sdt_giam_ho: e.target.value })}
          />
          <input
            type="text"
            placeholder="Điện thoại"
            value={form.dien_thoai}
            onChange={(e) => setForm({ ...form, dien_thoai: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <select
            value={form.trang_thai_hoc_tap}
            onChange={(e) =>
              setForm({ ...form, trang_thai_hoc_tap: e.target.value })
            }
          >
            <option value="danghoc">Đang học</option>
            <option value="baoluu">Bảo lưu</option>
            <option value="totnghiep">Tốt nghiệp</option>
            <option value="thoihoc">Thôi học</option>
          </select>

          {/* Upload ảnh */}
          <div className="file-input">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{ width: "80px", height: "80px", borderRadius: "6px", marginTop: "5px" }}
              />
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button type="submit">💾 Thêm</button>
          <button type="button" onClick={handleUpdate}>
            ✏️ Cập nhật
          </button>
          <button type="button" onClick={resetForm}>
            🔄 Reset
          </button>
        </div>
      </form>

      {/* Bảng danh sách */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Mã SV</th>
              <th>Họ tên</th>
              <th>Giới tính</th>
              <th>Lớp</th>
              <th>Ngành</th>
              <th>Khoa</th>
              <th>CCCD</th>
              <th>Khóa học</th>
              <th>Người giám hộ</th>
              <th>SĐT giám hộ</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="15">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map((sv) => (
                <tr key={sv.ma_sinh_vien}>
                  <td>
                    {sv.hinh_anh ? (
                      <img
                        src={`${API_URL}${sv.hinh_anh}`}
                        alt="sv"
                        style={{ width: "60px", height: "60px", borderRadius: "6px" }}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{sv.ma_sinh_vien}</td>
                  <td>{sv.ho_ten}</td>
                  <td>{sv.gioi_tinh}</td>
                  <td>{sv.ten_lop}</td>
                  <td>{sv.ten_nganh}</td>
                  <td>{sv.ten_khoa}</td>
                  <td>{sv.cccd ?? "-"}</td>
                  <td>{sv.khoa_hoc ?? "-"}</td>
                  <td>{sv.nguoi_giam_ho ?? "-"}</td>
                  <td>{sv.sdt_giam_ho ?? "-"}</td>
                  <td>{sv.dien_thoai ?? "-"}</td>
                  <td>{sv.email ?? "-"}</td>
                  <td>
                    {sv.trang_thai_hoc_tap === "danghoc"
                      ? "📘 Đang học"
                      : sv.trang_thai_hoc_tap === "baoluu"
                      ? "⏸️ Bảo lưu"
                      : sv.trang_thai_hoc_tap === "totnghiep"
                      ? "🎓 Tốt nghiệp"
                      : "❌ Thôi học"}
                  </td>
                  <td>
                    <button onClick={() => setForm(sv)}>✏️</button>
                    <button onClick={() => handleDelete(sv.ma_sinh_vien)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SinhVienManager;
