const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    register,
    login,
    googleLogin,
    getGoogleClientConfig,
    logout,
    getPublicStats,
    getPublicUniversities,
    getPublicBranches,
    getPublicFaculties,
    getPublicDepartments,
    getMyProfile,
    getMyActivity,
    updateMyProfile,
    changeMyPassword
} = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/google-client', getGoogleClientConfig);
router.post('/logout', verifyToken, logout);

// GET /api/auth/stats
router.get('/stats', getPublicStats);
router.get('/institutions/universities', getPublicUniversities);
router.get('/institutions/branches', getPublicBranches);
router.get('/institutions/faculties', getPublicFaculties);
router.get('/institutions/departments', getPublicDepartments);
router.get('/me', verifyToken, getMyProfile);
router.get('/me/activity', verifyToken, getMyActivity);
router.patch('/me', verifyToken, updateMyProfile);
router.patch('/change-password', verifyToken, changeMyPassword);

module.exports = router;
