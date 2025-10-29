import React from "react";
import "./Footer.css";
import logo from "../assets/logo.png";
import { FaFacebook, FaEnvelope, FaPhone } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__left">
          <img src={logo} alt="Logo" className="footer-logo" />
          <div>
            <h4>Cổng thông tin sinh viên</h4>
            <p>Magic Academy University © 2025</p>
          </div>
        </div>

        <div className="footer__center">
          <ul>
            <li><a href="/sinhvien">Trang chủ</a></li>
            <li><a href="/sinhvien/huongdan">Hướng dẫn</a></li>
            <li><a href="/sinhvien/phanhoi">Phản hồi</a></li>
          </ul>
        </div>

        <div className="footer__right">
          <p><FaEnvelope /> support@magicacademy.edu.vn</p>
          <p><FaPhone /> (028) 1234 5678</p>
          <p><FaFacebook /> /MagicAcademy</p>
        </div>
      </div>
      <div className="footer__bottom">
        © {new Date().getFullYear()} Magic Academy | All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
