// 📘 gradeUtils.js – Chuẩn quy đổi điểm, chữ, hệ 4, xếp loại học lực

/**
 * Quy đổi điểm hệ 10 sang hệ 4 và điểm chữ
 * @param {number} diem - điểm hệ 10
 * @returns {{he4: number, chu: string, xepLoai: string}}
 */
export function quyDoiDiem(diem) {
  const g = parseFloat(diem);
  if (isNaN(g)) return { he4: 0, chu: "F", xepLoai: "Kém / Không đạt" };

  if (g >= 9.0) return { he4: 4.0, chu: "A+", xepLoai: "Xuất sắc" };
  if (g >= 8.5) return { he4: 3.7, chu: "A", xepLoai: "Giỏi" };
  if (g >= 8.0) return { he4: 3.5, chu: "B+", xepLoai: "Giỏi" };
  if (g >= 7.0) return { he4: 3.0, chu: "B", xepLoai: "Khá" };
  if (g >= 6.5) return { he4: 2.5, chu: "C+", xepLoai: "Trung bình" };
  if (g >= 5.5) return { he4: 2.0, chu: "C", xepLoai: "Trung bình" };
  if (g >= 5.0) return { he4: 1.5, chu: "D+", xepLoai: "Yếu" };
  if (g >= 4.0) return { he4: 1.0, chu: "D", xepLoai: "Yếu" };
  return { he4: 0, chu: "F", xepLoai: "Kém / Không đạt" };
}

/**
 * Xếp loại học lực tổng kết theo GPA hệ 4
 */
export function xepLoaiHocLuc(gpa4) {
  if (gpa4 >= 3.6) return "Xuất sắc";
  if (gpa4 >= 3.2) return "Giỏi";
  if (gpa4 >= 2.5) return "Khá";
  if (gpa4 >= 2.0) return "Trung bình";
  if (gpa4 >= 1.0) return "Yếu";
  return "Kém";
}
