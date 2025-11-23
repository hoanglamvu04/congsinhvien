import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaFileExcel,
  FaFilePdf,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {
  format,
  endOfWeek,
  eachWeekOfInterval,
} from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import pdfMake from "../../utils/pdfFonts";
import "../../styles/LichHoc.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const tietToCa = (tiet) => {
  if (tiet <= 5) return "Sáng";
  if (tiet <= 10) return "Chiều";
  return "Tối";
};

const LichHoc = () => {
  // -------------------- URL + localStorage ---------------------
  const [searchParams, setSearchParams] = useSearchParams();

  const loadLS = (key, def) =>
    localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : def;

  // state UI
  const [tab, setTab] = useState(searchParams.get("tab") || loadLS("tab", "tuan"));
  const [hocKy, setHocKy] = useState(searchParams.get("hocky") || loadLS("hocky", "tatca"));
  const [mon, setMon] = useState(searchParams.get("mon") || loadLS("mon", "tatca"));
  const [weekLabel, setWeekLabel] = useState(searchParams.get("tuan") || loadLS("tuan", null));

  // data
  const [lichHoc, setLichHoc] = useState([]);
  const [hocKyList, setHocKyList] = useState([]);
  const [monList, setMonList] = useState([]);
  const [weekList, setWeekList] = useState([]);
  const [tuan, setTuan] = useState(null);

  // ---------------------- FETCH DATA ----------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/thoi-khoa-bieu/sinhvien`, {
          withCredentials: true,
        });

        const data = res.data.data || [];
        setLichHoc(data);

        const ky = [...new Set(data.map((d) => d.hoc_ky).filter(Boolean))];
        const monhoc = [...new Set(data.map((d) => d.ten_mon).filter(Boolean))];
        setHocKyList(ky);
        setMonList(monhoc);

        if (data.length > 0) {
          const minDate = new Date(Math.min(...data.map((i) => new Date(i.ngay_hoc))));
          const maxDate = new Date(Math.max(...data.map((i) => new Date(i.ngay_hoc))));

          const weeks = eachWeekOfInterval({ start: minDate, end: maxDate }, { weekStartsOn: 1 });

          const list = weeks.map((start, idx) => {
            const end = endOfWeek(start, { weekStartsOn: 1 });
            return {
              label: `Tuần ${idx + 1} (${format(start, "dd/MM")} - ${format(end, "dd/MM")})`,
              start,
              end,
            };
          });

          setWeekList(list);

          let currentWeek = null;
          if (weekLabel) {
            currentWeek = list.find((w) => w.label === weekLabel);
          }
          if (!currentWeek) {
            const today = new Date();
            currentWeek = list.find((w) => today >= w.start && today <= w.end) || list[0];
          }
          setTuan(currentWeek);
        }
      } catch (err) {
        toast.error("Không thể tải thời khóa biểu!");
      }
    };

    fetchData();
  }, []);

  // ---------------------- SYNC → URL + LS ------------------------
  useEffect(() => {
    const params = {};
    params.tab = tab;
    params.hocky = hocKy;
    params.mon = mon;
    if (tab === "tuan" && tuan) params.tuan = tuan.label;
    setSearchParams(params);

    localStorage.setItem("tab", JSON.stringify(tab));
    localStorage.setItem("hocky", JSON.stringify(hocKy));
    localStorage.setItem("mon", JSON.stringify(mon));
    localStorage.setItem("tuan", JSON.stringify(tuan?.label || null));
  }, [tab, hocKy, mon, tuan]);

  // ----------------------- FILTER DATA ---------------------------
  const filtered = useMemo(() => {
    let data = lichHoc;

    if (hocKy !== "tatca") data = data.filter((i) => i.hoc_ky == hocKy);
    if (mon !== "tatca") data = data.filter((i) => i.ten_mon === mon);

    if (tab === "tuan" && tuan) {
      data = data.filter((i) => {
        const d = new Date(i.ngay_hoc);
        return d >= tuan.start && d <= tuan.end;
      });
    }

    return data;
  }, [lichHoc, hocKy, mon, tuan, tab]);

  // --------------------- NAVIGATE WEEKS -------------------------
  const prevWeek = () => {
    const idx = weekList.findIndex((w) => w.label === tuan.label);
    if (idx > 0) setTuan(weekList[idx - 1]);
  };

  const nextWeek = () => {
    const idx = weekList.findIndex((w) => w.label === tuan.label);
    if (idx < weekList.length - 1) setTuan(weekList[idx + 1]);
  };

  // --------------------- EXPORT EXCEL ---------------------------
  const exportExcel = () => {
    if (!filtered.length) return toast.warning("Không có dữ liệu!");

    const ws = XLSX.utils.json_to_sheet(
      filtered.map((i) => ({
        "Ngày học": format(new Date(i.ngay_hoc), "dd/MM/yyyy"),
        "Thứ": i.thu_trong_tuan,
        "Ca": tietToCa(i.tiet_bat_dau),
        "Môn": i.ten_mon,
        "GV": i.ten_giang_vien,
        "Phòng": i.phong_hoc,
        "Lớp HP": i.ma_lop_hp,
        "Trạng thái": i.trang_thai,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LichHoc");
    XLSX.writeFile(wb, `lich_hoc.xlsx`);

    toast.success("Xuất Excel thành công!");
  };

  // --------------------- EXPORT PDF -----------------------------
  const exportPDF = () => {
    if (!filtered.length) return toast.warning("Không có dữ liệu!");

    const tableBody = [
      ["Ngày", "Thứ", "Ca", "Môn", "Giảng viên", "Phòng", "Lớp HP", "Trạng thái"],
      ...filtered.map((i) => [
        format(new Date(i.ngay_hoc), "dd/MM/yyyy"),
        i.thu_trong_tuan,
        tietToCa(i.tiet_bat_dau),
        i.ten_mon,
        i.ten_giang_vien,
        i.phong_hoc,
        i.ma_lop_hp,
        i.trang_thai,
      ]),
    ];

    const docDefinition = {
      content: [
        { text: "LỊCH HỌC SINH VIÊN", style: "header" },
        {
          table: { headerRows: 1, widths: ["auto", "auto", "auto", "*", "*", "auto", "auto", "auto"], body: tableBody },
          layout: "lightHorizontalLines",
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: "center", margin: [0, 0, 0, 10] },
      },
      defaultStyle: { font: "Roboto", fontSize: 11 },
    };

    pdfMake.createPdf(docDefinition).download("lich_hoc.pdf");
    toast.success("Xuất PDF thành công!");
  };

  // --------------------------------------------------------------
  return (
    <div className="page-container">
      <ToastContainer position="top-center" autoClose={2000} />
      <h2 className="lichhoc-title">
        <FaCalendarAlt style={{ color: "#007bff", marginRight: 8 }} />
        Lịch học sinh viên
      </h2>

      {/* TAB */}
      <div className="tab-switch">
        <button className={tab === "hocKy" ? "active" : ""} onClick={() => setTab("hocKy")}>
          LỊCH HỌC DỰ KIẾN THEO HỌC KỲ
        </button>
        <button className={tab === "tuan" ? "active" : ""} onClick={() => setTab("tuan")}>
          LỊCH HỌC THEO TUẦN
        </button>
      </div>

      {/* FILTER */}
      <div className="filter-bar">
        <select value={hocKy} onChange={(e) => setHocKy(e.target.value)}>
          <option value="tatca">Tất cả học kỳ</option>
          {hocKyList.map((k, i) => (
            <option key={i} value={k}>Học kỳ {k}</option>
          ))}
        </select>

        <select value={mon} onChange={(e) => setMon(e.target.value)}>
          <option value="tatca">Tất cả môn học</option>
          {monList.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>

        {tab === "tuan" && (
          <select
            value={tuan?.label || ""}
            onChange={(e) => {
              const week = weekList.find((w) => w.label === e.target.value);
              if (week) setTuan(week);
            }}
          >
            {weekList.map((w, idx) => (
              <option key={idx} value={w.label}>{w.label}</option>
            ))}
          </select>
        )}

        <button onClick={exportExcel}>
          <FaFileExcel style={{ color: "green", marginRight: 5 }} /> Excel
        </button>
        <button onClick={exportPDF}>
          <FaFilePdf style={{ color: "red", marginRight: 5 }} /> PDF
        </button>
      </div>

      {/* HIỂN THỊ */}
      {tab === "tuan" ? (
        <div className="hocKy-container">
          <div className="week-nav">
            <button onClick={prevWeek}><FaChevronLeft /> Tuần trước</button>
            <span className="week-label">{tuan?.label}</span>
            <button onClick={nextWeek}>Tuần sau <FaChevronRight /></button>
          </div>

          <table className="hocKy-matrix">
            <thead>
              <tr>
                <th></th>
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, i) => <th key={i}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {["Sáng", "Chiều", "Tối"].map((ca) => (
                <tr key={ca}>
                  <td className={`ca-label ca-${ca.toLowerCase()}`}>{ca}</td>
                  {[2, 3, 4, 5, 6, 7, 8].map((thu) => {
                    const buoi = filtered.filter(
                      (i) => i.thu_trong_tuan === thu && tietToCa(i.tiet_bat_dau) === ca
                    );
                    return (
                      <td key={thu} className={`hocKy-cell ca-${ca.toLowerCase()}`}>
                        {buoi.length ? (
                          buoi.map((b, j) => (
                            <div key={j} className="hocKy-item">
                              <strong>{b.ten_mon}</strong>
                              <span>Phòng: {b.phong_hoc}</span>
                              <div>GV: {b.ten_giang_vien}</div>
                              <div>Tiết: {b.tiet_bat_dau}-{b.tiet_ket_thuc}</div>
                            </div>
                          ))
                        ) : (
                          <span className="no-class">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Ngày học</th>
              <th>Thứ</th>
              <th>Ca</th>
              <th>Môn học</th>
              <th>Giảng viên</th>
              <th>Phòng</th>
              <th>Lớp HP</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="no-data">⚠️ Không có dữ liệu.</td></tr>
            ) : (
              filtered.map((i, idx) => (
                <tr key={idx}>
                  <td>{format(new Date(i.ngay_hoc), "dd/MM/yyyy")}</td>
                  <td>Thứ {i.thu_trong_tuan}</td>
                  <td>{tietToCa(i.tiet_bat_dau)}</td>
                  <td>{i.ten_mon}</td>
                  <td>{i.ten_giang_vien}</td>
                  <td>{i.phong_hoc}</td>
                  <td>{i.ma_lop_hp}</td>
                  <td>{i.trang_thai}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LichHoc;
