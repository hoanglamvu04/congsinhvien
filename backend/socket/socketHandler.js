// 📁 socket/socketHandler.js
import pool from "../config/db.js";

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // 🔹 Khi user đăng nhập
    socket.on("registerUser", async (username) => {
      if (!username) return;
      onlineUsers.set(username, socket.id);
      console.log(`✅ Registered user: ${username}`);

      // Phát danh sách online
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));

      // Gửi tổng unread ban đầu
      const [rows] = await pool.query(
        `SELECT nguoi_gui, COUNT(*) AS count 
         FROM tin_nhan 
         WHERE nguoi_nhan = ? AND da_doc = 0 
         GROUP BY nguoi_gui`,
        [username]
      );

      const unreadMap = {};
      rows.forEach((r) => (unreadMap[r.nguoi_gui] = r.count));

      io.to(socket.id).emit("unreadCountByUser", unreadMap);
    });

    // 🔹 Khi gửi tin nhắn
    socket.on("sendMessage", async (msg) => {
      try {
        const { nguoi_gui, nguoi_nhan, noi_dung } = msg;
        if (!nguoi_gui || !nguoi_nhan || !noi_dung) return;

        // Lưu DB
        const [result] = await pool.query(
          `INSERT INTO tin_nhan (nguoi_gui, nguoi_nhan, noi_dung, thoi_gian_gui, da_doc, trang_thai)
           VALUES (?, ?, ?, NOW(), 0, 'binhthuong')`,
          [nguoi_gui, nguoi_nhan, noi_dung]
        );

        const newMsg = {
          id_tin_nhan: result.insertId,
          nguoi_gui,
          nguoi_nhan,
          noi_dung,
          thoi_gian_gui: new Date(),
        };

        // Phát tới người nhận (nếu online)
        const receiverSocket = onlineUsers.get(nguoi_nhan);
        if (receiverSocket) {
          io.to(receiverSocket).emit("newMessage", newMsg);

          // Cập nhật lại badge số chưa đọc
          const [rows] = await pool.query(
            `SELECT nguoi_gui, COUNT(*) AS count 
             FROM tin_nhan 
             WHERE nguoi_nhan = ? AND da_doc = 0 
             GROUP BY nguoi_gui`,
            [nguoi_nhan]
          );
          const unreadMap = {};
          rows.forEach((r) => (unreadMap[r.nguoi_gui] = r.count));
          io.to(receiverSocket).emit("unreadCountByUser", unreadMap);
        }
      } catch (err) {
        console.error("❌ sendMessage error:", err);
      }
    });

    // 🔹 Khi đọc hội thoại (markAsRead)
    socket.on("markAsRead", async ({ reader, sender }) => {
      try {
        await pool.query(
          `UPDATE tin_nhan 
           SET da_doc = 1 
           WHERE nguoi_gui = ? AND nguoi_nhan = ? AND da_doc = 0`,
          [sender, reader]
        );

        // Cập nhật badge người đọc
        const [rows] = await pool.query(
          `SELECT nguoi_gui, COUNT(*) AS count 
           FROM tin_nhan 
           WHERE nguoi_nhan = ? AND da_doc = 0 
           GROUP BY nguoi_gui`,
          [reader]
        );
        const unreadMap = {};
        rows.forEach((r) => (unreadMap[r.nguoi_gui] = r.count));

        const readerSocket = onlineUsers.get(reader);
        if (readerSocket)
          io.to(readerSocket).emit("unreadCountByUser", unreadMap);

        // 🔹 Gửi read receipt cho người gửi
        const senderSocket = onlineUsers.get(sender);
        if (senderSocket) {
          io.to(senderSocket).emit("readReceipt", {
            from: reader,
            time: new Date(),
          });
        }
      } catch (err) {
        console.error("❌ markAsRead error:", err);
      }
    });

    socket.on("disconnect", () => {
      const user = [...onlineUsers.entries()].find(
        ([, id]) => id === socket.id
      );
      if (user) {
        onlineUsers.delete(user[0]);
        console.log(`🔴 Disconnected: ${user[0]}`);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      }
    });
  });
};
