const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');
const { requireAcademicVerification } = require('../middleware/academic');
const {
    getAvailableExams,
    getExamByCode,
    startExam,
    submitExam,
    autosaveExamAnswers,
    getMyResults,
    heartbeatExamSession
} = require('../controllers/student.controller');

router.use(verifyToken);
router.use(allowRoles('student'));
router.use(requireAcademicVerification);

// Exams
router.get('/exams',                getAvailableExams);
router.get('/exam/:code',           getExamByCode);
router.post('/exam/:code/start',    startExam);
router.post('/exam/:code/heartbeat', heartbeatExamSession);
router.post('/exam/:code/autosave', autosaveExamAnswers);
router.post('/exam/:code/submit',   submitExam);

// Results
router.get('/results', getMyResults);

module.exports = router;
