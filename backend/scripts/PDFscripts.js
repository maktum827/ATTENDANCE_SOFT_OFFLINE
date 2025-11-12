import { convertDigits } from '../utils/digitConverter.js';
import path from 'path';
import fs from 'fs';
import { i18n } from '../utils/i18nConfig.js';
import { PageCountFooter } from './Footer.js';
import { PadHeader } from './Headers.js';
import {
  getBase64,
  launchBrowser,
  __dirname,
  __filename,
  today,
  getFilePath,
  pdfPath,
  public_path,
  getSamplePath,
  BASE_URL,
} from '../utils/helper.js';
import bwipjs from 'bwip-js';

// making staff attendance list pdf
export async function generateAttendanceListPdf(data, locale, academy, res) {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  // set the current lang
  i18n.setLocale(locale || 'en');

  const today = new Date().toISOString().slice(0, 10); // fallback if not defined
  const info = {
    academy: academy,
    department: i18n.__('attendance'),
    heading: data.heading,
    date: `${convertDigits(today, locale)}`,
  };

  // build table rows from actual structure
  const tableRows = data.rows
    .map(
      (row) => `
    <tr>
      <td style="text-align: center">${convertDigits(row.serial, locale)}</td>
      <td style="text-align: center">${row.shift || ''}</td>
      <td style="text-align: center">${row.userType || ''}</td>
      <td style="text-align: center">${convertDigits(row.idNo, locale)}</td>
      <td>${row.name || ''}</td>
      <td>${row.department || ''}</td>
      <td>${row.classOrDesignation || ''}</td>
      <td>${row.groupName || ''}</td>
      <td style="text-align: center">${row.time || ''}</td>
      <td style="text-align: center">${row.gracePeriod || ''}</td>
      <td style="text-align: center">${row.inOut || ''}</td>
      <td style="text-align: center">${row.late || ''}</td>
      <td style="text-align: center">${row.status || ''}</td>
      <td style="text-align: center">${convertDigits(row.date, locale)}</td>
    </tr>
  `,
    )
    .join('');

  await page.setContent(`
    <html>
      <head>
        <style>
          body {
            font-family: 'SolaimanLipi', sans-serif;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 5px;
            text-align: center;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        ${PadHeader(info, locale)}
        <table>
          <thead>
            <tr>
              ${data.columns.map((column) => `<th>${column}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `);

  const Footer = PageCountFooter();

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    landscape: true,
    displayHeaderFooter: true,
    footerTemplate: PageCountFooter(),
    margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
  });

  await browser.close();

  // Send the PDF to client
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
  res.setHeader('Content-Length', pdfBuffer.length); // Add this line
  res.end(pdfBuffer); // Use end instead of send
}

export async function generateSummeryAttendanceListPdf(
  data,
  locale,
  academy,
  res,
) {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  // set the current lang
  i18n.setLocale(locale || 'en');

  const columns = [
    'ক্র.নং',
    'আইডি',
    'নাম',
    'জামাত বা পদবি',
    'মোট কার্যদিবস',
    'উপস্থিতি',
    'সময়মতো উপস্থিতি',
    'দেরিতে উপস্থিতি',
    'মোট অনুপস্থিতি',
    'মোট দেরি',
  ];

  const info = {
    academy: academy,
    department: i18n.__('attendance'),
    heading: data.heading, // ✅ correct
    date: `${convertDigits(today, locale)}`,
  };

  const tableRows = data.rows
    .map(
      (row, index) => `
      <tr>
        <td style="text-align: center">${convertDigits(index + 1, locale)}</td>
        <td style="text-align: center">${convertDigits(row.id || '', locale)}</td>
        <td>${row.name || ''}</td>
        <td>${row.className || ''}</td>
        <td style="text-align: center">${convertDigits(row.totalDays || '', locale)}</td>
        <td style="text-align: center">${convertDigits(row.presentDays || '', locale)}</td>
        <td style="text-align: center">${convertDigits(row.presentOnTimeDays || '', locale)}</td>
        <td style="text-align: center">${convertDigits(row.latePresentDays || '', locale)}</td>
        <td style="text-align: center">${convertDigits(row.absentDays || '', locale)}</td>
        <td>
          ${convertDigits(
            (row.totalLateDuration || '')
              .replace('h', ' ঘন্টা')
              .replace('m', ' মিনিট'),
            locale,
          )}
        </td>
      </tr>
    `,
    )
    .join('');

  await page.setContent(`
    <html>
      <head>
        <style>
          body {
            font-family: 'SolaimanLipi', sans-serif;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 5px;
          }
          th {
            background-color: #f2f2f2;
          }
          .transparentLogo {
            position: fixed;
            width: 300px;
            height: 300px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
          }
        </style>
      </head>
      <body>
        ${PadHeader(info, locale)}
        <img class="transparentLogo" src="${BASE_URL}${academy.logo_url}" alt="logo"/>
        <table>
          <thead>
            <tr>
              ${columns.map((col) => `<th>${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `);

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    landscape: true,
    displayHeaderFooter: true,
    footerTemplate: PageCountFooter(),
    margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
  });

  await browser.close();

  // Send the PDF to client
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=summery.pdf');
  res.setHeader('Content-Length', pdfBuffer.length); // Add this line
  res.end(pdfBuffer); // Use end instead of send
}

function buildAttendanceMatrix(dataArray, year, month) {
  const daysInMonth = new Date(year, month, 0).getDate(); // e.g., July → 31
  const matrix = {};

  dataArray.forEach((entry) => {
    const className = entry.class_designation || 'Unknown';
    const studentName = entry.name?.trim() || 'Unnamed';
    const timestamp = new Date(entry.timestamp);

    if (
      timestamp.getFullYear() === year &&
      timestamp.getMonth() + 1 === month
    ) {
      const day = timestamp.getDate();

      if (!matrix[className]) matrix[className] = {};
      if (!matrix[className][studentName])
        matrix[className][studentName] = Array(daysInMonth).fill('X');

      matrix[className][studentName][day - 1] = '✓'; // mark present
    }
  });

  return matrix;
}

function generateAttendanceTableHTML(
  matrix,
  year,
  month,
  type,
  shift,
  locale,
  academy,
) {
  i18n.setLocale('bn' || 'bn');

  const info = {
    academy: academy,
    department: i18n.__('attendance'),
    heading:
      type === 'Student'
        ? i18n.__('monthlyStudentAttendanceReport')
        : i18n.__('monthlyOfficiantAttendanceReport'),
    date: `${convertDigits(today, 'bn')}`,
  };

  const daysInMonth = new Date(year, month, 0).getDate();

  const fontCss = `
    @font-face {
      font-family: 'BanglaFont';
      src: url('https://res.cloudinary.com/plsshopit/raw/upload/v1741590177/public/SolaimanLipi_hwuked.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    body {
      font-family: 'BanglaFont', sans-serif;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #000;
      padding: 4px;
    }
    th {
      background-color: #eee;
    }
      .transparentLogo {
                      position: fixed;
                      width: 400px;
                      height: 400px;
                      top: 70%;
                      left: 50%;
                      opacity: 0.05;
                      transform: translate(-50%, -50%); /* Centering the logo exactly at the middle *
                  }
  `;

  let html = '';

  // let heading =

  Object.entries(matrix).forEach(([className, students]) => {
    html +=
      type === 'Student'
        ? `<h2>${i18n.__('class')}: ${className}, ${i18n.__('month')}: ${i18n.__(month)}, ${i18n.__('year')}: ${convertDigits(year, 'bn')}, ${i18n.__('shift')}: ${shift}</h2>`
        : `<h2>${i18n.__('month')}: ${i18n.__(month)}, ${i18n.__('year')}: ${convertDigits(year, 'bn')}, ${i18n.__('shift')}: ${shift}</h2>`;
    html += `<table><thead><tr><th>${i18n.__('name')}</th>`;
    for (let i = 1; i <= daysInMonth; i++) {
      html += `<th>${convertDigits(i, 'bn')}</th>`;
    }
    html += `</tr></thead><tbody>`;

    Object.entries(students).forEach(([studentName, attendance]) => {
      html += `<tr><td>${studentName}</td>`;
      attendance.forEach((status) => {
        html += `<td style="text-align: center;">${status}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table><br/>`;
  });

  const logoPath = getFilePath(academy.logo_url);
  const logoBase64 = getBase64(logoPath);

  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>${fontCss}</style>
        <title>Attendance Report</title>
      </head>
      <body>
      ${PadHeader(info, locale)}
      <img class="transparentLogo" src="${BASE_URL}${academy.logo_url}" alt="transparentLogo" />
        ${html}
      </body>
    </html>
  `;
}
export async function generateAttendanceReportPdf(data, locale, academy, res) {
  try {
    const matrix = buildAttendanceMatrix(data.data, data.year, data.month); // make sure these vars are defined

    const html = generateAttendanceTableHTML(
      matrix,
      data.year,
      data.month,
      data.type,
      data.shift,
      locale,
      academy,
    );

    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: true,
      displayHeaderFooter: true,
      footerTemplate: PageCountFooter(),
      margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
    });

    await browser.close();

    // Send the PDF to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.setHeader('Content-Length', pdfBuffer.length); // Add this line
    res.end(pdfBuffer); // Use end instead of send
  } catch (error) {
    console.error('PDF generation error:', error);
    res
      .status(500)
      .json({ error: 'Failed to generate report', details: error.message });
  }
}
