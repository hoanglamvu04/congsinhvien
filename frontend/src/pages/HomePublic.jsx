import React from "react";
import "../styles/HomePublic.css";
import {
  FaBullhorn,
  FaNewspaper,
  FaFileAlt,
  FaCalendarAlt,
  FaBook,
  FaUserGraduate,
} from "react-icons/fa";

const HomePublic = () => {
  return (
    <div className="hp-container">

      {/* === BANNER === */}
      <section className="hp-banner">
        <div className="hp-banner-content">
          <h1>🎓 Cổng thông tin sinh viên HAC</h1>
          <p>
            Nơi tra cứu lịch học, thông báo, biểu mẫu và các tin tức mới nhất dành cho sinh viên.
          </p>
        </div>
      </section>

      {/* === ICON FEATURE SECTION === */}
      <section className="hp-features">
        <div className="hp-feature-card">
          <FaCalendarAlt className="hp-feature-icon" />
          <h4>Lịch học</h4>
        </div>
        <div className="hp-feature-card">
          <FaBook className="hp-feature-icon" />
          <h4>Tài liệu – Học liệu</h4>
        </div>
        <div className="hp-feature-card">
          <FaBullhorn className="hp-feature-icon" />
          <h4>Thông báo</h4>
        </div>
        <div className="hp-feature-card">
          <FaUserGraduate className="hp-feature-icon" />
          <h4>Hỗ trợ sinh viên</h4>
        </div>
      </section>

      {/* === 3 COLUMN CONTENT === */}
      <section className="hp-grid">

        {/* Tin tức */}
        <div className="hp-card">
          <h3><FaNewspaper className="hp-title-icon" /> Tin tức</h3>
          <ul>
            <li>⭐ Khai giảng năm học mới 2025 – 2026</li>
            <li>⭐ Tuyển sinh hệ Cao đẳng – Trung cấp</li>
            <li>⭐ Hướng dẫn đăng ký học phần</li>
          </ul>
          <div className="hp-view-more">Xem tất cả →</div>
        </div>

        {/* Thông báo */}
        <div className="hp-card">
          <h3><FaBullhorn className="hp-title-icon" /> Thông báo</h3>
          <ul>
            <li>🔔 Lịch thi kết thúc học phần</li>
            <li>🔔 Hạn nộp học phí kỳ I</li>
            <li>🔔 Cập nhật thông tin CCCD</li>
          </ul>
          <div className="hp-view-more">Xem tất cả →</div>
        </div>

        {/* Biểu mẫu */}
        <div className="hp-card">
          <h3><FaFileAlt className="hp-title-icon" /> Biểu mẫu</h3>
          <ul>
            <li>📄 Đơn xác nhận sinh viên</li>
            <li>📄 Đơn bảo lưu kết quả học tập</li>
            <li>📄 Mẫu đăng ký học lại</li>
          </ul>
          <div className="hp-view-more">Xem tất cả →</div>
        </div>

      </section>
    </div>
  );
};

export default HomePublic;
