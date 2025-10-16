import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const TinNhan = () => {
    const token = localStorage.getItem("token");
    const [currentUser, setCurrentUser] = useState(null); // Mã sinh viên hiện tại
    const [danhBa, setDanhBa] = useState([]);
    const [hoiThoai, setHoiThoai] = useState([]);
    const [nguoiNhan, setNguoiNhan] = useState(null);
    const [noiDung, setNoiDung] = useState("");

    // 📌 1️⃣ Lấy mã sinh viên đang đăng nhập
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/sinhvien/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCurrentUser(res.data.ma_sinh_vien);
            } catch (err) {
                console.error("❌ Không lấy được mã sinh viên:", err);
                alert("Không thể tải thông tin người dùng!");
            }
        };
        fetchUser();
    }, [token]);

    // 📩 2️⃣ Lấy toàn bộ tin nhắn của mình để tạo danh bạ
    useEffect(() => {
        if (!currentUser) return;

        const fetchTinNhanCaNhan = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/tinnhan/my`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const all = res.data.data || [];

                // Tạo danh bạ: người còn lại trong mỗi tin nhắn
                const contacts = [
                    ...new Set(
                        all.map((msg) =>
                            msg.nguoi_gui === currentUser ? msg.nguoi_nhan : msg.nguoi_gui
                        )
                    ),
                ];
                setDanhBa(contacts.map((d) => ({ doi_tuong: d })));
            } catch (err) {
                console.error("❌ Lỗi khi tải tin nhắn cá nhân:", err);
            }
        };

        fetchTinNhanCaNhan();
    }, [currentUser, token]);

    // 💬 3️⃣ Tải hội thoại với một người cụ thể
    const loadHoiThoai = async (id) => {
        try {
            setNguoiNhan(id);
            const res = await axios.get(`${API_URL}/api/tinnhan/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHoiThoai(res.data.data || []);

            // ✅ Đánh dấu đã đọc
            await axios.put(
                `${API_URL}/api/tinnhan/danhdau/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("❌ Lỗi khi tải hội thoại:", err);
            alert("Không thể tải hội thoại!");
        }
    };

    // 🚀 4️⃣ Gửi tin nhắn
    const guiTinNhan = async () => {
        if (!noiDung.trim() || !nguoiNhan) return;
        try {
            await axios.post(
                `${API_URL}/api/tinnhan`,
                { nguoi_nhan: nguoiNhan, noi_dung: noiDung },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNoiDung("");
            loadHoiThoai(nguoiNhan);
        } catch (err) {
            console.error("❌ Lỗi khi gửi tin nhắn:", err);
            alert("Không gửi được tin nhắn!");
        }
    };

    return (
        <div className="page-container chat-page">
            <h2>💬 Tin nhắn</h2>

            <div className="chat-container">
                {/* 📜 Danh bạ */}
                <div className="chat-sidebar">
                    <h4>Danh bạ</h4>
                    <ul>
                        {danhBa.length === 0 ? (
                            <li>Không có liên lạc</li>
                        ) : (
                            danhBa.map((item, i) => (
                                <li
                                    key={i}
                                    onClick={() => loadHoiThoai(item.doi_tuong)}
                                    className={nguoiNhan === item.doi_tuong ? "active" : ""}
                                >
                                    {item.doi_tuong}
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* 💬 Khung hội thoại */}
                <div className="chat-main">
                    {nguoiNhan ? (
                        <>
                            <h4>Trò chuyện với {nguoiNhan}</h4>
                            <div className="chat-box">
                                {hoiThoai.map((msg) => (
                                    <div
                                        key={msg.id_tin_nhan}
                                        className={
                                            msg.nguoi_gui === nguoiNhan
                                                ? "chat-msg left"
                                                : "chat-msg right"
                                        }
                                    >
                                        <p>{msg.noi_dung}</p>
                                        <span>
                                            {new Date(msg.thoi_gian_gui).toLocaleTimeString("vi-VN")}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="chat-input">
                                <input
                                    value={noiDung}
                                    onChange={(e) => setNoiDung(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                />
                                <button onClick={guiTinNhan}>Gửi</button>
                            </div>
                        </>
                    ) : (
                        <p>Chọn người để xem hội thoại</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TinNhan;
