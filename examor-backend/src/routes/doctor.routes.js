const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');
const { requireAcademicVerification } = require('../middleware/academic');
const {
    getCourses,
    getQuestionBank,
    saveQuestionToBank,
    insertQuestionFromBank,
    deleteBankQuestion,
    createExam,
    updateExam,
    deleteExam,
    getExam,
    getExams,
    addQuestion,
    updateQuestion,
    duplicateQuestion,
    reorderQuestion,
    deleteQuestion,
    getExamResults,
    getLiveMonitor,
    getAttemptReview,
    submitAttemptReview
} = require('../controllers/doctor.controller');

// كل الـ Doctor Routes محتاجة Token وRole doctor
router.use(verifyToken);
router.use(allowRoles('doctor', 'teacher'));
router.use(requireAcademicVerification);

// Courses
router.get('/courses', getCourses);
router.get('/question-bank', getQuestionBank);
router.delete('/question-bank/:bankQuestionId', deleteBankQuestion);

// Exams
router.get('/exams',         getExams);
router.post('/exams',        createExam);
router.patch('/exams/:id',   updateExam);
router.delete('/exams/:id',  deleteExam);
router.get('/exams/:id',     getExam);

// Questions
router.post('/exams/:id/questions', addQuestion);
router.patch('/exams/:id/questions/:questionId', updateQuestion);
router.post('/exams/:id/questions/:questionId/duplicate', duplicateQuestion);
router.patch('/exams/:id/questions/:questionId/reorder', reorderQuestion);
router.post('/exams/:id/questions/:questionId/save-to-bank', saveQuestionToBank);
router.post('/exams/:id/questions/from-bank/:bankQuestionId', insertQuestionFromBank);
router.delete('/exams/:id/questions/:questionId', deleteQuestion);

// Results
router.get('/exams/:id/results', getExamResults);
router.get('/monitor/open-attempts', getLiveMonitor);
router.get('/attempts/:attemptId/review', getAttemptReview);
router.patch('/attempts/:attemptId/review', submitAttemptReview);

module.exports = router;
