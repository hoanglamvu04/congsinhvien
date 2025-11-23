import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "../../styles/TinNhan.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ✅ Kết nối socket có xác thực token
const socket = io(API_URL, {
  transports: ["websocket"],
  auth: { token: localStorage.getItem("token") },
});

const TinNhan = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const navigate = useNavigate();
  const chatBoxRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [receiver, setReceiver] = useState(id || null);
  const [receiverInfo, setReceiverInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unread, setUnread] = useState({});
  const [readReceipts, setReadReceipts] = useState({});

  // 📜 Scroll xuống cuối
  const scrollToBottom = () => {
    requestAnimationFrame(() =>
      chatBoxRef.current?.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      })
    );
  };

  // 🧍 Lấy thông tin sinh viên hiện tại
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/sinhvien/me`, {
          withCredentials: true,
        });
        setCurrentUser(res.data.ten_dang_nhap?.trim());
      } catch (err) {
        console.error("❌ Không thể lấy thông tin người dùng:", err);
      }
    };
    fetchMe();
  }, []);

  // 🔧 Hàm fetch thông tin user bất kỳ
  const fetchUserInfo = async (username) => {
    try {
      const res = await axios.get(`${API_URL}/api/sinhvien/by-username/${username}`, {
        withCredentials: true,
      });
      return {
        ten_dang_nhap: res.data.ten_dang_nhap,
        ho_ten: res.data.ho_ten,
        hinh_anh: res.data.hinh_anh,
      };
    } catch {
      return { ten_dang_nhap: username, ho_ten: username, hinh_anh: null };
    }
  };

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
        socket.emit("markAsRead", { reader: currentUser, sender: receiver });
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

  // 📞 Lấy danh bạ
  useEffect(() => {
    if (!currentUser) return;
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/tinnhan/my`, {
          withCredentials: true,
        });
        const data = res.data.data || [];
        const usernames = [
          ...new Set(
            data.map((m) =>
              m.nguoi_gui === currentUser ? m.nguoi_nhan : m.nguoi_gui
            )
          ),
        ];

        const mapped = await Promise.all(
          usernames.map(async (u) => {
            const info = await fetchUserInfo(u);
            return { username: u, ...info };
          })
        );
        setContacts(mapped);
      } catch (err) {
        console.error("❌ Lỗi lấy danh bạ:", err);
      }
    };
    fetchContacts();
  }, [currentUser]);

  // 📬 Lấy tin nhắn giữa 2 người
  const loadMessages = async (receiverId) => {
    try {
      const res = await axios.get(`${API_URL}/api/tinnhan/${receiverId}`, {
        withCredentials: true,
      });
      setMessages(res.data.data || []);
      socket.emit("markAsRead", { reader: currentUser, sender: receiverId });
      setUnread((prev) => ({ ...prev, [receiverId]: 0 }));
      scrollToBottom();
    } catch (err) {
      console.error("❌ Lỗi khi tải hội thoại:", err);
    }
  };

  // 👤 Khi chọn người nhận
  const selectUser = async (username) => {
    setReceiver(username);
    navigate(`/sinhvien/tinnhan/${username}`);
    loadMessages(username);
    setReceiverInfo(await fetchUserInfo(username));
  };

  // Khi truy cập trực tiếp /tinnhan/:id
  useEffect(() => {
    if (id && currentUser) {
      setReceiver(id);
      loadMessages(id);
      fetchUserInfo(id).then(setReceiverInfo);
    }
  }, [id, currentUser]);

  // ✉️ Gửi tin nhắn
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
              className={`contact-item ${receiver === c.username ? "active" : ""}`}
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
                  onError={(e) => (e.target.src = "/default-avatar.png")}
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
                onError={(e) => (e.target.src = "/default-avatar.png")}
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
                    const readTime =
                      mine && i === grouped[d].length - 1
                        ? readReceipts[receiver]
                        : null;
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
                            onError={(e) => (e.target.src = "/default-avatar.png")}
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
                          {readTime && (
                            <div className="read-time">Đã xem {readTime}</div>
                          )}
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
