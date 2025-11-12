import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';

import {
  generateAttendanceListPdf,
  generateSummeryAttendanceListPdf,
  generateAttendanceReportPdf,
} from '../scripts/PDFscripts.js';

const generatePdf = async (
  generateFunction,
  data,
  locale,
  res,
  academy,
  errorMessage,
) => {
  try {
    await generateFunction(data, locale, academy, res);
  } catch (err) {
    res.status(500).json({
      message: errorMessage,
      error: err.message,
    });
  }
};

export const AttendancePDF = catchAsyncErrors(async (req, res) => {
  // const locale = getCurrentLang(req);
  const locale = 'bn';
  const academy = req.academy;
  await generatePdf(
    generateAttendanceListPdf,
    req.body,
    locale,
    res,
    academy,
    'Error generating provided books PDF',
  );
});

export const dutyListPDF = catchAsyncErrors(async (req, res) => {
  const locale = 'bn';
  const academy = req.academy;
  await generatePdf(
    generateDutyListPdf,
    req.body,
    locale,
    res,
    academy,
    'Error generating duty list PDF',
  );
});

export const AttendanceReport = catchAsyncErrors(async (req, res) => {
  const locale = 'bn';
  const academy = req.academy;

  await generatePdf(
    generateAttendanceReportPdf,
    req.body,
    locale,
    res,
    academy,
    'Error generating attendance report PDF',
  );
});

export const attendanceSummery = catchAsyncErrors(async (req, res) => {
  const locale = 'bn';
  const academy = req.academy;

  await generatePdf(
    generateSummeryAttendanceListPdf,
    req.body,
    locale,
    res,
    academy,
    'Error generating duty list PDF',
  );
});
