const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');
const {
    getUniversities,
    addUniversity,
    deleteUniversity,
    getBranches,
    addBranch,
    deleteBranch,
    getFaculties,
    addFaculty,
    deleteFaculty,
    getDepartments,
    addDepartment,
    deleteDepartment,
    getCourses,
    addCourse,
    deleteCourse,
    getUsers,
    addUser,
    backfillDemoExamsForUsers,
    updateUser,
    resetUserPassword,
    deleteUser,
    setUserAcademicVerification,
    setUserStatus,
    setUsersBulkStatus,
    setUsersBulkAcademicVerification,
    getExams,
    updateExam,
    deleteExamAdmin,
    getAttempts,
    forceSubmitAttempt,
    forceSubmitAttemptsBulk,
    getViolations,
    getAuditLogs,
    getStatistics
} = require('../controllers/admin.controller');

// كل الـ Admin Routes محتاجة Token وRole admin
router.use(verifyToken);
router.use(allowRoles('admin'));

// Universities
router.get('/universities',  getUniversities);
router.post('/universities', addUniversity);
router.delete('/universities/:id', deleteUniversity);

// Branches
router.get('/branches',  getBranches);
router.post('/branches', addBranch);
router.delete('/branches/:id', deleteBranch);

// Faculties
router.get('/faculties', getFaculties);
router.post('/faculties', addFaculty);
router.delete('/faculties/:id', deleteFaculty);

// Departments
router.get('/departments',  getDepartments);
router.post('/departments', addDepartment);
router.delete('/departments/:id', deleteDepartment);

// Courses
router.get('/courses',  getCourses);
router.post('/courses', addCourse);
router.delete('/courses/:id', deleteCourse);

// Users
router.get('/users', getUsers);
router.post('/users', addUser);
router.post('/users/backfill-demo-exams', backfillDemoExamsForUsers);
router.patch('/users/bulk/status', setUsersBulkStatus);
router.patch('/users/bulk/academic-verification', setUsersBulkAcademicVerification);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/password', resetUserPassword);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/academic-verification', setUserAcademicVerification);
router.patch('/users/:id/status', setUserStatus);

// Exams / Attempts
router.get('/exams', getExams);
router.patch('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExamAdmin);
router.get('/attempts', getAttempts);
router.patch('/attempts/bulk/force-submit', forceSubmitAttemptsBulk);
router.patch('/attempts/:id/force-submit', forceSubmitAttempt);
router.get('/violations', getViolations);
router.get('/audit-logs', getAuditLogs);

// Statistics
router.get('/statistics', getStatistics);

module.exports = router;
