import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "../../styles/TinNhan.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const socket = io(API_URL, { transports: ["websocket"] });

const TinNhan = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const navigate = useNavigate();
  const chatBoxRef = useRef(null);

  // 🧠 State
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [receiver, setReceiver] = useState(id || null);
  const [receiverInfo, setReceiverInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unread, setUnread] = useState({});
  const [readReceipts, setReadReceipts] = useState({});

  // ⬇️ Cuộn xuống cuối khi có tin mới
  const scrollToBottom = () =>
    requestAnimationFrame(() =>
      chatBoxRef.current?.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      })
    );

  // 🧍‍♂️ Lấy thông tin sinh viên hiện tại
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/sinhvien/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data.ten_dang_nhap?.trim());
      } catch (err) {
        console.error("❌ Lỗi lấy sinh viên hiện tại:", err);
      }
    };
    fetchMe();
  }, [token]);

  // 📚 Lấy toàn bộ sinh viên (để mapping họ tên + avatar)
  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/sinhvien`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách sinh viên:", err);
      }
    };
    fetchAllStudents();
  }, [token]);

  // 🧩 SOCKET setup
  useEffect(() => {
    if (!currentUser) return;

    socket.emit("registerUser", currentUser);
    socket.on("onlineUsers", setOnlineUsers);

    socket.on("newMessage", (msg) => {
      if (
        (msg.nguoi_gui === receiver && msg.nguoi_nhan === currentUser) ||
        (msg.nguoi_gui === currentUser && msg.nguoi_nhan === receiver)
      ) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      } else if (msg.nguoi_nhan === currentUser) {
        setUnread((prev) => ({
          ...prev,
          [msg.nguoi_gui]: (prev[msg.nguoi_gui] || 0) + 1,
        }));
      }
    });

    socket.on("typing", (from) => {
      setTypingUser(from);
      setTimeout(() => setTypingUser(""), 2000);
    });

    socket.on("readReceipt", ({ from, time }) => {
      setReadReceipts((prev) => ({
        ...prev,
        [from]: new Date(time).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("readReceipt");
      socket.off("onlineUsers");
    };
  }, [currentUser, receiver]);

  // 📨 Lấy danh bạ tin nhắn + map sang sinh viên
  useEffect(() => {
    if (!currentUser || students.length === 0) return;

    const fetchContacts = async () => {
      try {
        const resMsg = await axios.get(`${API_URL}/api/tinnhan/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allMsg = resMsg.data.data || [];

        const uniqueUsers = [
          ...new Set(
            allMsg.map((m) =>
              m.nguoi_gui === currentUser ? m.nguoi_nhan : m.nguoi_gui
            )
          ),
        ];

        const mappedContacts = await Promise.all(
          uniqueUsers.map(async (username) => {
            try {
              const res = await axios.get(`${API_URL}/api/sinhvien/by-username/${username}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const sv = res.data;
              return {
                username,
                ho_ten: sv.ho_ten || username,
                hinh_anh: sv.hinh_anh || null,
              };
            } catch {
              return { username, ho_ten: username, hinh_anh: null };
            }
          })
        );


        setContacts(mappedContacts);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh bạ:", err);
      }
    };
    fetchContacts();
  }, [currentUser, students]);

  // 📨 Lấy hội thoại
  const loadMessages = async (receiverId) => {
    try {
      const res = await axios.get(`${API_URL}/api/tinnhan/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.data || []);
      socket.emit("markAsRead", { reader: currentUser, sender: receiverId });
      setUnread((prev) => ({ ...prev, [receiverId]: 0 }));
      scrollToBottom();
    } catch (err) {
      console.error("❌ Lỗi hội thoại:", err);
    }
  };

  // 👤 Khi chọn người nhận
  const selectUser = async (username) => {
    setReceiver(username);
    navigate(`/sinhvien/tinnhan/${username}`);
    loadMessages(username);

    try {
      // ✅ Lấy thông tin người nhận bằng API mới
      const res = await axios.get(`${API_URL}/api/sinhvien/by-username/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReceiverInfo({
        ten_dang_nhap: res.data.ten_dang_nhap,
        ho_ten: res.data.ho_ten,
        hinh_anh: res.data.hinh_anh,
      });
    } catch (err) {
      console.error("❌ Không lấy được thông tin người nhận:", err);
      setReceiverInfo({
        ten_dang_nhap: username,
        ho_ten: username,
        hinh_anh: null,
      });
    }
  };

  // Khi URL thay đổi (load tin nhắn trực tiếp qua URL)
  useEffect(() => {
    if (id && currentUser) {
      setReceiver(id);
      loadMessages(id);
      const fetchReceiverInfo = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/sinhvien/by-username/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setReceiverInfo({
            ten_dang_nhap: res.data.ten_dang_nhap,
            ho_ten: res.data.ho_ten,
            hinh_anh: res.data.hinh_anh,
          });
        } catch {
          setReceiverInfo({ ten_dang_nhap: id, ho_ten: id, hinh_anh: null });
        }
      };
      fetchReceiverInfo();
    }
  }, [id, currentUser]);

  // 🚀 Gửi tin nhắn
  const sendMessage = () => {
    if (!input.trim() || !receiver) return;
    const msg = {
      nguoi_gui: currentUser,
      nguoi_nhan: receiver,
      noi_dung: input.trim(),
    };
    socket.emit("sendMessage", msg);
    setMessages((prev) => [...prev, { ...msg, thoi_gian_gui: new Date() }]);
    setInput("");
    scrollToBottom();
  };

  // Gom nhóm theo ngày
  const grouped = messages.reduce((g, m) => {
    const d = new Date(m.thoi_gian_gui).toLocaleDateString("vi-VN");
    if (!g[d]) g[d] = [];
    g[d].push(m);
    return g;
  }, {});

  const isOnline = (u) => onlineUsers.includes(u);

  return (
    <div className="messenger-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <h3 className="sidebar-title">Tin nhắn</h3>
        <input className="sidebar-search" placeholder="Tìm kiếm..." />
        <div className="contact-list">
          {contacts.map((c, i) => (
            <div
              key={i}
              className={`contact-item ${receiver === c.username ? "active" : ""
                }`}
              onClick={() => selectUser(c.username)}
            >
              <div className="contact-avatar">
                <img
                  src={
                    c.hinh_anh
                      ? `${API_URL}${c.hinh_anh}`
                      : "/default-avatar.png"
                  }
                  alt="avatar"
                />
                {isOnline(c.username) && <span className="online-dot"></span>}
              </div>
              <div className="contact-info">
                <div className="contact-name">{c.ho_ten}</div>
                <div className="contact-preview">Nhắn tin ngay...</div>
              </div>
              {unread[c.username] > 0 && (
                <div className="unread-badge">{unread[c.username]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat main */}
      <div className="chat-panel">
        {receiver ? (
          <>
            <div className="chat-header">
              <img
                src={
                  receiverInfo.hinh_anh
                    ? `${API_URL}${receiverInfo.hinh_anh}`
                    : "/default-avatar.png"
                }
                alt="avt"
              />
              <div>
                <div className="user-name">{receiverInfo.ho_ten}</div>
                <div className="user-status">
                  {isOnline(receiver) ? "Đang hoạt động" : "Ngoại tuyến"}
                </div>
              </div>
            </div>

            <div className="chat-box" ref={chatBoxRef}>
              {Object.keys(grouped).map((d) => (
                <div key={d}>
                  <div className="chat-date">{d}</div>
                  {grouped[d].map((m, i) => {
                    const mine = m.nguoi_gui === currentUser;
                    return (
                      <div
                        key={i}
                        className={`msg-row ${mine ? "mine" : "theirs"}`}
                      >
                        {!mine && (
                          <img
                            src={
                              receiverInfo.hinh_anh
                                ? `${API_URL}${receiverInfo.hinh_anh}`
                                : "/default-avatar.png"
                            }
                            alt=""
                            className="msg-avatar"
                          />
                        )}
                        <div className="msg-bubble">
                          <div className="msg-text">{m.noi_dung}</div>
                          <div className="msg-time">
                            {new Date(
                              m.thoi_gian_gui
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {typingUser === receiver && (
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>

            <div className="chat-input">
              <input
                placeholder="Aa"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                  socket.emit("typing", { from: currentUser, to: receiver });
                }}
              />
              <button onClick={sendMessage}>Gửi</button>
            </div>
          </>
        ) : (
          <div className="chat-empty">
            Chọn một người để bắt đầu trò chuyện 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default TinNhan;
