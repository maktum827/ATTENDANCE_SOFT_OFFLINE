import express from 'express';
const router = express.Router();
import {
  AttendancePDF,
  dutyListPDF,
  AttendanceReport,
  attendanceSummery,
} from '../controllers/pdfController.js';
import { academicInfo } from '../middlewares/auth.js';

router
  .route('/adminis/attendance_list/:code')
  .post(academicInfo, AttendancePDF);
router.route('/adminis/duty_list/:code').post(academicInfo, dutyListPDF);
router.route('/attendance_report/:code').post(academicInfo, AttendanceReport);
router.route('/summery_report/:code').post(academicInfo, attendanceSummery);

export default router;
