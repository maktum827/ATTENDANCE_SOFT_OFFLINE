import express from 'express';
import { newDepartment } from 'backend/controllers/mainController.js';

const router = express.Router();

router.post('/new_department', newDepartment);

export default router;
