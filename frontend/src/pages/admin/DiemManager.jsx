import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DiemManager = () => {
    const [diems, setDiems] = useState([]);
    const [keyword, setKeyword] = useState("");
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

    useEffect(() => {
        fetchDiems();
    }, []);

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

    const filtered = diems.filter((d) =>
        [d.ten_sinh_vien, d.ma_sinh_vien, d.ten_mon, d.ma_lop_hp, d.ten_hoc_ky]
            .some(f => f?.toLowerCase().includes(keyword.toLowerCase()))
    );

    return (
        <div className="admin-dashboard">
            <h1>📊 Quản lý điểm sinh viên</h1>

            {/* Bộ lọc */}
            <div className="filter-bar">
                <input
                    type="text"
                    placeholder="Tìm sinh viên, môn, lớp..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>

            {/* Form cập nhật điểm */}
            <form className="create-form" onSubmit={handleUpsert}>
                <h3>➕ Thêm / Cập nhật điểm</h3>
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
                    placeholder="Lần học"
                    value={form.lan_hoc}
                    onChange={(e) => setForm({ ...form, lan_hoc: e.target.value })}
                    style={{ width: "80px" }}
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
                <input
                    type="number"
                    placeholder="Thang 4"
                    value={form.diem_thang_4}
                    onChange={(e) => setForm({ ...form, diem_thang_4: e.target.value })}
                />
                <select
                    value={form.ket_qua}
                    onChange={(e) => setForm({ ...form, ket_qua: e.target.value })}
                >
                    <option value="">Kết quả</option>
                    <option value="dat">Đạt</option>
                    <option value="khongdat">Không đạt</option>
                </select>
                <select
                    value={form.trang_thai}
                    onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
                >
                    <option value="dat">Hoàn tất</option>
                    <option value="danghoc">Đang học</option>
                </select>
                <button type="submit">💾 Lưu</button>
            </form>

            {/* Bảng danh sách điểm */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Sinh viên</th>
                            <th>MSSV</th>
                            <th>Môn học</th>
                            <th>Lớp HP</th>
                            <th>Học kỳ</th>
                            <th>HS1</th>
                            <th>HS2</th>
                            <th>Thi</th>
                            <th>Tổng</th>
                            <th>Thang 4</th>
                            <th>Kết quả</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="11">Không có dữ liệu</td>
                            </tr>
                        ) : (
                            filtered.map((d) => (
                                <tr key={`${d.ma_sinh_vien}-${d.ma_lop_hp}`}>
                                    <td>{d.ten_sinh_vien}</td>
                                    <td>{d.ma_sinh_vien}</td>
                                    <td>{d.ten_mon}</td>
                                    <td>{d.ma_lop_hp}</td>
                                    <td>{d.ten_hoc_ky}</td>
                                    <td>{d.diem_hs1 ?? "-"}</td>
                                    <td>{d.diem_hs2 ?? "-"}</td>
                                    <td>{d.diem_thi ?? "-"}</td>
                                    <td>{d.diem_tong ?? "-"}</td>
                                    <td>{d.diem_thang_4 ?? "-"}</td>
                                    <td>
                                        {d.ket_qua?.toLowerCase() === "dat"
                                            ? "✅ Đạt"
                                            : d.ket_qua?.toLowerCase() === "khongdat"
                                                ? "❌ Rớt"
                                                : "-"}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => setForm({
                                                ma_sinh_vien: d.ma_sinh_vien,
                                                ma_lop_hp: d.ma_lop_hp,
                                                lan_hoc: d.lan_hoc,
                                                diem_hs1: d.diem_hs1,
                                                diem_hs2: d.diem_hs2,
                                                diem_thi: d.diem_thi,
                                                diem_tong: d.diem_tong,
                                                diem_thang_4: d.diem_thang_4,
                                                ket_qua: d.ket_qua,
                                                trang_thai: d.trang_thai
                                            })}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm("Xóa điểm này?")) return;
                                                try {
                                                    await axios.delete(`${API_URL}/api/diem/${d.id_diem}`, {
                                                        headers: { Authorization: `Bearer ${token}` },
                                                    });
                                                    alert("🗑️ Xóa thành công!");
                                                    fetchDiems();
                                                } catch {
                                                    alert("Lỗi khi xóa điểm!");
                                                }
                                            }}
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
        </div>
    );
};

export default DiemManager;
