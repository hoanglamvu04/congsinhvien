import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserGraduate,
  FaPlusCircle,
  FaEdit,
  FaTrashAlt,
  FaFilter,
  FaEye,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/adminmodal.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SinhVienManager = () => {
  const navigate = useNavigate();
  const [sinhViens, setSinhViens] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [lops, setLops] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    ma_khoa: "",
    ma_lop: "",
    khoa_hoc: "",
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // 🧠 Load danh sách khoa
  const fetchKhoa = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/khoa`);
      setKhoas(res.data.data || res.data || []);
    } catch (e) {
      console.error("Lỗi load khoa:", e);
    }
  };

  // 🧠 Load danh sách lớp theo khoa
  const fetchLop = async (ma_khoa) => {
    if (!ma_khoa) return setLops([]);
    try {
      const res = await axios.get(`${API_URL}/api/lop/${ma_khoa}`);
      setLops(res.data || []);
    } catch (e) {
      console.error("Lỗi load lớp:", e);
    }
  };

  // 📡 Lấy sinh viên (phân trang)
  const fetchSinhVien = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sinhvien`, {
        params: {
          page,
          limit,
          ma_khoa: filters.ma_khoa,
          ma_lop: filters.ma_lop,
          keyword,
        },
      });
      setSinhViens(res.data.data || res.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("❌ Lỗi khi tải sinh viên:", err);
    }
  };

  useEffect(() => {
    fetchKhoa();
  }, []);

  useEffect(() => {
    fetchSinhVien();
  }, [page, filters, keyword]);

  useEffect(() => {
    if (filters.ma_khoa) fetchLop(filters.ma_khoa);
  }, [filters.ma_khoa]);

  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (ma_sinh_vien) => {
    if (!window.confirm("Xác nhận xóa sinh viên này?")) return;
    try {
      await axios.delete(`${API_URL}/api/sinhvien/${ma_sinh_vien}`);
      fetchSinhVien();
    } catch (err) {
      alert("❌ Không thể xóa sinh viên!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>
        <FaUserGraduate /> Quản lý Sinh viên
      </h1>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <FaFilter />
        <input
          type="text"
          placeholder="Tìm mã hoặc tên sinh viên..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          value={filters.ma_khoa}
          onChange={(e) =>
            setFilters({ ...filters, ma_khoa: e.target.value, ma_lop: "" })
          }
        >
          <option value="">Tất cả khoa</option>
          {khoas.map((k) => (
            <option key={k.ma_khoa} value={k.ma_khoa}>
              {k.ten_khoa}
            </option>
          ))}
        </select>
        <select
          value={filters.ma_lop}
          onChange={(e) => setFilters({ ...filters, ma_lop: e.target.value })}
        >
          <option value="">Tất cả lớp</option>
          {lops.map((l) => (
            <option key={l.ma_lop} value={l.ma_lop}>
              {l.ten_lop}
            </option>
          ))}
        </select>
        <button
          className="btn-add"
          onClick={() => navigate("/admin/sinhvien/them")}
        >
          <FaPlusCircle /> Thêm sinh viên
        </button>
      </div>

      {/* Bảng */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Mã SV</th>
              <th>Họ tên</th>
              <th>Lớp</th>
              <th>Khoa</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sinhViens.length ? (
              sinhViens.map((sv) => (
                <tr key={sv.ma_sinh_vien}>
                  <td>
                    {sv.hinh_anh ? (
                      <img
                        src={`${API_URL}${sv.hinh_anh}`}
                        alt="sv"
                        className="avatar"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{sv.ma_sinh_vien}</td>
                  <td>{sv.ho_ten}</td>
                  <td>{sv.ten_lop}</td>
                  <td>{sv.ten_khoa}</td>
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
                    <button
                      onClick={() =>
                        navigate(`/admin/sinhvien/${sv.ma_sinh_vien}`)
                      }
                      className="btn-view"
                    >
                      <FaEye />
                    </button>
                    <button className="btn-edit">
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(sv.ma_sinh_vien)}
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 🔢 Phân trang */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ◀ Trước
            </button>
            <span>
              Trang {page}/{totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SinhVienManager;
