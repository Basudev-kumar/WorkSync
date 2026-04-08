const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { exportTasksReport, exportUsersReport } = require('../controllers/reportController');


// @route   GET /export/tasks
// @desc    Export all tasks as Excel/PDF
// @access  Admin only
router.get('/export/tasks', protect, adminOnly, exportTasksReport);

// @route   GET /export/users
// @desc    Export user-task report
// @access  Admin only
router.get('/export/users', protect, adminOnly, exportUsersReport);

module.exports = router;
