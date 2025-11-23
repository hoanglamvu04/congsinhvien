import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaPlusCircle, FaBookOpen, FaHistory } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import "../../styles/SinhVienDangKy.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SinhVienDangKy = () => {
  const [lopHocPhanList, setLopHocPhanList] = useState([]);
  const [daDangKy, setDaDangKy] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [hocKy, setHocKy] = useState("");
  const [tienDo, setTienDo] = useState("");
  const [trangThai, setTrangThai] = useState("dangmo");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("dangmo"); // 'dangmo' | 'lichsu'
  const [searchParams, setSearchParams] = useSearchParams();

  // 🧩 Đồng bộ URL params khi load trang
  useEffect(() => {
    const currentTab = searchParams.get("tab") || "dangmo";
    const hk = searchParams.get("hocKy") || "";
    const td = searchParams.get("tienDo") || "";
    const kw = searchParams.get("keyword") || "";
    const tt = searchParams.get("trangThai") || "dangmo";
    setTab(currentTab);
    setHocKy(hk);
    setTienDo(td);
    setKeyword(kw);
    setTrangThai(tt);
  }, []);

  // 📘 API lấy danh sách lớp học phần
  const fetchLHP = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/lophocphan`, {
        withCredentials: true,
        params: { q: keyword, trang_thai: trangThai },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : res.data;
      setLopHocPhanList(data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi tải danh sách lớp học phần!");
    } finally {
      setLoading(false);
    }
  };

  // 📘 API lấy lịch sử đăng ký
  const fetchDaDangKy = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/dangky`, {
        withCredentials: true,
        params: { hocKy, tienDo },
      });
      setDaDangKy(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách đăng ký!");
    } finally {
      setLoading(false);
    }
  };

  // 📩 Gửi đăng ký
  const handleDangKy = async (lop) => {
    try {
      await axios.post(
        `${API_URL}/api/dangky`,
        { ma_lop_hp: lop.ma_lop_hp },
        { withCredentials: true }
      );
      toast.success(`✅ Đăng ký thành công: ${lop.ten_mon}`);
      reloadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi đăng ký học phần!");
    }
  };

  const reloadAll = () => {
    fetchLHP();
    fetchDaDangKy();
  };

  // 🎯 Áp dụng lọc
  const handleFilter = () => {
    const params = { tab };
    if (tab === "dangmo") {
      params.keyword = keyword;
      params.trangThai = trangThai;
    } else {
      params.hocKy = hocKy;
      params.tienDo = tienDo;
    }
    setSearchParams(params, { replace: true });
    if (tab === "dangmo") fetchLHP();
    else fetchDaDangKy();
  };

  useEffect(() => {
    if (tab === "dangmo") fetchLHP();
    else fetchDaDangKy();
  }, [tab]);

  const daDangKyMa = daDangKy.map((dk) => dk.ma_lop_hp);

  return (
    <div className="page-container">
      <div className="dk-header">
        <FaBookOpen className="icon-header" />
        <h2>Đăng ký học phần</h2>
      </div>

      {/* Tabs */}
      <div className="dk-tabs">
        <button
          className={`dk-tab-btn ${tab === "dangmo" ? "active" : ""}`}
          onClick={() => {
            setTab("dangmo");
            setSearchParams({ tab: "dangmo" }, { replace: true });
          }}
        >
          <FaBookOpen /> Lớp học phần đang mở
        </button>
        <button
          className={`dk-tab-btn ${tab === "lichsu" ? "active" : ""}`}
          onClick={() => {
            setTab("lichsu");
            setSearchParams({ tab: "lichsu" }, { replace: true });
          }}
        >
          <FaHistory /> Lịch sử đăng ký
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="dk-filter-bar">
        {tab === "dangmo" ? (
          <>
            <div className="dk-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Tìm lớp, môn học, giảng viên..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <select value={trangThai} onChange={(e) => setTrangThai(e.target.value)}>
              <option value="dangmo">Đang mở đăng ký</option>
              <option value="dong">Đã đóng</option>
              <option value="hoanthanh">Hoàn thành</option>
            </select>
            <button className="dk-btn-loc" onClick={handleFilter}>Lọc</button>
          </>
        ) : (
          <>
            <select value={hocKy} onChange={(e) => setHocKy(e.target.value)}>
              <option value="">--- Học kỳ ---</option>
              <option value="HK01-2025">Học kỳ 1 (2025-2026)</option>
              <option value="HK02-2025">Học kỳ 2 (2025-2026)</option>
            </select>
            <select value={tienDo} onChange={(e) => setTienDo(e.target.value)}>
              <option value="">--- Tiến độ ---</option>
              <option value="chuahoctap">Chưa học</option>
              <option value="danghoc">Đang học</option>
              <option value="hoanthanh">Hoàn thành</option>
            </select>
            <button className="dk-btn-loc" onClick={handleFilter}>Lọc</button>
          </>
        )}
      </div>

      {/* Nội dung */}
      <div className="table-wrapper">
        {loading ? (
          <p className="loading">⏳ Đang tải dữ liệu...</p>
        ) : tab === "dangmo" ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã lớp HP</th>
                <th>Môn học</th>
                <th>Giảng viên</th>
                <th>Học kỳ</th>
                <th>Phòng</th>
                <th>Lịch học</th>
                <th>Giới hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {lopHocPhanList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">Không có lớp học phần phù hợp</td>
                </tr>
              ) : (
                lopHocPhanList.map((item) => (
                  <tr key={item.ma_lop_hp}>
                    <td>{item.ma_lop_hp}</td>
                    <td>{item.ten_mon}</td>
                    <td>{item.ten_giang_vien || "—"}</td>
                    <td>{item.ten_hoc_ky}</td>
                    <td>{item.phong_hoc}</td>
                    <td>{item.lich_hoc}</td>
                    <td>{item.so_luong_da_dang_ky}/{item.gioi_han_dang_ky}</td>
                    <td>
                      <span className={`status ${item.trang_thai}`}>
                        {item.trang_thai === "dangmo"
                          ? "Đang mở"
                          : item.trang_thai === "dong"
                          ? "Đã đóng"
                          : "Hoàn thành"}
                      </span>
                    </td>
                    <td>
                      {daDangKyMa.includes(item.ma_lop_hp) ? (
                        <button className="btn-disabled" disabled>
                          ✅ Đã đăng ký
                        </button>
                      ) : (
                        <button className="btn-register" onClick={() => handleDangKy(item)}>
                          <FaPlusCircle /> ĐK
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Môn học</th>
                <th>Giảng viên</th>
                <th>Học kỳ</th>
                <th>Phòng học</th>
                <th>Tiến độ</th>
              </tr>
            </thead>
            <tbody>
              {daDangKy.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">Chưa có lịch sử đăng ký</td>
                </tr>
              ) : (
                daDangKy.map((item) => (
                  <tr key={item.ma_lop_hp}>
                    <td>{item.ten_mon}</td>
                    <td>{item.giang_vien || "—"}</td>
                    <td>{item.ten_hoc_ky}</td>
                    <td>{item.phong_hoc}</td>
                    <td>
                      <span className={`status ${item.tien_do}`}>
                        {item.tien_do === "danghoc"
                          ? "Đang học"
                          : item.tien_do === "hoanthanh"
                          ? "Hoàn thành"
                          : "Chưa học"}
                      </span>
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

export default SinhVienDangKy;
