// src/utils/pdfFonts.js
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Gắn font mặc định Roboto
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default pdfMake;
