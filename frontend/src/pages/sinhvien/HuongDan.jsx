// src/pages/sinhvien/HuongDan.jsx
import React from "react";

const HuongDan = () => {
  return (
    <div className="page-container">
      <h2>📘 Hướng dẫn sử dụng hệ thống</h2>
      <ol>
        <li>Đăng nhập bằng tài khoản sinh viên do nhà trường cấp.</li>
        <li>Truy cập mục <b>“Lịch học”</b> để xem thời khóa biểu chi tiết.</li>
        <li>Xem <b>“Kết quả học tập”</b> để theo dõi điểm và xếp loại.</li>
        <li>Vào <b>“Thông tin cá nhân”</b> để kiểm tra hoặc cập nhật thông tin liên hệ.</li>
        <li>Nếu có thắc mắc, liên hệ Phòng Đào tạo để được hỗ trợ.</li>
      </ol>
      <p><i>Hệ thống được phát triển bởi nhóm kỹ thuật Trường Đại học XYZ.</i></p>
    </div>
  );
};

export default HuongDan;
