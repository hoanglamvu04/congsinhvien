import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DiemDanhGiangVien.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DiemDanhGiangVien = () => {
    const token = localStorage.getItem("token");
    const [lopHocPhanList, setLopHocPhanList] = useState([]);
    const [selectedLop, setSelectedLop] = useState("");
    const [buoiList, setBuoiList] = useState([]);
    const [selectedBuoi, setSelectedBuoi] = useState("");
    const [dsSinhVien, setDsSinhVien] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔹 Lấy danh sách lớp học phần giảng viên dạy
    useEffect(() => {
        const fetchLopHocPhan = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/lophocphan`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLopHocPhanList(res.data.data || []);
            } catch (err) {
                console.error("Lỗi khi lấy lớp học phần:", err);
            }
        };
        fetchLopHocPhan();
    }, [token]);

    // 🔹 Khi chọn lớp -> lấy buổi học (từ thời khóa biểu)
    useEffect(() => {
        const fetchBuoiHoc = async () => {
            if (!selectedLop) return;
            try {
                const res = await axios.get(`${API_URL}/api/buoihoc/${selectedLop}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBuoiList(res.data.data || []);

                setBuoiList(res.data.data || []);
            } catch (err) {
                console.error("Lỗi khi lấy buổi học:", err);
            }
        };
        fetchBuoiHoc();
    }, [selectedLop, token]);

    // 🔹 Khi chọn buổi -> lấy danh sách sinh viên
    useEffect(() => {
        const fetchDsSinhVien = async () => {
            if (!selectedBuoi || !selectedLop) return;
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/api/diemdanh/buoi/${selectedBuoi}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.data && res.data.data.length > 0) {
                    // đã có điểm danh
                    setDsSinhVien(res.data.data);
                } else {
                    // chưa có điểm danh => lấy danh sách sinh viên đăng ký lớp
                    const res2 = await axios.get(`${API_URL}/api/dangky/lop/${selectedLop}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setDsSinhVien(
                        res2.data.data.map((sv) => ({
                            ma_sinh_vien: sv.ma_sinh_vien,
                            ho_ten: sv.ho_ten,
                            trang_thai: "comat",
                            ghi_chu: "",
                        }))
                    );
                }
            } catch (err) {
                console.error("Lỗi khi lấy DS SV:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDsSinhVien();
    }, [selectedBuoi, selectedLop, token]);

    // 🔹 Cập nhật trạng thái chọn
    const handleChangeTrangThai = (ma_sinh_vien, trang_thai) => {
        setDsSinhVien((prev) =>
            prev.map((sv) =>
                sv.ma_sinh_vien === ma_sinh_vien ? { ...sv, trang_thai } : sv
            )
        );
    };

    // 🔹 Lưu điểm danh
    const handleLuu = async () => {
        if (!selectedLop || !selectedBuoi) {
            alert("Vui lòng chọn lớp và buổi học!");
            return;
        }

        try {
            for (const sv of dsSinhVien) {
                await axios.post(
                    `${API_URL}/api/diemdanh`,
                    {
                        ma_lop_hp: selectedLop,
                        id_tkb: selectedBuoi,
                        ma_sinh_vien: sv.ma_sinh_vien,
                        trang_thai: sv.trang_thai,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            alert("✅ Lưu điểm danh thành công!");
        } catch (err) {
            console.error("Lỗi khi lưu điểm danh:", err);
            alert("❌ Lưu thất bại!");
        }
    };

    return (
        <div className="diemdanh-container">
            <h2>📋 Điểm danh sinh viên</h2>

            <div className="diemdanh-filters">
                <div>
                    <label>Lớp học phần:</label>
                    <select
                        value={selectedLop}
                        onChange={(e) => setSelectedLop(e.target.value)}
                    >
                        <option value="">-- Chọn lớp học phần --</option>
                        {lopHocPhanList.map((lop) => (
                            <option key={lop.ma_lop_hp} value={lop.ma_lop_hp}>
                                {lop.ma_lop_hp} - {lop.ten_mon}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Buổi học:</label>
                    <select
                        value={selectedBuoi}
                        onChange={(e) => setSelectedBuoi(e.target.value)}
                        disabled={!selectedLop}
                    >
                        <option value="">-- Chọn buổi học --</option>
                        {buoiList.map((b) => (
                            <option key={b.id_tkb} value={b.id_tkb}>
                                {b.ngay_hoc?.substring(0, 10)} (Tiết {b.tiet_bat_dau}-{b.tiet_ket_thuc})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <p>⏳ Đang tải danh sách sinh viên...</p>
            ) : (
                <>
                    {dsSinhVien.length > 0 && (
                        <table className="diemdanh-table">
                            <thead>
                                <tr>
                                    <th>Mã SV</th>
                                    <th>Họ tên</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dsSinhVien.map((sv) => (
                                    <tr key={sv.ma_sinh_vien}>
                                        <td>{sv.ma_sinh_vien}</td>
                                        <td>{sv.ho_ten}</td>
                                        <td>
                                            {["comat", "vang", "tre", "vesom"].map((tt) => (
                                                <label key={tt} className={`radio-${tt}`}>
                                                    <input
                                                        type="radio"
                                                        name={sv.ma_sinh_vien}
                                                        value={tt}
                                                        checked={sv.trang_thai === tt}
                                                        onChange={(e) =>
                                                            handleChangeTrangThai(
                                                                sv.ma_sinh_vien,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {tt === "comat"
                                                        ? "Có mặt"
                                                        : tt === "vang"
                                                            ? "Vắng"
                                                            : tt === "tre"
                                                                ? "Trễ"
                                                                : "Về sớm"}
                                                </label>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}

            {dsSinhVien.length > 0 && (
                <button className="btn-save" onClick={handleLuu}>
                    💾 Lưu điểm danh
                </button>
            )}
        </div>
    );
};

export default DiemDanhGiangVien;
