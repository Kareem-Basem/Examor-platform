import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mammoth from 'mammoth/mammoth.browser';
import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/DashboardLayout';

function DoctorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const isAr = i18n.language === 'ar';
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  const isTablet = viewportWidth <= 980;
  const isMobile = viewportWidth <= 640;
  const isNarrowMobile = viewportWidth <= 430;

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const text = useMemo(
    () => ({
      teacher: isAr ? '\u0627\u0644\u0645\u062f\u0631\u0633' : 'Teacher',
      university: isAr ? '\u0627\u0644\u062c\u0627\u0645\u0639\u0629' : 'University',
      branch: isAr ? '\u0627\u0644\u0641\u0631\u0639' : 'Branch',
      faculty: isAr ? '\u0627\u0644\u0643\u0644\u064a\u0629' : 'Faculty',
      department: isAr ? '\u0627\u0644\u0642\u0633\u0645' : 'Department',
      myExams: isAr ? '\u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a\u064a' : 'My Exams',
      results: isAr ? '\u0627\u0644\u0646\u062a\u0627\u0626\u062c' : 'Results',
      profile: isAr ? '\u0627\u0644\u062d\u0633\u0627\u0628' : 'Profile',
      courses: isAr ? '\u0627\u0644\u0645\u0648\u0627\u062f' : 'Courses',
      liveMonitor: isAr ? '\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u062d\u064a\u0629' : 'Live Monitor',
      createExam: isAr ? '\u0625\u0646\u0634\u0627\u0621 \u0627\u0645\u062a\u062d\u0627\u0646' : 'Create Exam',
      title: isAr ? '\u0627\u0644\u0639\u0646\u0648\u0627\u0646' : 'Title',
      accessMode: isAr ? '\u0646\u0648\u0639 \u0627\u0644\u0648\u0635\u0648\u0644' : 'Access Mode',
      departmentExam: isAr ? '\u0627\u0645\u062a\u062d\u0627\u0646 \u0644\u0644\u0642\u0633\u0645' : 'Department Exam',
      linkExam: isAr ? '\u0627\u0645\u062a\u062d\u0627\u0646 \u0628\u0627\u0644\u0631\u0627\u0628\u0637' : 'Link Exam',
      course: isAr ? '\u0627\u0644\u0645\u0627\u062f\u0629' : 'Course',
      academicYear: isAr ? '\u0627\u0644\u0641\u0631\u0642\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629' : 'Academic Year',
      duration: isAr ? '\u0627\u0644\u0645\u062f\u0629 (\u062f\u0642\u0627\u0626\u0642)' : 'Duration (min)',
      totalMarks: isAr ? '\u0627\u0644\u062f\u0631\u062c\u0629 \u0627\u0644\u0643\u0644\u064a\u0629' : 'Total Marks',
      examCode: isAr ? '\u0643\u0648\u062f \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Exam Code',
      startDate: isAr ? '\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0628\u062f\u0627\u064a\u0629' : 'Start Date',
      endDate: isAr ? '\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0646\u0647\u0627\u064a\u0629' : 'End Date',
      randomizeQuestions: isAr ? '\u0639\u0634\u0648\u0627\u0626\u064a\u0629 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0623\u0633\u0626\u0644\u0629' : 'Randomize Question Order',
      randomizeOptions: isAr ? '\u0639\u0634\u0648\u0627\u0626\u064a\u0629 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a' : 'Randomize MCQ Choices',
      randomizeHint: isAr ? '\u064a\u0645\u0643\u0646 \u0623\u0646 \u064a\u0643\u0648\u0646 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a MCQ \u0645\u062e\u062a\u0644\u0641\u064b\u0627 \u0644\u0643\u0644 \u0637\u0627\u0644\u0628\u060c \u0645\u0639 \u0628\u0642\u0627\u0621 \u0627\u0644\u062a\u0631\u062a\u064a\u0628 \u062b\u0627\u0628\u062a\u064b\u0627 \u0644\u0646\u0641\u0633 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629.' : 'Each student gets a different order, while the order stays fixed for the same attempt.',
      codeMode: isAr ? '\u0646\u0645\u0637 \u0627\u0644\u0643\u0648\u062f' : 'Code Mode',
      codeAuto: isAr ? '\u062a\u0648\u0644\u064a\u062f \u062a\u0644\u0642\u0627\u0626\u064a' : 'Auto Generate',
      codeManual: isAr ? '\u0625\u062f\u062e\u0627\u0644 \u064a\u062f\u0648\u064a' : 'Manual Code',
      proctoringEnabled: isAr ? '\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627' : 'Enable Camera Proctoring',
      screenCaptureProtection: isAr ? '\u062a\u0642\u0644\u064a\u0644 \u0627\u0644\u062a\u0635\u0648\u064a\u0631 \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Enable Screen Capture Protection',
      maxAttempts: isAr ? '\u0623\u0642\u0635\u0649 \u0639\u062f\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a' : 'Max Attempts',
      postEndVisibility: isAr ? '\u0628\u0639\u062f \u0627\u0646\u062a\u0647\u0627\u0621 \u0627\u0644\u0648\u0642\u062a' : 'After End Time',
      hideAfterEnd: isAr ? '\u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Hide Exam',
      archiveAfterEnd: isAr ? '\u0625\u0628\u0642\u0627\u0621 \u0643\u0623\u0631\u0634\u064a\u0641' : 'Keep as Archive',
      postEndGraceMinutes: isAr ? '\u0645\u062f\u0629 \u0627\u0644\u0633\u0645\u0627\u062d \u0628\u0639\u062f \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621 (\u062f\u0642\u064a\u0642\u0629)' : 'Grace Minutes After End',
      demoExam: isAr ? '\u0627\u0645\u062a\u062d\u0627\u0646 \u062a\u062c\u0631\u064a\u0628\u064a (Demo)' : 'Demo Exam',
      create: isAr ? '\u0625\u0646\u0634\u0627\u0621' : 'Create',
      cancel: isAr ? '\u0625\u0644\u063a\u0627\u0621' : 'Cancel',
      questions: isAr ? '\u0627\u0644\u0623\u0633\u0626\u0644\u0629' : 'Questions',
      actions: isAr ? '\u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a' : 'Actions',
      start: isAr ? '\u0627\u0644\u0628\u062f\u0627\u064a\u0629' : 'Start',
      end: isAr ? '\u0627\u0644\u0646\u0647\u0627\u064a\u0629' : 'End',
      code: isAr ? '\u0627\u0644\u0643\u0648\u062f' : 'Code',
      type: isAr ? '\u0627\u0644\u0646\u0648\u0639' : 'Type',
      noExams: isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0628\u0639\u062f.' : 'No exams yet.',
      viewResults: isAr ? '\u0639\u0631\u0636 \u0627\u0644\u0646\u062a\u0627\u0626\u062c' : 'View Results',
      viewExam: isAr ? '\u0639\u0631\u0636 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'View Exam',
      printExam: isAr ? '\u0637\u0628\u0627\u0639\u0629 / PDF' : 'Print / PDF',
      editExam: isAr ? '\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Edit Exam',
      deleteExam: isAr ? '\u062d\u0630\u0641 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Delete Exam',
      editQuestion: isAr ? '\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0633\u0624\u0627\u0644' : 'Edit Question',
      deleteQuestion: isAr ? '\u062d\u0630\u0641 \u0627\u0644\u0633\u0624\u0627\u0644' : 'Delete Question',
      addQuestion: isAr ? '\u0625\u0636\u0627\u0641\u0629 \u0633\u0624\u0627\u0644' : 'Add Question',
      exam: isAr ? '\u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Exam',
      student: isAr ? '\u0627\u0644\u0637\u0627\u0644\u0628' : 'Student',
      email: isAr ? '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a' : 'Email',
      score: isAr ? '\u0627\u0644\u062f\u0631\u062c\u0629' : 'Score',
      percentage: isAr ? '\u0627\u0644\u0646\u0633\u0628\u0629' : 'Percentage',
      submitTime: isAr ? '\u0648\u0642\u062a \u0627\u0644\u062a\u0633\u0644\u064a\u0645' : 'Submit Time',
      status: isAr ? '\u0627\u0644\u062d\u0627\u0644\u0629' : 'Status',
      violations: isAr ? '\u0627\u0644\u0645\u062e\u0627\u0644\u0641\u0627\u062a' : 'Violations',
      details: isAr ? '\u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644' : 'Details',
      terminated: isAr ? '\u0625\u0646\u0647\u0627\u0621 \u0625\u062c\u0628\u0627\u0631\u064a' : 'Forced Submit',
      completedStatus: isAr ? '\u062a\u0633\u0644\u064a\u0645 \u0639\u0627\u062f\u064a' : 'Completed',
      pendingReview: isAr ? '\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629' : 'Pending Review',
      openAttempts: isAr ? '\u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0627\u0644\u0645\u0641\u062a\u0648\u062d\u0629' : 'Open Attempts',
      lastSeen: isAr ? '\u0622\u062e\u0631 \u0646\u0634\u0627\u0637' : 'Last Seen',
      noOpenAttempts: isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0645\u0641\u062a\u0648\u062d\u0629 \u062d\u0627\u0644\u064a\u064b\u0627.' : 'No open attempts right now.',
      reviewAttempt: isAr ? '\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629' : 'Review Attempt',
      awardedMarks: isAr ? '\u0627\u0644\u062f\u0631\u062c\u0629 \u0627\u0644\u0645\u0645\u0646\u0648\u062d\u0629' : 'Awarded Marks',
      reviewFeedback: isAr ? '\u062a\u0639\u0644\u064a\u0642 \u0627\u0644\u0645\u0631\u0627\u062c\u0639' : 'Reviewer Feedback',
      studentAnswer: isAr ? '\u0625\u062c\u0627\u0628\u0629 \u0627\u0644\u0637\u0627\u0644\u0628' : 'Student Answer',
      reviewSaved: isAr ? '\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629' : 'Review saved',
      noEssayAnswers: isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0625\u062c\u0627\u0628\u0627\u062a \u0645\u0642\u0627\u0644\u064a\u0629 \u062a\u062d\u062a\u0627\u062c \u0645\u0631\u0627\u062c\u0639\u0629.' : 'No essay answers require review.',
      noResults: isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c \u0628\u0639\u062f.' : 'No results found.',
      refresh: isAr ? '\u062a\u062d\u062f\u064a\u062b' : 'Refresh',
      search: isAr ? '\u0628\u062d\u062b' : 'Search',
      sortBy: isAr ? '\u0627\u0644\u062a\u0631\u062a\u064a\u0628 \u062d\u0633\u0628' : 'Sort by',
      allTypes: isAr ? '\u0643\u0644 \u0627\u0644\u0623\u0646\u0648\u0627\u0639' : 'All types',
      allCourses: isAr ? '\u0643\u0644 \u0627\u0644\u0645\u0648\u0627\u062f' : 'All courses',
      exportCsv: isAr ? '\u062a\u0635\u062f\u064a\u0631 CSV' : 'Export CSV',
      exportExcel: isAr ? '\u062a\u0635\u062f\u064a\u0631 Excel' : 'Export Excel',
      exportSelectedCsv: isAr ? '\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0645\u062d\u062f\u062f CSV' : 'Export Selected CSV',
      exportSelectedExcel: isAr ? '\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0645\u062d\u062f\u062f Excel' : 'Export Selected Excel',
      copySelectedCodes: isAr ? '\u0646\u0633\u062e \u0623\u0643\u0648\u0627\u062f \u0627\u0644\u0645\u062d\u062f\u062f' : 'Copy Selected Codes',
      selectedCount: isAr ? '\u0639\u062f\u062f \u0627\u0644\u0645\u062d\u062f\u062f' : 'Selected',
      previous: isAr ? '\u0627\u0644\u0633\u0627\u0628\u0642' : 'Previous',
      next: isAr ? '\u0627\u0644\u062a\u0627\u0644\u064a' : 'Next',
      page: isAr ? '\u0635\u0641\u062d\u0629' : 'Page',
      byId: 'ID',
      byName: isAr ? '\u0627\u0644\u0627\u0633\u0645' : 'Name',
      byNewest: isAr ? '\u0627\u0644\u0623\u062d\u062f\u062b' : 'Newest',
      searchExams: isAr ? '\u0627\u0628\u062d\u062b \u0628\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0623\u0648 \u0627\u0644\u0643\u0648\u062f...' : 'Search by exam title or code...',
      searchResults: isAr ? '\u0627\u0628\u062d\u062b \u0628\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628 \u0623\u0648 \u0627\u0644\u0628\u0631\u064a\u062f...' : 'Search by student name or email...',
      searchCourses: isAr ? '\u0627\u0628\u062d\u062b \u0628\u0627\u0633\u0645 \u0627\u0644\u0645\u0627\u062f\u0629...' : 'Search by course name...',
      noCourses: isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0648\u0627\u062f \u0645\u0631\u062a\u0628\u0637\u0629 \u0628\u062d\u0633\u0627\u0628\u0643.' : 'No department courses linked to your account.',
      independentTitle: isAr ? '\u0645\u062f\u0631\u0633 \u0645\u0633\u062a\u0642\u0644' : 'Independent Teacher',
      independentHint: isAr ? '\u064a\u0645\u0643\u0646\u0643 \u0625\u0646\u0634\u0627\u0621 \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0628\u0627\u0644\u0631\u0627\u0628\u0637 \u0623\u0648 \u0627\u0644\u0643\u0648\u062f \u0648\u0645\u0634\u0627\u0631\u0643\u062a\u0647\u0627 \u0645\u0639 \u0623\u064a \u0645\u062c\u0645\u0648\u0639\u0629.' : 'You can create link-based exams and share them with any group.',
      academicTitle: isAr ? '\u0645\u062f\u0631\u0633 \u0623\u0643\u0627\u062f\u064a\u0645\u064a' : 'Academic Teacher',
      academicHint: isAr ? '\u064a\u0645\u0643\u0646\u0643 \u0625\u0646\u0634\u0627\u0621 \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0644\u0644\u0642\u0633\u0645 \u0623\u0648 \u0644\u0644\u0645\u0642\u0631\u0631\u060c \u0648\u0623\u064a\u0636\u064b\u0627 \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0628\u0627\u0644\u0631\u0627\u0628\u0637.' : 'You can create department exams and also private link-based exams.',
      copyCode: isAr ? '\u0646\u0633\u062e \u0627\u0644\u0643\u0648\u062f' : 'Copy Code',
      copied: isAr ? '\u062a\u0645 \u0627\u0644\u0646\u0633\u062e' : 'Copied',
      questionText: isAr ? '\u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644' : 'Question Text',
      questionType: isAr ? '\u0646\u0648\u0639 \u0627\u0644\u0633\u0624\u0627\u0644' : 'Question Type',
      marks: isAr ? '\u0627\u0644\u062f\u0631\u062c\u0629' : 'Marks',
      correctAnswer: isAr ? '\u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0627\u0644\u0635\u062d\u064a\u062d\u0629' : 'Correct Answer',
      options: isAr ? '\u0627\u0644\u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a' : 'Options',
      option: isAr ? '\u0627\u062e\u062a\u064a\u0627\u0631' : 'Option',
      correct: isAr ? '\u0635\u062d\u064a\u062d' : 'Correct',
      saveQuestion: isAr ? '\u062d\u0641\u0638 \u0627\u0644\u0633\u0624\u0627\u0644' : 'Save Question',
      examPreview: isAr ? '\u0645\u0639\u0627\u064a\u0646\u0629 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Exam Preview',
      questionNumber: isAr ? '\u0627\u0644\u0633\u0624\u0627\u0644' : 'Question',
      noQuestionsYet: isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u0633\u0626\u0644\u0629 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0628\u0639\u062f.' : 'No questions have been added yet.',
      modelAnswer: isAr ? '\u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0627\u0644\u0646\u0645\u0648\u0630\u062c\u064a\u0629' : 'Model Answer',
      printHint: isAr ? '\u0627\u0633\u062a\u062e\u062f\u0645 Print Destination > Save as PDF \u0644\u062d\u0641\u0638 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0643\u0645\u0644\u0641 PDF.' : 'Use the print dialog and choose Save as PDF to download the exam.',
      updateExamError: isAr ? '\u062a\u0639\u0630\u0631 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646.' : 'Unable to update the exam.',
      examLocked: isAr ? '\u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0645\u0642\u0641\u0648\u0644 \u0644\u0644\u062a\u0639\u062f\u064a\u0644 \u0644\u0623\u0646\u0647 \u0628\u062f\u0623 \u0623\u0648 \u062a\u0648\u062c\u062f \u0644\u0647 \u0645\u062d\u0627\u0648\u0644\u0627\u062a.' : 'This exam is locked because it has started or already has attempts.',
      saveChanges: isAr ? '\u062d\u0641\u0638 \u0627\u0644\u062a\u0639\u062f\u064a\u0644\u0627\u062a' : 'Save Changes',
      deleteConfirm: isAr ? '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644\u061f' : 'Are you sure you want to delete this question?',
      updateQuestionError: isAr ? '\u062a\u0639\u0630\u0631 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0633\u0624\u0627\u0644.' : 'Unable to update the question.',
      deleteQuestionError: isAr ? '\u062a\u0639\u0630\u0631 \u062d\u0630\u0641 \u0627\u0644\u0633\u0624\u0627\u0644.' : 'Unable to delete the question.',
      close: isAr ? '\u0625\u063a\u0644\u0627\u0642' : 'Close',
      shortAnswer: isAr ? '\u0625\u062c\u0627\u0628\u0629 \u0642\u0635\u064a\u0631\u0629' : 'Short Answer',
      trueFalse: isAr ? '\u0635\u062d / \u062e\u0637\u0623' : 'True / False',
      createError: isAr ? '\u062a\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646.' : 'Unable to create the exam.',
      deleteExamConfirm: isAr ? '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646\u061f \u0633\u064a\u062a\u0645 \u062d\u0630\u0641 \u0623\u0633\u0626\u0644\u062a\u0647 \u0623\u064a\u0636\u064b\u0627.' : 'Are you sure you want to delete this exam? Its questions will be deleted too.',
      deleteExamError: isAr ? '\u062a\u0639\u0630\u0631 \u062d\u0630\u0641 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646.' : 'Unable to delete the exam.',
      createdOpenQuestions: isAr ? '\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646. \u0627\u0644\u062e\u0637\u0648\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629: \u0623\u0636\u0641 \u0623\u0633\u0626\u0644\u062a\u0643 \u0627\u0644\u0622\u0646.' : 'Exam created. Next step: add your questions now.',
      addQuestionsNow: isAr ? '\u0623\u0636\u0641 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0622\u0646' : 'Add Questions Now',
      examNeedsQuestions: isAr ? '\u0647\u0630\u0627 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0644\u0645 \u064a\u0643\u062a\u0645\u0644 \u0628\u0639\u062f' : 'This exam is not complete yet',
      examNeedsQuestionsHint: isAr ? '\u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0639\u062a\u0628\u0627\u0631 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u062c\u0627\u0647\u0632\u064b\u0627 \u062d\u062a\u0649 \u062a\u0636\u064a\u0641 \u0627\u0644\u0623\u0633\u0626\u0644\u0629.' : 'The exam should not be considered ready until you add questions.',
      manageQuestions: isAr ? '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0623\u0633\u0626\u0644\u0629' : 'Manage Questions',
      zeroQuestionsStatus: isAr ? '\u0628\u062f\u0648\u0646 \u0623\u0633\u0626\u0644\u0629' : 'No Questions Yet',
      questionBuilderHint: isAr ? '\u0628\u0639\u062f \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646\u060c \u0627\u0636\u063a\u0637 \u0639\u0644\u0649 \u201c\u0625\u0636\u0627\u0641\u0629 \u0633\u0624\u0627\u0644\u201d \u0645\u0646 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0623\u0648 \u0645\u0646 \u0646\u0627\u0641\u0630\u0629 \u0639\u0631\u0636 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646.' : 'After creating the exam, use â€œAdd Questionâ€ from the exam card or the exam preview window.',
      deleteExamForceWarning: isAr ? '\u0647\u0630\u0627 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0644\u062f\u064a\u0647 \u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0637\u0644\u0627\u0628 \u0645\u0631\u062a\u0628\u0637\u0629. \u0639\u0646\u062f \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0633\u064a\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0648\u0623\u0633\u0626\u0644\u062a\u0647 \u0648\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0648\u0627\u0644\u0646\u062a\u0627\u0626\u062c. \u0647\u0644 \u062a\u0631\u064a\u062f \u0627\u0644\u0625\u0643\u0645\u0627\u0644\u061f' : 'This exam already has student attempts. Continuing will delete the exam, its questions, and all related attempts/results. Do you want to continue?',
      questionBuilderTitle: isAr ? '\u0628\u0627\u0646\u064a \u0627\u0644\u0623\u0633\u0626\u0644\u0629' : 'Question Builder',
      currentQuestionNo: isAr ? '\u0631\u0642\u0645 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u062d\u0627\u0644\u064a' : 'Current Question Number',
      questionsAddedThisSession: isAr ? '\u0623\u0636\u064a\u0641\u062a \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u062c\u0644\u0633\u0629' : 'Added This Session',
      saveAndNext: isAr ? '\u062d\u0641\u0638 \u0648\u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0644\u0644\u062a\u0627\u0644\u064a' : 'Save & Next',
      addOption: isAr ? '\u0625\u0636\u0627\u0641\u0629 \u0627\u062e\u062a\u064a\u0627\u0631' : 'Add Option',
      removeOption: isAr ? '\u062d\u0630\u0641 \u0627\u0644\u0627\u062e\u062a\u064a\u0627\u0631' : 'Remove Option',
      bulkImport: isAr ? '\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u062f\u0641\u0639\u0629 \u0623\u0633\u0626\u0644\u0629' : 'Bulk Import Questions',
      bulkImportHint: isAr ? '\u0627\u0641\u0635\u0644 \u0628\u064a\u0646 \u0643\u0644 \u0633\u0624\u0627\u0644 \u0648\u0627\u0644\u062b\u0627\u0646\u064a \u0628\u0633\u0637\u0631 --- \u0648\u0627\u0633\u062a\u062e\u062f\u0645 question:, type:, marks:, answer:, option1: \u0625\u0644\u062e.' : 'Separate each question with --- and use question:, type:, marks:, answer:, option1: ...',
      importQuestions: isAr ? '\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0627\u0644\u0623\u0633\u0626\u0644\u0629' : 'Import Questions',
      importedQuestions: isAr ? '\u062a\u0645 \u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0628\u0646\u062c\u0627\u062d' : 'Questions imported successfully',
      importFormatError: isAr ? '\u062a\u0639\u0630\u0631 \u0641\u0647\u0645 \u0635\u064a\u063a\u0629 \u0627\u0644\u0627\u0633\u062a\u064a\u0631\u0627\u062f. \u0627\u0633\u062a\u062e\u062f\u0645 question:, type:, marks:, answer:, option1: ...' : 'Unable to parse the import format. Use question:, type:, marks:, answer:, option1: ...',
      previewImport: isAr ? '\u0645\u0639\u0627\u064a\u0646\u0629 \u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062a\u064a\u0631\u0627\u062f' : 'Preview Before Import',
      previewImportHint: isAr ? '\u0631\u0627\u062c\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u0631\u062c\u0629 \u0642\u0628\u0644 \u062d\u0641\u0638\u0647\u0627 \u0641\u064a \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646.' : 'Review the extracted questions before saving them into the exam.',
      parsedQuestionsCount: isAr ? '\u0639\u062f\u062f \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u0631\u062c\u0629' : 'Parsed Questions',
      confirmImportQuestions: isAr ? '\u062a\u0623\u0643\u064a\u062f \u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0627\u0644\u0623\u0633\u0626\u0644\u0629' : 'Confirm Question Import',
      backToImportEditor: isAr ? '\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0646\u0635' : 'Back to Import Editor',
      noParsedOptions: isAr ? '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0633\u062a\u062e\u0631\u0627\u062c \u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a \u0644\u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644.' : 'No options were extracted for this question.',
      extractedAnswer: isAr ? '\u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u0631\u062c\u0629' : 'Extracted Answer',
      wordImportNote: isAr ? 'ارفع ملف Word بصيغة .docx لاستخراج الأسئلة ثم راجع المعاينة قبل الاستيراد.' : 'Upload a Word .docx file to extract its questions, then review the preview before importing.',
      duplicateQuestion: isAr ? '\u0646\u0633\u062e \u0627\u0644\u0633\u0624\u0627\u0644' : 'Duplicate Question',
      moveUp: isAr ? '\u062a\u062d\u0631\u064a\u0643 \u0644\u0623\u0639\u0644\u0649' : 'Move Up',
      moveDown: isAr ? '\u062a\u062d\u0631\u064a\u0643 \u0644\u0623\u0633\u0641\u0644' : 'Move Down',
      reorderLockedHint: isAr ? '\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u064a\u062d\u062a\u0627\u062c \u062a\u0634\u063a\u064a\u0644 migration \u0627\u0644\u062a\u0631\u062a\u064a\u0628 \u0623\u0648\u0644\u064b\u0627.' : 'Question reordering needs the ordering migration to be applied first.',
      questionBank: isAr ? '\u0628\u0646\u0643 \u0627\u0644\u0623\u0633\u0626\u0644\u0629' : 'Question Bank',
      saveToBank: isAr ? '\u062d\u0641\u0638 \u0641\u064a \u0627\u0644\u0628\u0646\u0643' : 'Save to Bank',
      addToExam: isAr ? '\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Add to Exam',
      removeFromBank: isAr ? '\u062d\u0630\u0641 \u0645\u0646 \u0627\u0644\u0628\u0646\u0643' : 'Remove from Bank',
      targetExam: isAr ? '\u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0627\u0644\u0645\u0633\u062a\u0647\u062f\u0641' : 'Target Exam',
      noBankQuestions: isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u0633\u0626\u0644\u0629 \u0645\u062d\u0641\u0648\u0638\u0629 \u0641\u064a \u0627\u0644\u0628\u0646\u0643 \u0628\u0639\u062f.' : 'No saved questions in the bank yet.',
      bankSaved: isAr ? '\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0633\u0624\u0627\u0644 \u0641\u064a \u0628\u0646\u0643 \u0627\u0644\u0623\u0633\u0626\u0644\u0629' : 'Question saved to the bank',
      bankInserted: isAr ? '\u062a\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0633\u0624\u0627\u0644 \u0645\u0646 \u0627\u0644\u0628\u0646\u0643 \u0625\u0644\u0649 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Question added from the bank to the exam',
      noEditableExams: isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u064b\u0627 \u0644\u0625\u0636\u0627\u0641\u0629 \u0623\u0633\u0626\u0644\u0629 \u0645\u0646 \u0627\u0644\u0628\u0646\u0643.' : 'No editable exams are currently available for inserting bank questions.',
      uploadWord: isAr ? '\u0631\u0641\u0639 Word' : 'Upload Word',
      wordImported: isAr ? '\u062a\u0645 \u0642\u0631\u0627\u0621\u0629 \u0645\u0644\u0641 Word \u0648\u062a\u062d\u0648\u064a\u0644 \u0646\u0635\u0647 \u0625\u0644\u0649 \u0635\u064a\u063a\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0627\u0633\u062a\u064a\u0631\u0627\u062f. \u0631\u0627\u062c\u0639 \u0627\u0644\u0646\u0635 \u062b\u0645 \u0627\u0633\u062a\u0648\u0631\u062f\u0647.' : 'Word content was extracted into import format. Review it, then import.',
      wordImportFailed: isAr ? '\u062a\u0639\u0630\u0631 \u0642\u0631\u0627\u0621\u0629 \u0647\u0630\u0627 \u0627\u0644\u0645\u0644\u0641 \u0643Word .docx \u0642\u0627\u0628\u0644 \u0644\u0644\u0646\u0635. \u0627\u062e\u062a\u0631 \u0645\u0644\u0641 .docx \u0635\u062d\u064a\u062d \u0623\u0648 \u0627\u0646\u0633\u062e \u0645\u062d\u062a\u0648\u0627\u0647 \u064a\u062f\u0648\u064a\u064b\u0627.' : 'Unable to read this file as a valid .docx Word document. Choose a proper .docx file or paste its content manually.',
    }),
    [isAr]
  );

  const [activeTab, setActiveTab] = useState('exams');
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [liveAttempts, setLiveAttempts] = useState([]);
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [showExamPreview, setShowExamPreview] = useState(false);
  const [showEditExam, setShowEditExam] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const [createExamMessage, setCreateExamMessage] = useState('');
  const [bulkQuestionText, setBulkQuestionText] = useState('');
  const [bulkImportPreview, setBulkImportPreview] = useState([]);
  const [questionBuilderMeta, setQuestionBuilderMeta] = useState({ baseCount: 0, addedCount: 0 });
  const [questionOrderReady, setQuestionOrderReady] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');
  const [previewExam, setPreviewExam] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [examSearch, setExamSearch] = useState('');
  const [resultsSearch, setResultsSearch] = useState('');
  const [coursesSearch, setCoursesSearch] = useState('');
  const [examSortBy, setExamSortBy] = useState('newest');
  const [resultsSortBy, setResultsSortBy] = useState('newest');
  const [coursesSortBy, setCoursesSortBy] = useState('name');
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [pages, setPages] = useState({ exams: 1, results: 1, courses: 1 });
  const [selectedExamIds, setSelectedExamIds] = useState([]);
  const [selectedResultIds, setSelectedResultIds] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [bankTargetExamId, setBankTargetExamId] = useState('');
  const [loadedTabs, setLoadedTabs] = useState({ exams: false, results: false, monitor: false, bank: false, courses: false });
  const [tabLoading, setTabLoading] = useState({ exams: false, results: false, monitor: false, bank: false, courses: false });
  const [lastResultsExamId, setLastResultsExamId] = useState(null);

  useEffect(() => {
    if (location.pathname !== '/doctor') return;
    const tabFromUrl = new URLSearchParams(location.search).get('tab');
    const allowedTabs = new Set(['results', 'monitor', 'bank', 'courses']);
    setActiveTab(allowedTabs.has(tabFromUrl) ? tabFromUrl : 'exams');
  }, [location.pathname, location.search]);

  const isIndependent = user?.profile_mode === 'independent';
  const twoColumnGrid = isTablet ? '1fr' : '1fr 1fr';
  const previewOptionsGrid = isMobile ? '1fr' : '1fr 1fr';
  const isExamLocked = useCallback(
    (exam) => Boolean((exam?.has_started || Number(exam?.total_attempts || 0) > 0) && Number(exam?.questions_count || 0) > 0),
    []
  );

  const [examForm, setExamForm] = useState({
    title: '',
    access_mode: isIndependent ? 'link' : 'department',
    course_id: '',
    duration: '',
    total_marks: '',
    exam_code_mode: 'manual',
    exam_code: '',
    start_date: '',
    end_date: '',
    randomize_questions: false,
    randomize_options: false,
    proctoring_enabled: true,
    screen_capture_protection: false,
    max_attempts_per_student: 1,
    post_end_visibility_mode: 'hide',
    post_end_grace_minutes: 0,
    is_demo_exam: false,
  });
  const [editExamForm, setEditExamForm] = useState({
    title: '',
    access_mode: isIndependent ? 'link' : 'department',
    course_id: '',
    duration: '',
    total_marks: '',
    exam_code_mode: 'manual',
    exam_code: '',
    start_date: '',
    end_date: '',
    randomize_questions: false,
    randomize_options: false,
    proctoring_enabled: true,
    screen_capture_protection: false,
    max_attempts_per_student: 1,
    post_end_visibility_mode: 'hide',
    post_end_grace_minutes: 0,
    is_demo_exam: false,
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'MCQ',
    marks: '',
    correct_answer: '',
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ],
  });

  const createDefaultQuestionForm = useCallback(() => ({
    question_text: '',
    question_type: 'MCQ',
    marks: '',
    correct_answer: '',
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ],
  }), []);

  const resetQuestionForm = useCallback(() => {
    setQuestionForm(createDefaultQuestionForm());
  }, [createDefaultQuestionForm]);

  const resetQuestionBuilder = useCallback((exam = null) => {
    resetQuestionForm();
    setBulkQuestionText('');
    setBulkImportPreview([]);
    setShowImportPreview(false);
    setQuestionBuilderMeta({
      baseCount: Number(exam?.questions_count || exam?.questions?.length || 0),
      addedCount: 0,
    });
  }, [resetQuestionForm]);

  const openQuestionBuilder = useCallback((exam) => {
    const sourceExam = exam || selectedExam;
    if (!sourceExam) return;
    setSelectedExam(sourceExam);
    setShowAddQuestion(true);
    setCreateExamMessage('');
    resetQuestionBuilder(sourceExam);
  }, [resetQuestionBuilder, selectedExam]);

  const parseQuestionOptions = useCallback((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string' || !value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const fetchExams = useCallback(async () => {
    try {
      const res = await API.get('/doctor/exams');
      setExams(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await API.get('/doctor/courses');
      const nextCourses = res.data.data || [];
      setCourses(nextCourses);
      setExamForm((prev) => {
        if (prev.course_id || nextCourses.length === 0) return prev;
        return { ...prev, course_id: String(nextCourses[0].id) };
      });
    } catch (err) {
      console.error(err);
      setCourses([]);
    }
  }, []);

  const fetchQuestionBank = useCallback(async () => {
    try {
      const res = await API.get('/doctor/question-bank');
      setQuestionBank(res.data.data || []);
    } catch (err) {
      console.error(err);
      setQuestionBank([]);
    }
  }, []);

  const fetchResults = useCallback(async (examId) => {
    try {
      const res = await API.get(`/doctor/exams/${examId}/results`);
      setResults(res.data.data || []);
      setLastResultsExamId(examId);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchLiveMonitor = useCallback(async () => {
    try {
      const res = await API.get('/doctor/monitor/open-attempts');
      setLiveAttempts(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const openAttemptReview = useCallback(async (attempt) => {
    try {
      const res = await API.get(`/doctor/attempts/${attempt.id || attempt.attempt_id}/review`);
      setReviewAttempt(res.data?.data || null);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to load attempt review.');
    }
  }, []);

  const updateReviewAnswer = useCallback((answerId, nextValues) => {
    setReviewAttempt((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: Array.isArray(prev.answers)
          ? prev.answers.map((answer) => (answer.answer_id === answerId ? { ...answer, ...nextValues } : answer))
          : [],
      };
    });
  }, []);

  const saveAttemptReview = useCallback(async () => {
    if (!reviewAttempt) return;
    setReviewSaving(true);
    try {
      const reviews = (reviewAttempt.answers || [])
        .filter((answer) => ['ESSAY', 'SHORTANSWER', 'WRITTEN'].includes(String(answer.question_type || '').toUpperCase()))
        .map((answer) => ({
          answer_id: answer.answer_id,
          awarded_marks: Number(answer.awarded_marks || 0),
          review_feedback: answer.review_feedback || '',
        }));

      await API.patch(`/doctor/attempts/${reviewAttempt.id}/review`, { reviews });
      await fetchResults(reviewAttempt.exam_id);
      setReviewAttempt(null);
      alert(text.reviewSaved);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save review.');
    } finally {
      setReviewSaving(false);
    }
  }, [fetchResults, reviewAttempt, text.reviewSaved]);

  const loadExamDetails = useCallback(async (examId) => {
    setPreviewLoading(true);
    try {
      const res = await API.get(`/doctor/exams/${examId}`);
      const payload = res.data?.data || null;
      setPreviewExam(payload);
      return payload;
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Unable to load exam details.');
      return null;
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const setTabBusy = useCallback((tab, value) => {
    setTabLoading((prev) => ({ ...prev, [tab]: value }));
  }, []);

  const markTabLoaded = useCallback((tab) => {
    setLoadedTabs((prev) => ({ ...prev, [tab]: true }));
  }, []);

  const loadTabData = useCallback(async (tab) => {
    if (tab === 'exams') {
      if (loadedTabs.exams && loadedTabs.courses) return;
      setTabBusy('exams', true);
      try {
        await Promise.all([fetchExams(), fetchCourses()]);
        markTabLoaded('exams');
        markTabLoaded('courses');
      } finally {
        setTabBusy('exams', false);
      }
      return;
    }

    if (tab === 'results') {
      setTabBusy('results', true);
      try {
        if (selectedExam?.id && String(lastResultsExamId) !== String(selectedExam.id)) {
          await fetchResults(selectedExam.id);
          markTabLoaded('results');
        }
        if (!loadedTabs.exams) {
          await fetchExams();
          markTabLoaded('exams');
        }
      } finally {
        setTabBusy('results', false);
      }
      return;
    }

    if (tab === 'monitor') {
      if (loadedTabs.monitor) return;
      setTabBusy('monitor', true);
      try {
        await fetchLiveMonitor();
        markTabLoaded('monitor');
      } finally {
        setTabBusy('monitor', false);
      }
      return;
    }

    if (tab === 'bank') {
      if (loadedTabs.bank) return;
      setTabBusy('bank', true);
      try {
        if (!loadedTabs.exams) {
          await fetchExams();
          markTabLoaded('exams');
        }
        await fetchQuestionBank();
        markTabLoaded('bank');
      } finally {
        setTabBusy('bank', false);
      }
      return;
    }

    if (tab === 'courses') {
      if (loadedTabs.courses) return;
      setTabBusy('courses', true);
      try {
        await fetchCourses();
        markTabLoaded('courses');
      } finally {
        setTabBusy('courses', false);
      }
    }
  }, [fetchCourses, fetchExams, fetchLiveMonitor, fetchQuestionBank, fetchResults, lastResultsExamId, loadedTabs, markTabLoaded, selectedExam?.id, setTabBusy]);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  useEffect(() => {
    if (activeTab !== 'monitor') return undefined;
    const intervalId = window.setInterval(fetchLiveMonitor, 10000);
    return () => window.clearInterval(intervalId);
  }, [activeTab, fetchLiveMonitor]);

  const resetExamForm = useCallback(() => {
    setExamForm({
      title: '',
      access_mode: isIndependent ? 'link' : 'department',
      course_id: courses[0] ? String(courses[0].id) : '',
      duration: '',
      total_marks: '',
      exam_code_mode: 'manual',
      exam_code: '',
      start_date: '',
      end_date: '',
      randomize_questions: false,
      randomize_options: false,
      proctoring_enabled: true,
      screen_capture_protection: false,
      max_attempts_per_student: 1,
      post_end_visibility_mode: 'hide',
      post_end_grace_minutes: 0,
      is_demo_exam: false,
    });
  }, [courses, isIndependent]);

  const toDateTimeLocalValue = useCallback((value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }, []);

  const toApiDateTime = useCallback((value) => {
    if (!value) return null;
    const normalized = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
      return `${normalized}:00`;
    }

    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:00`;
    }

    const localeMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (localeMatch) {
      const [, month, day, year, rawHours, minutes, meridiem] = localeMatch;
      let hours = Number(rawHours);
      if (meridiem.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
      const pad = (num) => String(num).padStart(2, '0');
      return `${year}-${pad(Number(month))}-${pad(Number(day))}T${pad(hours)}:${minutes}:00`;
    }

    return normalized;
  }, []);

  const buildEditExamForm = useCallback((exam) => ({
    title: exam?.title || '',
    access_mode: exam?.access_mode || (isIndependent ? 'link' : 'department'),
    course_id: exam?.course_id ? String(exam.course_id) : '',
    duration: exam?.duration != null ? String(exam.duration) : '',
    total_marks: exam?.total_marks != null ? String(exam.total_marks) : '',
    exam_code_mode: exam?.allow_custom_exam_code ? 'manual' : 'auto',
    exam_code: exam?.exam_code || '',
    start_date: toDateTimeLocalValue(exam?.start_date),
    end_date: toDateTimeLocalValue(exam?.end_date),
    randomize_questions: Boolean(exam?.randomize_questions),
    randomize_options: Boolean(exam?.randomize_options),
    proctoring_enabled: Boolean(exam?.proctoring_enabled ?? true),
    screen_capture_protection: Boolean(exam?.screen_capture_protection),
    max_attempts_per_student: String(Number(exam?.max_attempts_per_student || 1)),
    post_end_visibility_mode: String(exam?.post_end_visibility_mode || 'hide').toLowerCase() === 'archive' ? 'archive' : 'hide',
    post_end_grace_minutes: String(Number(exam?.post_end_grace_minutes || 0)),
    is_demo_exam: Boolean(exam?.is_demo_exam),
  }), [isIndependent, toDateTimeLocalValue]);

  const handleCreateExam = useCallback(async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: examForm.title,
        access_mode: examForm.access_mode,
        duration: Number(examForm.duration),
        total_marks: Number(examForm.total_marks),
        exam_code_mode: examForm.exam_code_mode,
        exam_code: examForm.exam_code_mode === 'manual' ? examForm.exam_code : '',
        start_date: toApiDateTime(examForm.start_date),
        end_date: toApiDateTime(examForm.end_date),
        randomize_questions: Boolean(examForm.randomize_questions),
        randomize_options: Boolean(examForm.randomize_options),
        proctoring_enabled: Boolean(examForm.proctoring_enabled),
        screen_capture_protection: Boolean(examForm.screen_capture_protection),
        max_attempts_per_student: Math.max(1, Number(examForm.max_attempts_per_student) || 1),
        post_end_visibility_mode: examForm.post_end_visibility_mode,
        post_end_grace_minutes: Math.max(0, Number(examForm.post_end_grace_minutes) || 0),
        is_demo_exam: Boolean(examForm.is_demo_exam),
        ...(examForm.access_mode === 'department' ? { course_id: Number(examForm.course_id) } : {}),
      };
      const response = await API.post('/doctor/exams', payload);
      const createdExamId = Number(response.data?.data?.id);
      setShowCreateForm(false);
      resetExamForm();
      await fetchExams();
      if (createdExamId) {
        const createdExam = await loadExamDetails(createdExamId);
        if (createdExam) {
          setSelectedExam(createdExam);
          setPreviewExam(createdExam);
          setCreateExamMessage(text.createdOpenQuestions);
          openQuestionBuilder(createdExam);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || text.createError);
    } finally {
      setLoading(false);
    }
  }, [examForm, fetchExams, loadExamDetails, openQuestionBuilder, resetExamForm, text.createError, text.createdOpenQuestions, toApiDateTime]);

  const handleDeleteExam = useCallback(async (exam) => {
    if (!window.confirm(text.deleteExamConfirm)) return;
    setLoading(true);
    try {
      await API.delete(`/doctor/exams/${exam.id}`);
      if (selectedExam?.id === exam.id) {
        setSelectedExam(null);
        setPreviewExam(null);
      }
      await fetchExams();
    } catch (err) {
      if (err.response?.status === 409) {
        const forceConfirmed = window.confirm(text.deleteExamForceWarning);
        if (!forceConfirmed) {
          setLoading(false);
          return;
        }

        await API.delete(`/doctor/exams/${exam.id}?force=true`);
        if (selectedExam?.id === exam.id) {
          setSelectedExam(null);
          setPreviewExam(null);
        }
        await fetchExams();
        return;
      }

      alert(err.response?.data?.message || text.deleteExamError);
    } finally {
      setLoading(false);
    }
  }, [fetchExams, selectedExam?.id, text.deleteExamConfirm, text.deleteExamError, text.deleteExamForceWarning]);

  const handleAddQuestion = useCallback(async (event, keepAdding = false) => {
    event.preventDefault();
    if (!selectedExam) return;
    setLoading(true);
    try {
      await API.post(`/doctor/exams/${selectedExam.id}/questions`, {
        ...questionForm,
        marks: Number(questionForm.marks),
      });
      await fetchExams();
      if (showExamPreview) {
        await loadExamDetails(selectedExam.id);
      }
      if (keepAdding) {
        setQuestionBuilderMeta((prev) => ({ ...prev, addedCount: prev.addedCount + 1 }));
        resetQuestionForm();
      } else {
        setShowAddQuestion(false);
        resetQuestionBuilder(selectedExam);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding question');
    } finally {
      setLoading(false);
    }
  }, [fetchExams, loadExamDetails, questionForm, resetQuestionBuilder, resetQuestionForm, selectedExam, showExamPreview]);

  const handleOptionChange = (index, field, value) => {
    const nextOptions = [...questionForm.options];
    if (field === 'is_correct') {
      nextOptions.forEach((option, optionIndex) => {
        option.is_correct = optionIndex === index;
      });
    } else {
      nextOptions[index][field] = value;
    }
    const selectedOption = nextOptions.find((option) => option.is_correct);
    setQuestionForm({
      ...questionForm,
      options: nextOptions,
      correct_answer: selectedOption?.option_text || questionForm.correct_answer,
    });
  };

  const addOptionField = useCallback(() => {
    setQuestionForm((prev) => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false }],
    }));
  }, []);

  const removeOptionField = useCallback((index) => {
    setQuestionForm((prev) => {
      if (prev.options.length <= 2) return prev;
      const nextOptions = prev.options.filter((_, optionIndex) => optionIndex !== index);
      const hasCorrect = nextOptions.some((option) => option.is_correct);
      if (!hasCorrect && nextOptions[0]) {
        nextOptions[0].is_correct = true;
      }
      return {
        ...prev,
        options: nextOptions,
      };
    });
  }, []);

  const parseBulkQuestions = useCallback((rawText) => {
    const sections = String(rawText || '')
      .split(/\n\s*---+\s*\n/g)
      .map((part) => part.trim())
      .filter(Boolean);

    if (sections.length === 0) {
      return [];
    }

    return sections.map((section) => {
      const lines = section.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const payload = {
        question_text: '',
        question_type: 'MCQ',
        marks: 1,
        correct_answer: '',
        options: [],
      };

      lines.forEach((line) => {
        const match = line.match(/^([a-zA-Z0-9_]+)\s*:\s*(.+)$/);
        if (!match) return;
        const key = match[1].toLowerCase();
        const value = match[2].trim();

        if (key === 'question') payload.question_text = value;
        if (key === 'type') {
          const normalized = value.toLowerCase();
          if (normalized === 'mcq') payload.question_type = 'MCQ';
          if (normalized === 'truefalse' || normalized === 'true_false' || normalized === 'tf') payload.question_type = 'TrueFalse';
          if (normalized === 'shortanswer' || normalized === 'short_answer' || normalized === 'essay') payload.question_type = 'ShortAnswer';
        }
        if (key === 'marks') payload.marks = Number(value || 1);
        if (key === 'answer') payload.correct_answer = value;
        if (/^option\d+$/.test(key)) {
          payload.options.push({
            option_text: value,
            is_correct: String(payload.correct_answer).trim() === value.trim(),
          });
        }
      });

      if (payload.question_type === 'MCQ') {
        payload.options = payload.options.filter((option) => String(option.option_text || '').trim() !== '');
        if (payload.correct_answer) {
          payload.options = payload.options.map((option) => ({
            ...option,
            is_correct: option.option_text.trim() === String(payload.correct_answer).trim(),
          }));
        }
      }

      return payload;
    }).filter((item) => item.question_text);
  }, []);

  const handleBulkImportQuestions = useCallback(async () => {
    if (!selectedExam) return;
    const parsedQuestions = parseBulkQuestions(bulkQuestionText);
    if (parsedQuestions.length === 0) {
      alert(text.importFormatError);
      return;
    }

    setBulkImportPreview(parsedQuestions);
    setShowImportPreview(true);
  }, [bulkQuestionText, parseBulkQuestions, selectedExam, text.importFormatError]);

  const handleConfirmBulkImportQuestions = useCallback(async () => {
    if (!selectedExam || bulkImportPreview.length === 0) return;

    setLoading(true);
    try {
      for (const question of bulkImportPreview) {
        await API.post(`/doctor/exams/${selectedExam.id}/questions`, question);
      }
      await fetchExams();
      if (showExamPreview) {
        await loadExamDetails(selectedExam.id);
      }
      setQuestionBuilderMeta((prev) => ({ ...prev, addedCount: prev.addedCount + bulkImportPreview.length }));
      setShowImportPreview(false);
      setBulkImportPreview([]);
      setBulkQuestionText('');
      alert(text.importedQuestions);
    } catch (err) {
      alert(err.response?.data?.message || text.deleteExamError);
    } finally {
      setLoading(false);
    }
  }, [bulkImportPreview, fetchExams, loadExamDetails, selectedExam, showExamPreview, text.deleteExamError, text.importedQuestions]);

  const buildQuestionFormFromQuestion = useCallback((question) => {
    const options = parseQuestionOptions(question.options);
    const normalizedOptions = options.length > 0
      ? options.map((option) => ({
          option_text: option.option_text || option.text || '',
          is_correct: Boolean(option.is_correct),
        }))
      : createDefaultQuestionForm().options;

    while (normalizedOptions.length < 4) {
      normalizedOptions.push({ option_text: '', is_correct: false });
    }

    return {
      question_text: question.question_text || '',
      question_type: question.question_type || 'MCQ',
      marks: String(question.marks ?? ''),
      correct_answer: question.correct_answer || '',
      options: normalizedOptions.slice(0, 4),
    };
  }, [createDefaultQuestionForm, parseQuestionOptions]);

  const openEditQuestion = useCallback((question) => {
    setEditingQuestion(question);
    setQuestionForm(buildQuestionFormFromQuestion(question));
    setShowEditQuestion(true);
  }, [buildQuestionFormFromQuestion]);

  const handleUpdateQuestion = useCallback(async (event) => {
    event.preventDefault();
    if (!selectedExam || !editingQuestion) return;

    setLoading(true);
    try {
      await API.patch(`/doctor/exams/${selectedExam.id}/questions/${editingQuestion.id}`, {
        ...questionForm,
        marks: Number(questionForm.marks),
      });
      const refreshedExam = await loadExamDetails(selectedExam.id);
      if (refreshedExam) {
        setPreviewExam(refreshedExam);
      }
      await fetchExams();
      setShowEditQuestion(false);
      setEditingQuestion(null);
      resetQuestionForm();
    } catch (err) {
      alert(err.response?.data?.message || text.updateQuestionError);
    } finally {
      setLoading(false);
    }
  }, [editingQuestion, fetchExams, loadExamDetails, questionForm, resetQuestionForm, selectedExam, text.updateQuestionError]);

  const handleDeleteQuestion = useCallback(async (question) => {
    if (!selectedExam) return;
    if (!window.confirm(text.deleteConfirm)) return;

    setLoading(true);
    try {
      await API.delete(`/doctor/exams/${selectedExam.id}/questions/${question.id}`);
      const refreshedExam = await loadExamDetails(selectedExam.id);
      if (refreshedExam) {
        setPreviewExam(refreshedExam);
      }
      await fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || text.deleteQuestionError);
    } finally {
      setLoading(false);
    }
  }, [fetchExams, loadExamDetails, selectedExam, text.deleteConfirm, text.deleteQuestionError]);

  const handleDuplicateQuestion = useCallback(async (question) => {
    if (!selectedExam) return;

    setLoading(true);
    try {
      await API.post(`/doctor/exams/${selectedExam.id}/questions/${question.id}/duplicate`);
      const refreshedExam = await loadExamDetails(selectedExam.id);
      if (refreshedExam) {
        setPreviewExam(refreshedExam);
        setSelectedExam(refreshedExam);
      }
      await fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to duplicate the question.');
    } finally {
      setLoading(false);
    }
  }, [fetchExams, loadExamDetails, selectedExam]);

  const handleReorderQuestion = useCallback(async (question, direction) => {
    if (!selectedExam) return;

    setLoading(true);
    try {
      await API.patch(`/doctor/exams/${selectedExam.id}/questions/${question.id}/reorder`, { direction });
      setQuestionOrderReady(true);
      const refreshedExam = await loadExamDetails(selectedExam.id);
      if (refreshedExam) {
        setPreviewExam(refreshedExam);
        setSelectedExam(refreshedExam);
      }
      await fetchExams();
    } catch (err) {
      if (err.response?.status === 409) {
        setQuestionOrderReady(false);
      }
      alert(err.response?.data?.message || 'Unable to reorder the question.');
    } finally {
      setLoading(false);
    }
  }, [fetchExams, loadExamDetails, selectedExam]);

  const handleSaveQuestionToBank = useCallback(async (question) => {
    if (!selectedExam) return;
    setLoading(true);
    try {
      await API.post(`/doctor/exams/${selectedExam.id}/questions/${question.id}/save-to-bank`);
      await fetchQuestionBank();
      alert(text.bankSaved);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save question to bank.');
    } finally {
      setLoading(false);
    }
  }, [fetchQuestionBank, selectedExam, text.bankSaved]);

  const handleInsertBankQuestion = useCallback(async (bankQuestion) => {
    if (!bankTargetExamId) {
      alert(text.noEditableExams);
      return;
    }

    setLoading(true);
    try {
      await API.post(`/doctor/exams/${bankTargetExamId}/questions/from-bank/${bankQuestion.id}`);
      await fetchExams();
      if (selectedExam?.id === Number(bankTargetExamId)) {
        const refreshedExam = await loadExamDetails(selectedExam.id);
        if (refreshedExam) {
          setSelectedExam(refreshedExam);
          setPreviewExam(refreshedExam);
        }
      }
      alert(text.bankInserted);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to insert question from bank.');
    } finally {
      setLoading(false);
    }
  }, [bankTargetExamId, fetchExams, loadExamDetails, selectedExam, text.bankInserted, text.noEditableExams]);

  const handleDeleteBankQuestion = useCallback(async (bankQuestion) => {
    if (!window.confirm(text.deleteConfirm)) return;
    setLoading(true);
    try {
      await API.delete(`/doctor/question-bank/${bankQuestion.id}`);
      await fetchQuestionBank();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to delete bank question.');
    } finally {
      setLoading(false);
    }
  }, [fetchQuestionBank, text.deleteConfirm]);

  const normalizeImportedText = useCallback((value) => String(value || '')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/الإجابة|الاجابة/g, 'الإجابة')
    .replace(/：/g, ':')
    .replace(/[•●▪■]/g, '-')
    .split('\u0000').join('')
    .trim(), []);

  const normalizeAnswerToken = useCallback((value) => {
    const raw = normalizeImportedText(value).toLowerCase();
    if (['a', 'b', 'c', 'd', 'e', 'f'].includes(raw)) return raw;
    if (['1', '2', '3', '4', '5', '6'].includes(raw)) return raw;
    if (['true', 't', 'صح', 'صحيح'].includes(raw)) return 'true';
  }, [normalizeImportedText]);

  const applyAnswerKeyToBlock = useCallback((block, token) => {
    const normalized = normalizeAnswerToken(token);
    if (block.type === 'TrueFalse') {
      block.answer = normalized === 'false' ? 'false' : 'true';
      return;
    }

    if (block.type === 'MCQ') {
      const optionIndexFromLetter = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5 }[normalized];
      const optionIndexFromNumber = ['1', '2', '3', '4', '5', '6'].includes(normalized) ? Number(normalized) - 1 : -1;
      const resolvedIndex = Number.isInteger(optionIndexFromLetter) ? optionIndexFromLetter : optionIndexFromNumber;
      if (resolvedIndex >= 0 && block.options[resolvedIndex]) {
        block.answer = block.options[resolvedIndex];
        return;
      }

      const matchedOption = block.options.find((option) => normalizeImportedText(option).toLowerCase() === normalized);
      block.answer = matchedOption || block.answer || block.options[0] || '';
      return;
    }

    block.answer = token;
  }, [normalizeAnswerToken, normalizeImportedText]);

  const convertRawTextToBulkFormat = useCallback((rawText) => {
    const cleanedLines = String(rawText || '')
      .replace(/\r/g, '\n')
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    const blocks = [];
    let current = null;

    const pushCurrent = () => {
      if (current?.question) blocks.push(current);
      current = null;
    };

    cleanedLines.forEach((line) => {
      const questionMatch = line.match(/^(\d+)[.)-]\s+(.+)$/);
      const optionMatch = line.match(/^([A-Da-d]|[1-6])[.)-]\s+(.+)$/);

      if (questionMatch) {
        pushCurrent();
        current = { question: questionMatch[2], options: [], type: 'ShortAnswer', answer: '' };
        return;
      }

      if (!current) {
        return;
      }

      if (optionMatch) {
        current.type = 'MCQ';
        current.options.push(optionMatch[2]);
        return;
      }

      if (/^(answer|model answer|الإجابة|الاجابة)\\s*[:：]/i.test(line)) {
        current.answer = line.replace(/^(answer|model answer|الإجابة|الاجابة)\\s*[:：]\s*/i, '').trim();
        return;
      }

      current.question = `${current.question} ${line}`.trim();
    });

    pushCurrent();

    return blocks.map((block) => {
      const lines = [
        `question: ${block.question}`,
        `type: ${block.type}`,
        'marks: 1',
      ];

      if (block.type === 'MCQ') {
        const fallbackAnswer = block.answer || block.options[0] || '';
        lines.push(`answer: ${fallbackAnswer}`);
        block.options.forEach((option, index) => {
          lines.push(`option${index + 1}: ${option}`);
        });
      } else {
        lines.push(`answer: ${block.answer}`);
      }

      return lines.join('\n');
    }).join('\n---\n');
  }, []);

  const convertRawTextToBulkFormatSmart = useCallback((rawText) => {
    const cleanedLines = String(rawText || '')
      .replace(/\r/g, '\n')
      .split('\n')
      .map((line) => normalizeImportedText(line).replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    const blocks = [];
    let current = null;
    let answerKeyMode = false;
    const answerKeyMap = {};

    const pushCurrent = () => {
      if (current?.question) blocks.push(current);
      current = null;
    };

    cleanedLines.forEach((line) => {
      if (/^(answer key|answers|الإجابات|نموذج الإجابة)\s*:?\s*$/i.test(line)) {
        answerKeyMode = true;
        return;
      }

      if (answerKeyMode) {
        [...line.matchAll(/(\d+)\s*[-:.)]?\s*([A-Fa-f]|[1-6]|true|false|صح|صحيح|خطأ|خطا|غلط)/g)].forEach((match) => {
          answerKeyMap[Number(match[1])] = match[2];
        });
        return;
      }

      const questionMatch = line.match(/^(?:question\\s*|q\\s*|سؤال\\s*|س\\s*)?(\d+)\s*[.)\-:]\s+(.+)$/i);
      const optionMatch = line.match(/^([A-Da-d]|[1-6]|[أ-د])\s*[.)\-:]\s+(.+)$/);

      if (questionMatch) {
        pushCurrent();
        current = { question: questionMatch[2], options: [], type: 'ShortAnswer', answer: '' };
        return;
      }

      if (!current) return;

      if (optionMatch) {
        current.type = 'MCQ';
        current.options.push(optionMatch[2]);
        return;
      }

      if (/^(answer|model answer|الإجابة|الاجابة)\s*:/i.test(line)) {
        current.answer = line.replace(/^(answer|model answer|الإجابة|الاجابة)\\s*:\\s*/i, '').trim();
        if (['true', 'false', 'صح', 'صحيح', 'خطأ', 'خطا', 'غلط'].includes(current.answer.toLowerCase())) {
          current.type = 'TrueFalse';
        }
        return;
      }

      if (/^(true|false|صح|صحيح|خطأ|خطا|غلط)$/i.test(line)) {
        current.type = 'TrueFalse';
        current.answer = normalizeAnswerToken(line);
        return;
      }

      current.question = `${current.question} ${line}`.trim();
    });

    pushCurrent();

    blocks.forEach((block, index) => {
      const answerToken = answerKeyMap[index + 1];
      if (answerToken) {
        applyAnswerKeyToBlock(block, answerToken);
      }

      if (block.options.length === 2) {
        const normalizedOptions = block.options.map((option) => normalizeImportedText(option).toLowerCase());
        if (normalizedOptions.every((option) => ['true', 'false', 'صح', 'صحيح', 'خطأ', 'خطا', 'غلط'].includes(option))) {
          block.type = 'TrueFalse';
          if (!block.answer) {
            block.answer = normalizedOptions[0].includes('false') || normalizedOptions[0].includes('®·') || normalizedOptions[0].includes('ºÙ„·')
              ? 'false'
              : 'true';
          }
        }
      }
    });

    const formatted = blocks.map((block) => {
      const lines = [
        `question: ${block.question}`,
        `type: ${block.type}`,
        'marks: 1',
      ];

      if (block.type === 'MCQ') {
        const fallbackAnswer = block.answer || block.options[0] || '';
        lines.push(`answer: ${fallbackAnswer}`);
        block.options.forEach((option, index) => {
          lines.push(`option${index + 1}: ${option}`);
        });
      } else if (block.type === 'TrueFalse') {
        lines.push(`answer: ${normalizeAnswerToken(block.answer || 'true')}`);
      } else {
        lines.push(`answer: ${block.answer}`);
      }

      return lines.join('\n');
    }).join('\n---\n');

    return formatted || convertRawTextToBulkFormat(rawText);
  }, [applyAnswerKeyToBlock, convertRawTextToBulkFormat, normalizeAnswerToken, normalizeImportedText]);

  const handleWordUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      const extractedText = normalizeImportedText(result.value)
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!extractedText) {
        throw new Error('empty');
      }

      const converted = convertRawTextToBulkFormatSmart(extractedText);
      let parsedQuestions = parseBulkQuestions(converted);
      let finalImportText = converted;

      if (parsedQuestions.length === 0) {
        const plainQuestionLines = extractedText
          .split(/\r?\n/)
          .map((line) => normalizeImportedText(line).trim())
          .filter(Boolean)
          .filter((line) => /[?؟]\s*$/.test(line) || /^(what|why|when|where|who|which|how|define|explain)\b/i.test(line));

        if (plainQuestionLines.length > 0) {
          finalImportText = plainQuestionLines.map((line) => [
            `question: ${line}`,
            'type: ShortAnswer',
            'marks: 1',
            'answer: ',
          ].join('\n')).join('\n---\n');
          parsedQuestions = parseBulkQuestions(finalImportText);
        }
      }

      if (parsedQuestions.length === 0) {
        throw new Error('unstructured');
      }

      setBulkQuestionText(finalImportText);
      alert(text.wordImported);
    } catch (_) {
      alert(text.wordImportFailed);
    } finally {
      event.target.value = '';
    }
  }, [convertRawTextToBulkFormatSmart, normalizeImportedText, parseBulkQuestions, text]);

  const handleUpdateExam = useCallback(async (event) => {
    event.preventDefault();
    if (!selectedExam) return;

    setLoading(true);
    try {
      const payload = {
        title: editExamForm.title,
        access_mode: editExamForm.access_mode,
        duration: Number(editExamForm.duration),
        total_marks: Number(editExamForm.total_marks),
        exam_code_mode: editExamForm.exam_code_mode,
        exam_code: editExamForm.exam_code_mode === 'manual' ? editExamForm.exam_code : '',
        start_date: toApiDateTime(editExamForm.start_date),
        end_date: toApiDateTime(editExamForm.end_date),
        randomize_questions: Boolean(editExamForm.randomize_questions),
        randomize_options: Boolean(editExamForm.randomize_options),
        proctoring_enabled: Boolean(editExamForm.proctoring_enabled),
        screen_capture_protection: Boolean(editExamForm.screen_capture_protection),
        max_attempts_per_student: Math.max(1, Number(editExamForm.max_attempts_per_student) || 1),
        post_end_visibility_mode: editExamForm.post_end_visibility_mode,
        post_end_grace_minutes: Math.max(0, Number(editExamForm.post_end_grace_minutes) || 0),
        is_demo_exam: Boolean(editExamForm.is_demo_exam),
        ...(editExamForm.access_mode === 'department' ? { course_id: Number(editExamForm.course_id) } : {}),
      };

      await API.patch(`/doctor/exams/${selectedExam.id}`, payload);
      await fetchExams();
      const refreshedExam = await loadExamDetails(selectedExam.id);
      if (refreshedExam) {
        setSelectedExam(refreshedExam);
        setPreviewExam(refreshedExam);
        setEditExamForm(buildEditExamForm(refreshedExam));
      }
      setShowEditExam(false);
    } catch (err) {
      alert(err.response?.data?.message || text.updateExamError);
    } finally {
      setLoading(false);
    }
  }, [buildEditExamForm, editExamForm, fetchExams, loadExamDetails, selectedExam, text.updateExamError, toApiDateTime]);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 1200);
    } catch (_) {}
  };

  const openExamPreview = useCallback(async (exam) => {
    setSelectedExam(exam);
    setShowExamPreview(true);
    setPreviewExam(null);
    await loadExamDetails(exam.id);
  }, [loadExamDetails]);

  const openEditExam = useCallback(async (exam) => {
    const examData = await loadExamDetails(exam.id);
    const source = examData || exam;
    setSelectedExam(source);
    setEditExamForm(buildEditExamForm(source));
    setShowEditExam(true);
  }, [buildEditExamForm, loadExamDetails]);

  const formatDateTime = useCallback((value) => (value ? new Date(value).toLocaleString(isAr ? 'ar-EG' : 'en-US') : '-'), [isAr]);
  const escapeHtml = useCallback((value) => String(value ?? '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), []);

  const printExamPaper = useCallback(async (exam) => {
    const examData = await loadExamDetails(exam.id);
    if (!examData) return;

    const questions = Array.isArray(examData.questions) ? examData.questions : [];
    const questionsHtml = questions.length === 0
      ? `<p>${escapeHtml(text.noQuestionsYet)}</p>`
      : questions.map((question, index) => {
          const options = parseQuestionOptions(question.options);
          const optionsHtml = options.length > 0
            ? `<ol>${options.map((option) => `<li>${escapeHtml(option.option_text || option.text || '')}</li>`).join('')}</ol>`
            : '';
          const answerHtml = question.question_type === 'MCQ'
            ? ''
            : `<p><strong>${escapeHtml(text.modelAnswer)}:</strong> ${escapeHtml(question.correct_answer || '-')}</p>`;
          return `
            <section style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #d1d5db;">
              <div style="display:flex;justify-content:space-between;gap:12px;font-weight:700;">
                <span>${escapeHtml(text.questionNumber)} ${index + 1}</span>
                <span>${escapeHtml(text.marks)}: ${escapeHtml(question.marks)}</span>
              </div>
              <p style="font-size:16px;line-height:1.8;">${escapeHtml(question.question_text)}</p>
              ${optionsHtml}
              ${answerHtml}
            </section>
          `;
        }).join('');

    const printMarkup = `
      <!DOCTYPE html>
      <html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="UTF-8" />
          <title>${escapeHtml(examData.title)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
            .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 18px; margin: 18px 0 28px; font-size: 14px; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; border: 1px solid #cbd5e1; margin-bottom: 16px; font-size: 12px; }
            @media print { body { margin: 18px; } }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(examData.title)}</h1>
          <div class="badge">${escapeHtml(examData.access_mode === 'link' ? text.linkExam : text.departmentExam)}</div>
          <div class="meta">
            <div><strong>${escapeHtml(text.code)}:</strong> ${escapeHtml(examData.exam_code || '-')}</div>
            <div><strong>${escapeHtml(text.course)}:</strong> ${escapeHtml(examData.course_name || '-')}</div>
            <div><strong>${escapeHtml(text.duration)}:</strong> ${escapeHtml(examData.duration)}</div>
            <div><strong>${escapeHtml(text.totalMarks)}:</strong> ${escapeHtml(examData.total_marks)}</div>
            <div><strong>${escapeHtml(text.start)}:</strong> ${escapeHtml(formatDateTime(examData.start_date))}</div>
            <div><strong>${escapeHtml(text.end)}:</strong> ${escapeHtml(formatDateTime(examData.end_date))}</div>
          </div>
          ${questionsHtml}
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (!frameDoc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      return;
    }

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    };

    frameDoc.open();
    frameDoc.write(printMarkup);
    frameDoc.close();
  }, [escapeHtml, formatDateTime, isAr, loadExamDetails, parseQuestionOptions, text]);

  const navItems = useMemo(
    () => [
      { key: 'exams', label: text.myExams, active: location.pathname === '/doctor' && activeTab === 'exams', onClick: () => navigate('/doctor') },
      { key: 'results', label: text.results, active: location.pathname === '/doctor' && activeTab === 'results', onClick: () => navigate('/doctor?tab=results') },
      { key: 'monitor', label: text.liveMonitor, active: location.pathname === '/doctor' && activeTab === 'monitor', onClick: () => navigate('/doctor?tab=monitor') },
      { key: 'bank', label: text.questionBank, active: location.pathname === '/doctor' && activeTab === 'bank', onClick: () => navigate('/doctor?tab=bank') },
      { key: 'courses', label: text.courses, active: location.pathname === '/doctor' && activeTab === 'courses', onClick: () => navigate('/doctor?tab=courses') },
      { key: 'profile', label: text.profile, active: location.pathname === '/doctor/profile', onClick: () => navigate('/doctor/profile') },
    ],
    [activeTab, location.pathname, navigate, text.courses, text.liveMonitor, text.myExams, text.profile, text.questionBank, text.results]
  );

  const cardBase = {
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    boxShadow: colors.shadow,
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 12px',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 10,
    fontSize: 13,
    color: colors.inputText,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnPrimary = {
    padding: '10px 14px',
    backgroundColor: colors.btnPrimary,
    color: colors.btnPrimaryTxt,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 'bold',
  };

  const btnSecondary = {
    padding: '10px 14px',
    backgroundColor: colors.btnSecondary,
    color: colors.btnSecTxt,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 'bold',
  };

  const compactActionButton = {
    padding: isMobile ? '10px 10px' : '8px 10px',
    fontSize: isNarrowMobile ? 11.5 : 12,
    width: isMobile ? '100%' : 'auto',
    minHeight: isMobile ? 42 : 'auto',
    justifyContent: 'center',
    textAlign: 'center',
  };

  const actionGroupStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 8,
    marginTop: 'auto',
  };

  const modalCardStyle = {
    ...cardBase,
    width: isNarrowMobile ? '100%' : 'min(920px, 96vw)',
    maxWidth: '100%',
    maxHeight: isNarrowMobile ? '92vh' : '88vh',
    overflow: 'auto',
    padding: isNarrowMobile ? 14 : 18,
    borderRadius: isNarrowMobile ? 18 : 14,
  };

  const modalActionRowStyle = {
    display: 'flex',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  };

  const escapeCell = (value) => String(value ?? '-').replace(/"/g, '""');
  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  const exportCsv = (filename, columns, rows) => {
    const csv = [columns.map((col) => `"${escapeCell(col)}"`).join(','), ...rows.map((row) => row.map((cell) => `"${escapeCell(cell)}"`).join(','))].join('\n');
    downloadBlob(`\uFEFF${csv}`, `${filename}.csv`, 'text/csv;charset=utf-8;');
  };
  const exportExcel = (filename, columns, rows) => {
    const header = `<tr>${columns.map((col) => `<th>${escapeHtml(col)}</th>`).join('')}</tr>`;
    const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table>${header}${body}</table></body></html>`;
    downloadBlob(`\uFEFF${html}`, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
  };

  const sortItems = useCallback((items, mode, getName, getNewest) => {
    const next = [...items];
    if (mode === 'id') return next.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
    if (mode === 'name') return next.sort((a, b) => String(getName(a) || '').localeCompare(String(getName(b) || '')));
    return next.sort((a, b) => getNewest(b) - getNewest(a));
  }, []);

  const formatCourseLabel = useCallback((course) => {
    if (!course) return '-';
    const parts = [
      course.name,
      course.level ? `${text.academicYear}: ${course.level}` : null,
      course.faculty_name ? `${text.faculty}: ${course.faculty_name}` : null,
      course.department_name ? `${text.department}: ${course.department_name}` : null,
      course.branch_name ? `${text.branch}: ${course.branch_name}` : null,
      course.university_name ? `${text.university}: ${course.university_name}` : null,
    ].filter(Boolean);
    return parts.join(' â€¢ ');
  }, [text.academicYear, text.branch, text.department, text.faculty, text.university]);

  const visibleExams = useMemo(() => {
    const q = examSearch.trim().toLowerCase();
    const filtered = exams.filter((exam) => {
      const matchesQuery = !q || `${exam.title || ''} ${exam.exam_code || ''} ${exam.course_name || ''} ${exam.level || ''} ${exam.department_name || ''} ${exam.faculty_name || ''} ${exam.branch_name || ''} ${exam.university_name || ''}`.toLowerCase().includes(q);
      const matchesType = examTypeFilter === 'all' || exam.access_mode === examTypeFilter;
      return matchesQuery && matchesType;
    });
    return sortItems(filtered, examSortBy, (exam) => exam.title, (exam) => new Date(exam.start_date || 0).getTime() || Number(exam.id || 0));
  }, [examSearch, examSortBy, examTypeFilter, exams, sortItems]);

  const visibleResults = useMemo(() => {
    const q = resultsSearch.trim().toLowerCase();
    const filtered = results.filter((result) => !q || `${result.student_name || ''} ${result.student_email || ''} ${result.course_name || ''} ${result.level || ''} ${result.department_name || ''} ${result.faculty_name || ''} ${result.branch_name || ''} ${result.university_name || ''}`.toLowerCase().includes(q));
    return sortItems(filtered, resultsSortBy, (result) => result.student_name, (result) => new Date(result.submit_time || 0).getTime() || 0);
  }, [results, resultsSearch, resultsSortBy, sortItems]);

  const visibleCourses = useMemo(() => {
    const q = coursesSearch.trim().toLowerCase();
    const filtered = courses.filter((course) => !q || `${course.name || ''} ${course.department_name || ''} ${course.branch_name || ''} ${course.university_name || ''} ${course.level || ''}`.toLowerCase().includes(q));
    return sortItems(filtered, coursesSortBy, (course) => course.name, (course) => Number(course.id || 0));
  }, [courses, coursesSearch, coursesSortBy, sortItems]);
  const visibleLiveAttempts = useMemo(() => liveAttempts, [liveAttempts]);
  const examExport = {
    columns: ['ID', text.title, text.examCode, text.accessMode, text.course, text.academicYear, text.department, text.faculty, text.branch, text.university, text.questions, text.totalMarks, text.start, text.end],
    rows: visibleExams.map((exam) => [exam.id, exam.title, exam.exam_code || '-', exam.access_mode, exam.course_name || '-', exam.level || '-', exam.department_name || '-', exam.faculty_name || '-', exam.branch_name || '-', exam.university_name || '-', exam.questions_count ?? 0, exam.total_marks, formatDateTime(exam.start_date), formatDateTime(exam.end_date)]),
  };
  const resultsExport = {
    columns: [text.student, text.email, text.course, text.academicYear, text.department, text.faculty, text.branch, text.university, text.score, text.totalMarks, text.percentage, text.status, text.violations, text.details, text.submitTime],
    rows: visibleResults.map((result) => [result.student_name, result.student_email, result.course_name || '-', result.level || '-', result.department_name || '-', result.faculty_name || '-', result.branch_name || '-', result.university_name || '-', result.score, result.total_marks, `${result.percentage}%`, result.status, result.violations_count ?? 0, result.violation_summary || '-', formatDateTime(result.submit_time)]),
  };
  const coursesExport = {
    columns: ['ID', text.course, text.academicYear, text.department, text.faculty, text.branch, text.university],
    rows: visibleCourses.map((course) => [course.id, course.name, course.level || '-', course.department_name || '-', course.faculty_name || '-', course.branch_name || '-', course.university_name || '-']),
  };
  const exportButtons = (filename, payload) => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <button type="button" style={btnSecondary} onClick={() => exportCsv(filename, payload.columns, payload.rows)}>{text.exportCsv}</button>
      <button type="button" style={btnSecondary} onClick={() => exportExcel(filename, payload.columns, payload.rows)}>{text.exportExcel}</button>
    </div>
  );
  const exportSelectedButtons = (filename, payload, disabled) => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <button type="button" style={{ ...btnSecondary, opacity: disabled ? 0.6 : 1 }} disabled={disabled} onClick={() => exportCsv(`${filename}-selected`, payload.columns, payload.rows)}>{text.exportSelectedCsv}</button>
      <button type="button" style={{ ...btnSecondary, opacity: disabled ? 0.6 : 1 }} disabled={disabled} onClick={() => exportExcel(`${filename}-selected`, payload.columns, payload.rows)}>{text.exportSelectedExcel}</button>
    </div>
  );
  const pageSize = 8;
  const paginate = (items, key) => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const current = Math.min(pages[key] || 1, totalPages);
    const startIndex = (current - 1) * pageSize;
    return { items: items.slice(startIndex, startIndex + pageSize), current, totalPages };
  };
  const pagedExams = paginate(visibleExams, 'exams');
  const pagedResults = paginate(visibleResults, 'results');
  const pagedCourses = paginate(visibleCourses, 'courses');
  const selectedExamRows = visibleExams.filter((exam) => selectedExamIds.includes(exam.id));
  const selectedResultRows = visibleResults.filter((result) => selectedResultIds.includes(`${result.student_email}-${result.submit_time}-${result.score}`));
  const selectedCourseRows = visibleCourses.filter((course) => selectedCourseIds.includes(course.id));
  const selectedExamsExport = {
    columns: examExport.columns,
    rows: selectedExamRows.map((exam) => [exam.id, exam.title, exam.exam_code || '-', exam.access_mode, exam.course_name || '-', exam.level || '-', exam.department_name || '-', exam.faculty_name || '-', exam.branch_name || '-', exam.university_name || '-', exam.questions_count ?? 0, exam.total_marks, formatDateTime(exam.start_date), formatDateTime(exam.end_date)]),
  };
  const selectedResultsExport = {
    columns: resultsExport.columns,
    rows: selectedResultRows.map((result) => [result.student_name, result.student_email, result.course_name || '-', result.level || '-', result.department_name || '-', result.faculty_name || '-', result.branch_name || '-', result.university_name || '-', result.score, result.total_marks, `${result.percentage}%`, result.status, result.violations_count ?? 0, result.violation_summary || '-', formatDateTime(result.submit_time)]),
  };
  const selectedCoursesExport = {
    columns: coursesExport.columns,
    rows: selectedCourseRows.map((course) => [course.id, course.name, course.level || '-', course.department_name || '-', course.faculty_name || '-', course.branch_name || '-', course.university_name || '-']),
  };
  const toggleSelected = (setter, id) => setter((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const resultKey = (result) => `${result.student_email}-${result.submit_time}-${result.score}`;
  const copySelectedExamCodes = async () => {
    const codes = selectedExamRows.map((exam) => exam.exam_code).filter(Boolean).join('\n');
    if (!codes) return;
    try {
      await navigator.clipboard.writeText(codes);
      setCopiedCode('selected-bulk');
      setTimeout(() => setCopiedCode(''), 1200);
    } catch (_) {}
  };

  const editableExams = useMemo(
    () => exams.filter((exam) => !isExamLocked(exam)),
    [exams, isExamLocked]
  );

  useEffect(() => {
    if (!editableExams.length) {
      setBankTargetExamId('');
      return;
    }
    setBankTargetExamId((prev) => {
      if (prev && editableExams.some((exam) => String(exam.id) === String(prev))) {
        return prev;
      }
      return String(editableExams[0].id);
    });
  }, [editableExams]);
  const renderPagination = (key, meta) => {
    if (!meta || meta.totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
        <span style={{ color: colors.textMuted, fontSize: 13 }}>{`${text.page} ${meta.current} / ${meta.totalPages}`}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={{ ...btnSecondary, opacity: meta.current === 1 ? 0.6 : 1 }} disabled={meta.current === 1} onClick={() => setPages((prev) => ({ ...prev, [key]: Math.max(1, meta.current - 1) }))}>{text.previous}</button>
          <button type="button" style={{ ...btnSecondary, opacity: meta.current === meta.totalPages ? 0.6 : 1 }} disabled={meta.current === meta.totalPages} onClick={() => setPages((prev) => ({ ...prev, [key]: Math.min(meta.totalPages, meta.current + 1) }))}>{text.next}</button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout navItems={navItems} interactiveNav>
      <div style={{ marginBottom: 16, color: colors.textMuted, fontSize: 13 }}>{user?.name || text.teacher}</div>

      <div style={{ ...cardBase, padding: 18, marginBottom: 16, background: isDark ? 'rgba(255,255,255,.03)' : colors.cardBg2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: colors.text, fontSize: 17, fontWeight: 'bold', marginBottom: 6 }}>
              {isIndependent ? text.independentTitle : text.academicTitle}
            </div>
            <div style={{ color: colors.textMuted, fontSize: 12 }}>
              {isIndependent ? text.independentHint : text.academicHint}
            </div>
          </div>
          <span style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 'bold', background: isIndependent ? 'rgba(44,62,107,.15)' : 'rgba(30,107,62,.15)', color: isIndependent ? (isDark ? '#b7cdf1' : '#2C3E6B') : '#86efac', border: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>
            {isIndependent ? text.independentTitle : text.academicTitle}
          </span>
        </div>
        {!isIndependent && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 14 }}>
            {[
              [text.university, user?.university_name || '-'],
              [text.branch, user?.branch_name || '-'],
              [text.faculty, user?.faculty_name || '-'],
              [text.department, user?.department_name || '-'],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  backgroundColor: isDark ? 'rgba(255,255,255,.04)' : '#FBF9F6',
                  border: `1px solid ${colors.border}`,
                  transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = isDark ? '0 12px 26px rgba(0,0,0,.24)' : '0 14px 28px rgba(139,107,74,.12)';
                  e.currentTarget.style.borderColor = colors.accent;
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(201,168,130,.08)' : '#FFFDF8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,.04)' : '#FBF9F6';
                }}
              >
                <div style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>{label}</div>
                <div style={{ color: colors.text, fontSize: 13, fontWeight: 'bold', lineHeight: 1.6 }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'exams' && (
        <div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <h2 style={{ color: colors.text, fontSize: 22, margin: 0 }}>{text.myExams}</h2>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 10, flexWrap: 'wrap', width: 'min(100%, 980px)', justifyContent: 'flex-end' }}>
              <input value={examSearch} onChange={(e) => setExamSearch(e.target.value)} placeholder={text.searchExams} style={{ ...inputStyle, minWidth: isMobile ? '100%' : isTablet ? 170 : 220, width: isMobile ? '100%' : 'auto', flex: 1 }} />
              <select value={examTypeFilter} onChange={(e) => setExamTypeFilter(e.target.value)} style={{ ...inputStyle, width: isMobile ? '100%' : 160 }}>
                <option value="all">{text.allTypes}</option>
                <option value="department">department</option>
                <option value="link">link</option>
              </select>
              <select value={examSortBy} onChange={(e) => setExamSortBy(e.target.value)} style={{ ...inputStyle, width: isMobile ? '100%' : 160 }}>
                <option value="newest">{`${text.sortBy}: ${text.byNewest}`}</option>
                <option value="name">{`${text.sortBy}: ${text.byName}`}</option>
                <option value="id">{`${text.sortBy}: ${text.byId}`}</option>
              </select>
              {exportButtons('doctor-exams', examExport)}
              {exportSelectedButtons('doctor-exams', selectedExamsExport, selectedExamRows.length === 0)}
              <button type="button" style={{ ...btnSecondary, opacity: selectedExamRows.length === 0 ? 0.6 : 1 }} disabled={selectedExamRows.length === 0} onClick={copySelectedExamCodes}>
                {copiedCode === 'selected-bulk' ? text.copied : text.copySelectedCodes}
              </button>
              <button style={btnPrimary} onClick={() => setShowCreateForm((prev) => !prev)}>
                {showCreateForm ? text.close : text.createExam}
              </button>
            </div>
          </div>
          <div style={{ color: colors.textMuted, fontSize: 13, marginBottom: 10 }}>{`${text.selectedCount}: ${selectedExamRows.length}`}</div>
          {tabLoading.exams && (
            <div style={{ ...cardBase, padding: 16, marginBottom: 12, color: colors.textMuted }}>
              {isAr ? 'جاري تحميل الامتحانات...' : 'Loading exams...'}
            </div>
          )}

          {showCreateForm && (
            <div style={{ ...cardBase, padding: 18, marginBottom: 14 }}>
              <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: 12 }}>{text.createExam}</div>
              <div style={{ color: colors.textMuted, fontSize: 13, marginBottom: 12 }}>{text.questionBuilderHint}</div>
              <form onSubmit={handleCreateExam}>
                <div style={{ display: 'grid', gridTemplateColumns: twoColumnGrid, gap: 12 }}>
                  <div>
                    <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.title}</div>
                    <input value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} style={inputStyle} required />
                  </div>

                  <div>
                    <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.accessMode}</div>
                    <select
                      value={examForm.access_mode}
                      onChange={(e) => setExamForm({ ...examForm, access_mode: e.target.value, course_id: e.target.value === 'link' ? '' : examForm.course_id })}
                      style={inputStyle}
                      disabled={isIndependent}
                    >
                      <option value="link">{text.linkExam}</option>
                      {!isIndependent && <option value="department">{text.departmentExam}</option>}
                    </select>
                  </div>

                  {examForm.access_mode === 'department' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.course}</div>
                      <select value={examForm.course_id} onChange={(e) => setExamForm({ ...examForm, course_id: e.target.value })} style={inputStyle} required disabled={courses.length === 0}>
                        {courses.length === 0 ? (
                          <option value="">{text.noCourses}</option>
                        ) : (
                          courses.map((course) => (
                            <option key={course.id} value={String(course.id)}>{formatCourseLabel(course)}</option>
                          ))
                        )}
                      </select>
                    </div>
                  )}

                  <div>
                    <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.duration}</div>
                    <input type="number" min="1" value={examForm.duration} onChange={(e) => setExamForm({ ...examForm, duration: e.target.value })} style={inputStyle} required />
                  </div>

                  <div>
                    <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.totalMarks}</div>
                    <input type="number" min="1" value={examForm.total_marks} onChange={(e) => setExamForm({ ...examForm, total_marks: e.target.value })} style={inputStyle} required />
                  </div>

                  <div>
                    <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.codeMode}</div>
                    <select
                      value={examForm.exam_code_mode}
                      onChange={(e) => setExamForm({ ...examForm, exam_code_mode: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="auto">{text.codeAuto}</option>
                      <option value="manual">{text.codeManual}</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.examCode}</div>
                    <input
                      value={examForm.exam_code}
                      onChange={(e) => setExamForm({ ...examForm, exam_code: e.target.value })}
                      style={{ ...inputStyle, opacity: examForm.exam_code_mode === 'manual' ? 1 : 0.65 }}
                      required={examForm.exam_code_mode === 'manual'}
                      disabled={examForm.exam_code_mode !== 'manual'}
                      placeholder={examForm.exam_code_mode === 'manual' ? '' : text.codeAuto}
                    />
                  </div>

                  <div>
                    <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.type}</div>
                    <input value={examForm.access_mode === 'link' ? text.linkExam : text.departmentExam} style={{ ...inputStyle, opacity: 0.8 }} readOnly />
                  </div>

                  <div>
                    <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.startDate}</div>
                    <input type="datetime-local" value={examForm.start_date} onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })} style={inputStyle} required />
                  </div>

                  <div>
                    <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.endDate}</div>
                    <input type="datetime-local" value={examForm.end_date} onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })} style={inputStyle} required />
                  </div>

                  <div style={{ gridColumn: '1 / -1', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, background: colors.cardBg2 }}>
                    <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>{text.randomizeQuestions}</div>
                    <div style={{ color: colors.textMuted, fontSize: 12, marginBottom: 12 }}>{text.randomizeHint}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: twoColumnGrid, gap: 12 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}>
                        <input type="checkbox" checked={Boolean(examForm.randomize_questions)} onChange={(e) => setExamForm({ ...examForm, randomize_questions: e.target.checked })} />
                        <span>{text.randomizeQuestions}</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}>
                        <input type="checkbox" checked={Boolean(examForm.randomize_options)} onChange={(e) => setExamForm({ ...examForm, randomize_options: e.target.checked })} />
                        <span>{text.randomizeOptions}</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, background: colors.cardBg2 }}>
                    <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: 10 }}>{isAr ? 'إعدادات الأمان والسياسة' : 'Security & Policy Settings'}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: twoColumnGrid, gap: 12 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}>
                        <input type="checkbox" checked={Boolean(examForm.proctoring_enabled)} onChange={(e) => setExamForm({ ...examForm, proctoring_enabled: e.target.checked })} />
                        <span>{text.proctoringEnabled}</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}>
                        <input type="checkbox" checked={Boolean(examForm.screen_capture_protection)} onChange={(e) => setExamForm({ ...examForm, screen_capture_protection: e.target.checked })} />
                        <span>{text.screenCaptureProtection}</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}>
                        <input type="checkbox" checked={Boolean(examForm.is_demo_exam)} onChange={(e) => setExamForm({ ...examForm, is_demo_exam: e.target.checked })} />
                        <span>{text.demoExam}</span>
                      </label>
                      <div>
                        <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.maxAttempts}</div>
                        <input type="number" min="1" value={examForm.max_attempts_per_student} onChange={(e) => setExamForm({ ...examForm, max_attempts_per_student: e.target.value })} style={inputStyle} required />
                      </div>
                      <div>
                        <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.postEndVisibility}</div>
                        <select value={examForm.post_end_visibility_mode} onChange={(e) => setExamForm({ ...examForm, post_end_visibility_mode: e.target.value })} style={inputStyle}>
                          <option value="hide">{text.hideAfterEnd}</option>
                          <option value="archive">{text.archiveAfterEnd}</option>
                        </select>
                      </div>
                      <div>
                        <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.postEndGraceMinutes}</div>
                        <input type="number" min="0" value={examForm.post_end_grace_minutes} onChange={(e) => setExamForm({ ...examForm, post_end_grace_minutes: e.target.value })} style={inputStyle} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={modalActionRowStyle}>
                  <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, width: isNarrowMobile ? '100%' : 'auto' }} disabled={loading}>{loading ? '...' : text.create}</button>
                  <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => { setShowCreateForm(false); resetExamForm(); }}>{text.cancel}</button>
                </div>
              </form>
            </div>
          )}

          {createExamMessage && (
            <div style={{ ...cardBase, padding: 14, marginBottom: 14, borderColor: colors.accent, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>{createExamMessage}</div>
              <button
                type="button"
                style={{ ...btnPrimary, padding: '9px 12px', fontSize: 12, width: isNarrowMobile ? '100%' : 'auto' }}
                onClick={() => {
                  setCreateExamMessage('');
                  openQuestionBuilder(selectedExam);
                }}
              >
                {text.addQuestionsNow}
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(310px, 1fr))', gap: 14 }}>
            {pagedExams.items.map((exam) => {
              const hasNoQuestions = Number(exam.questions_count ?? 0) === 0;
              return (
              <div
                key={exam.id}
                style={{ ...cardBase, padding: isNarrowMobile ? 14 : 16, display: 'flex', flexDirection: 'column', gap: 10, transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease', cursor: 'default' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = isDark ? '0 14px 28px rgba(0,0,0,.24)' : '0 16px 30px rgba(139,107,74,.12)';
                  e.currentTarget.style.borderColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = colors.shadow;
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={selectedExamIds.includes(exam.id)} onChange={() => toggleSelected(setSelectedExamIds, exam.id)} />
                    <div style={{ color: colors.text, fontWeight: 'bold' }}>{exam.title}</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 'bold', background: exam.access_mode === 'link' ? 'rgba(44,62,107,.15)' : 'rgba(30,107,62,.15)', color: exam.access_mode === 'link' ? (isDark ? '#b7cdf1' : '#2C3E6B') : '#86efac', border: `1px solid ${colors.border}` }}>
                    {exam.access_mode === 'link' ? text.linkExam : text.departmentExam}
                  </span>
                </div>

                  <div style={{ color: colors.textMuted, fontSize: 12, lineHeight: 1.8 }}>
                    {text.code}: {exam.exam_code}
                    <br />
                    {text.course}: {exam.course_name || '-'}
                    <br />
                    {text.academicYear}: {exam.level || '-'}
                    <br />
                    {text.department}: {exam.department_name || '-'}
                    <br />
                    {text.faculty}: {exam.faculty_name || '-'}
                    <br />
                    {text.branch}: {exam.branch_name || '-'}
                    <br />
                    {text.university}: {exam.university_name || '-'}
                    <br />
                    {text.start}: {formatDateTime(exam.start_date)}
                    <br />
                  {text.end}: {formatDateTime(exam.end_date)}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', color: colors.textMuted, fontSize: 12 }}>
                  <span style={hasNoQuestions ? { color: '#c0392b', fontWeight: 'bold' } : undefined}>{text.questions}: {exam.questions_count ?? 0}</span>
                  <span>{text.totalMarks}: {exam.total_marks}</span>
                  <span>{text.maxAttempts}: {Number(exam.max_attempts_per_student || 1)}</span>
                  {Boolean(exam.proctoring_enabled) && <span>{text.proctoringEnabled}</span>}
                  {Boolean(exam.screen_capture_protection) && <span>{text.screenCaptureProtection}</span>}
                  {String(exam.post_end_visibility_mode || 'hide').toLowerCase() === 'archive' ? <span>{text.archiveAfterEnd}</span> : <span>{text.hideAfterEnd}</span>}
                  {Boolean(exam.is_demo_exam) && <span>{text.demoExam}</span>}
                  {Boolean(exam.randomize_questions) && <span>{text.randomizeQuestions}</span>}
                  {Boolean(exam.randomize_options) && <span>{text.randomizeOptions}</span>}
                  {hasNoQuestions && (
                    <span style={{ padding: '3px 9px', borderRadius: 999, border: '1px solid rgba(192,57,43,.2)', background: isDark ? 'rgba(192,57,43,.14)' : 'rgba(192,57,43,.08)', color: '#c0392b', fontWeight: 'bold' }}>
                      {text.zeroQuestionsStatus}
                    </span>
                  )}
                </div>

                {hasNoQuestions && (
                  <div style={{ border: `1px solid ${isDark ? 'rgba(192,57,43,.28)' : 'rgba(192,57,43,.18)'}`, background: isDark ? 'rgba(192,57,43,.08)' : 'rgba(192,57,43,.05)', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>{text.examNeedsQuestions}</div>
                    <div style={{ color: colors.textMuted, fontSize: 12, lineHeight: 1.8 }}>{text.examNeedsQuestionsHint}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <button
                        type="button"
                        style={{ ...btnPrimary, ...compactActionButton, opacity: isExamLocked(exam) ? 0.55 : 1, cursor: isExamLocked(exam) ? 'not-allowed' : 'pointer', width: isNarrowMobile ? '100%' : 'auto' }}
                        onClick={() => { if (!isExamLocked(exam)) { openQuestionBuilder(exam); } }}
                        disabled={isExamLocked(exam)}
                        title={isExamLocked(exam) ? text.examLocked : ''}
                      >
                        {text.manageQuestions}
                      </button>
                    </div>
                  </div>
                )}

                <div style={actionGroupStyle}>
                  <button type="button" style={{ ...btnSecondary, ...compactActionButton }} onClick={() => copyCode(exam.exam_code)}>
                    {copiedCode === exam.exam_code ? text.copied : text.copyCode}
                  </button>
                  <button type="button" style={{ ...btnSecondary, ...compactActionButton }} onClick={() => openExamPreview(exam)}>
                    {text.viewExam}
                  </button>
                  <button type="button" style={{ ...btnSecondary, ...compactActionButton }} onClick={() => openEditExam(exam)}>
                    {text.editExam}
                  </button>
                  <button type="button" style={{ ...btnSecondary, ...compactActionButton }} onClick={() => printExamPaper(exam)}>
                    {text.printExam}
                  </button>
                  <button type="button" style={{ ...btnSecondary, ...compactActionButton }} onClick={async () => { setSelectedExam(exam); await fetchResults(exam.id); navigate('/doctor?tab=results'); }}>
                    {text.viewResults}
                  </button>
                  <button
                    type="button"
                    style={{ ...btnPrimary, ...compactActionButton, opacity: isExamLocked(exam) ? 0.55 : 1, cursor: isExamLocked(exam) ? 'not-allowed' : 'pointer' }}
                    onClick={() => { if (!isExamLocked(exam)) { openQuestionBuilder(exam); } }}
                    disabled={isExamLocked(exam)}
                    title={isExamLocked(exam) ? text.examLocked : ''}
                  >
                    {text.addQuestion}
                  </button>
                  <button
                    type="button"
                    style={{ ...btnSecondary, ...compactActionButton, color: '#c0392b', borderColor: 'rgba(192,57,43,.25)' }}
                    onClick={() => handleDeleteExam(exam)}
                  >
                    {text.deleteExam}
                  </button>
                </div>
              </div>
            )})}
          </div>

          {visibleExams.length === 0 && <div style={{ ...cardBase, padding: 18, marginTop: 14, color: colors.textMuted }}>{text.noExams}</div>}
          {renderPagination('exams', pagedExams)}
        </div>
      )}

      {activeTab === 'results' && (
        <div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <h2 style={{ color: colors.text, fontSize: 22, margin: 0 }}>{text.results}</h2>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 10, flexWrap: 'wrap', width: 'min(100%, 980px)', justifyContent: 'flex-end' }}>
              {selectedExam && <div style={{ color: colors.textMuted, fontSize: 13, alignSelf: isMobile ? 'stretch' : 'center' }}>{text.exam}: <span style={{ color: colors.text, fontWeight: 'bold' }}>{selectedExam.title}</span></div>}
              <input value={resultsSearch} onChange={(e) => setResultsSearch(e.target.value)} placeholder={text.searchResults} style={{ ...inputStyle, minWidth: isMobile ? '100%' : isTablet ? 170 : 220, width: isMobile ? '100%' : 'auto', flex: 1 }} />
              <select value={resultsSortBy} onChange={(e) => setResultsSortBy(e.target.value)} style={{ ...inputStyle, width: isMobile ? '100%' : 160 }}>
                <option value="newest">{`${text.sortBy}: ${text.byNewest}`}</option>
                <option value="name">{`${text.sortBy}: ${text.byName}`}</option>
                <option value="id">{`${text.sortBy}: ${text.byId}`}</option>
              </select>
              {exportButtons('doctor-results', resultsExport)}
              {exportSelectedButtons('doctor-results', selectedResultsExport, selectedResultRows.length === 0)}
            </div>
          </div>
          <div style={{ color: colors.textMuted, fontSize: 13, marginBottom: 10 }}>{`${text.selectedCount}: ${selectedResultRows.length}`}</div>
          {tabLoading.results && (
            <div style={{ ...cardBase, padding: 16, marginBottom: 12, color: colors.textMuted }}>
              {isAr ? 'جاري تحميل النتائج...' : 'Loading results...'}
            </div>
          )}

          {!selectedExam ? (
            <div style={{ ...cardBase, padding: 18, color: colors.textMuted }}>{text.noResults}</div>
          ) : (
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', minWidth: 1180, borderCollapse: 'collapse', backgroundColor: colors.cardBg, borderRadius: 14, overflow: 'hidden', border: `1px solid ${colors.border}`, boxShadow: colors.shadow }}>
                <thead>
                  <tr>
                    {['', text.student, text.email, text.course, text.academicYear, text.department, text.faculty, text.branch, text.university, text.score, text.totalMarks, text.percentage, text.status, text.violations, text.details, text.submitTime, text.actions].map((header) => (
                      <th key={header} style={{ backgroundColor: colors.cardBg2, color: colors.text, padding: '12px', textAlign: 'left', fontSize: 13, borderBottom: `1px solid ${colors.border}` }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedResults.items.map((result, index) => (
                    <tr key={index} style={{ background: isDark ? (index % 2 === 0 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)') : (index % 2 === 0 ? '#fff' : '#FBF9F6') }}>
                      <td style={{ padding: 12, borderBottom: `1px solid ${colors.border}` }}><input type="checkbox" checked={selectedResultIds.includes(resultKey(result))} onChange={() => toggleSelected(setSelectedResultIds, resultKey(result))} /></td>
                      <td style={{ padding: 12, color: colors.text, fontWeight: 'bold', borderBottom: `1px solid ${colors.border}` }}>{result.student_name}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.student_email}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.course_name || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.level || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.department_name || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.faculty_name || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.branch_name || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.university_name || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.score}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.total_marks}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.percentage}%</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>
                        {result.status === 'Terminated' ? text.terminated : result.status === 'Pending Review' ? text.pendingReview : text.completedStatus}
                      </td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{result.violations_count ?? 0}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}`, maxWidth: 260 }}>{result.violation_summary || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{formatDateTime(result.submit_time)}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>
                        <button type="button" style={{ ...btnSecondary, ...compactActionButton, width: 'auto' }} onClick={() => openAttemptReview(result)}>
                          {text.reviewAttempt}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visibleResults.length === 0 && (
                    <tr>
                      <td colSpan={17} style={{ padding: 18, color: colors.textMuted }}>{text.noResults}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {selectedExam && renderPagination('results', pagedResults)}
        </div>
      )}

      {activeTab === 'monitor' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <h2 style={{ color: colors.text, fontSize: 22, margin: 0 }}>{text.openAttempts}</h2>
            <button type="button" style={btnSecondary} onClick={fetchLiveMonitor}>{text.refresh}</button>
          </div>
          {tabLoading.monitor && (
            <div style={{ ...cardBase, padding: 16, marginBottom: 12, color: colors.textMuted }}>
              {isAr ? 'جاري تحميل المتابعة الحية...' : 'Loading live monitor...'}
            </div>
          )}

          {visibleLiveAttempts.length === 0 ? (
            <div style={{ ...cardBase, padding: 18, color: colors.textMuted }}>{text.noOpenAttempts}</div>
          ) : (
            <div style={{ ...cardBase, overflowX: 'auto', overflowY: 'hidden' }}>
              <table style={{ width: '100%', minWidth: 1080, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: colors.cardBg2 }}>
                    {[text.exam, text.student, text.email, text.course, text.academicYear, text.department, text.faculty, text.branch, text.university, text.violations, text.details, text.start, text.lastSeen].map((header) => (
                      <th key={header} style={{ padding: 12, color: colors.text, textAlign: 'left', borderBottom: `1px solid ${colors.border}` }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleLiveAttempts.map((attempt) => (
                    <tr key={attempt.attempt_id}>
                      <td style={{ padding: 12, color: colors.text, fontWeight: 'bold', borderBottom: `1px solid ${colors.border}` }}>
                        <div>{attempt.exam_title}</div>
                        <div style={{ color: colors.textMuted, fontSize: 12 }}>{attempt.exam_code}</div>
                      </td>
                      <td style={{ padding: 12, color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{attempt.student_name}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{attempt.student_email}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{attempt.course_name || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{attempt.level || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{attempt.department_name || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{attempt.faculty_name || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{attempt.branch_name || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{attempt.university_name || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{attempt.violations_count ?? 0}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}`, maxWidth: 280 }}>{attempt.violation_summary || '-'}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{formatDateTime(attempt.start_time)}</td>
                      <td style={{ padding: 12, color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>
                        {attempt.last_seen_seconds != null ? `${attempt.last_seen_seconds}s` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'bank' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <h2 style={{ color: colors.text, fontSize: 22, margin: 0 }}>{text.questionBank}</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: 'min(100%, 980px)', justifyContent: 'flex-end' }}>
              <select value={bankTargetExamId} onChange={(e) => setBankTargetExamId(e.target.value)} style={{ ...inputStyle, width: 280 }} disabled={!editableExams.length}>
                {!editableExams.length ? (
                  <option value="">{text.noEditableExams}</option>
                ) : (
                  editableExams.map((exam) => (
                    <option key={exam.id} value={String(exam.id)}>
                      {exam.title}
                    </option>
                  ))
                )}
              </select>
              <button type="button" style={btnSecondary} onClick={fetchQuestionBank}>{text.refresh}</button>
            </div>
          </div>
          {tabLoading.bank && (
            <div style={{ ...cardBase, padding: 16, marginBottom: 12, color: colors.textMuted }}>
              {isAr ? 'جاري تحميل بنك الأسئلة...' : 'Loading question bank...'}
            </div>
          )}

          <div style={{ color: colors.textMuted, fontSize: 13, marginBottom: 12 }}>
            {text.targetExam}: <span style={{ color: colors.text, fontWeight: 'bold' }}>
              {editableExams.find((exam) => String(exam.id) === String(bankTargetExamId))?.title || text.noEditableExams}
            </span>
          </div>

          {questionBank.length === 0 ? (
            <div style={{ ...cardBase, padding: 18, color: colors.textMuted }}>{text.noBankQuestions}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {questionBank.map((item) => {
                const itemOptions = parseQuestionOptions(item.options);
                return (
                  <div key={item.id} style={{ ...cardBase, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ color: colors.text, fontWeight: 'bold' }}>{item.question_type}</div>
                      <span style={{ color: colors.textMuted, fontSize: 12 }}>{text.marks}: {item.marks}</span>
                    </div>
                    <div style={{ color: colors.text, lineHeight: 1.8 }}>{item.question_text}</div>
                    {itemOptions.length > 0 && (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {itemOptions.map((option, idx) => (
                          <div key={`${item.id}-${idx}`} style={{ color: colors.textMuted, fontSize: 12, padding: '8px 10px', borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.cardBg2 }}>
                            {idx + 1}. {option.option_text}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={actionGroupStyle}>
                      <button type="button" style={{ ...btnPrimary, ...compactActionButton, opacity: editableExams.length ? 1 : 0.6 }} disabled={!editableExams.length} onClick={() => handleInsertBankQuestion(item)}>
                        {text.addToExam}
                      </button>
                      <button type="button" style={{ ...btnSecondary, ...compactActionButton, color: '#c0392b', borderColor: 'rgba(192,57,43,.25)' }} onClick={() => handleDeleteBankQuestion(item)}>
                        {text.removeFromBank}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <h2 style={{ color: colors.text, fontSize: 22, margin: 0 }}>{text.courses}</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: 'min(100%, 860px)', justifyContent: 'flex-end' }}>
              <input value={coursesSearch} onChange={(e) => setCoursesSearch(e.target.value)} placeholder={text.searchCourses} style={{ ...inputStyle, minWidth: isTablet ? 170 : 220, flex: 1 }} />
              <select value={coursesSortBy} onChange={(e) => setCoursesSortBy(e.target.value)} style={{ ...inputStyle, width: 160 }}>
                <option value="name">{`${text.sortBy}: ${text.byName}`}</option>
                <option value="id">{`${text.sortBy}: ${text.byId}`}</option>
                <option value="newest">{`${text.sortBy}: ${text.byNewest}`}</option>
              </select>
              {exportButtons('doctor-courses', coursesExport)}
              {exportSelectedButtons('doctor-courses', selectedCoursesExport, selectedCourseRows.length === 0)}
              <button type="button" style={btnSecondary} onClick={fetchCourses}>{text.refresh}</button>
            </div>
          </div>
          <div style={{ color: colors.textMuted, fontSize: 13, marginBottom: 10 }}>{`${text.selectedCount}: ${selectedCourseRows.length}`}</div>
          {tabLoading.courses && (
            <div style={{ ...cardBase, padding: 16, marginBottom: 12, color: colors.textMuted }}>
              {isAr ? 'جاري تحميل المواد...' : 'Loading courses...'}
            </div>
          )}

          <div style={{ ...cardBase, padding: 14 }}>
            {visibleCourses.length === 0 ? (
              <div style={{ color: colors.textMuted, fontSize: 13 }}>{text.noCourses}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {pagedCourses.items.map((course) => (
                  <div
                    key={course.id}
                    style={{ ...cardBase, padding: 14, boxShadow: 'none', transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease', cursor: 'default' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = isDark ? '0 12px 24px rgba(0,0,0,.22)' : '0 14px 28px rgba(139,107,74,.12)';
                      e.currentTarget.style.borderColor = colors.accent;
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(201,168,130,.06)' : '#FFFDF8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.backgroundColor = colors.cardBg;
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <input type="checkbox" checked={selectedCourseIds.includes(course.id)} onChange={() => toggleSelected(setSelectedCourseIds, course.id)} />
                      <div style={{ color: colors.text, fontWeight: 'bold' }}>{course.name}</div>
                    </div>
                    <div style={{ color: colors.textMuted, fontSize: 12, lineHeight: 1.7 }}>
                      <div>#{course.id}</div>
                      <div>{`${text.academicYear}: ${course.level || '-'}`}</div>
                      <div>{`${text.department}: ${course.department_name || '-'}`}</div>
                      <div>{`${text.faculty}: ${course.faculty_name || '-'}`}</div>
                      <div>{`${text.branch}: ${course.branch_name || '-'}`}</div>
                      <div>{`${text.university}: ${course.university_name || '-'}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {renderPagination('courses', pagedCourses)}
        </div>
      )}

      {showAddQuestion && selectedExam && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? 10 : 16 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) { setShowAddQuestion(false); resetQuestionBuilder(selectedExam); } }}
        >
          <div style={modalCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{text.questionBuilderTitle}</div>
                <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{selectedExam.title}</div>
              </div>
              <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => { setShowAddQuestion(false); resetQuestionBuilder(selectedExam); }}>{text.close}</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 14 }}>
              <div style={{ ...cardBase, padding: 12, boxShadow: 'none', background: colors.cardBg2 }}>
                <div style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>{text.currentQuestionNo}</div>
                <div style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>{Number(questionBuilderMeta.baseCount || 0) + Number(questionBuilderMeta.addedCount || 0) + 1}</div>
              </div>
              <div style={{ ...cardBase, padding: 12, boxShadow: 'none', background: colors.cardBg2 }}>
                <div style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>{text.questionsAddedThisSession}</div>
                <div style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>{questionBuilderMeta.addedCount || 0}</div>
              </div>
            </div>

            <div style={{ ...cardBase, padding: 14, boxShadow: 'none', background: colors.cardBg2, marginBottom: 16 }}>
              <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8 }}>{text.bulkImport}</div>
              <div style={{ color: colors.textMuted, fontSize: 12, lineHeight: 1.8, marginBottom: 8 }}>{text.bulkImportHint}</div>
              <div style={{ color: colors.textMuted, fontSize: 12, lineHeight: 1.8, marginBottom: 10 }}>{text.wordImportNote}</div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
                <span style={{ ...btnSecondary, padding: '8px 12px' }}>{text.uploadWord}</span>
                <span style={{ color: colors.textMuted, fontSize: 12 }}>{text.wordImportNote}</span>
                <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleWordUpload} style={{ display: 'none' }} />
              </label>
              <textarea
                value={bulkQuestionText}
                onChange={(e) => setBulkQuestionText(e.target.value)}
                placeholder={'question: What is AI?\ntype: MCQ\nmarks: 2\nanswer: Machine learning\noption1: Computer graphics\noption2: Machine learning\noption3: Networking\noption4: Databases\n---'}
                style={{ ...inputStyle, minHeight: 120, resize: 'vertical', marginBottom: 10 }}
              />
              <button type="button" style={{ ...btnSecondary, opacity: loading ? 0.7 : 1 }} disabled={loading || !bulkQuestionText.trim()} onClick={handleBulkImportQuestions}>
                {text.previewImport}
              </button>
            </div>

            <form onSubmit={(event) => handleAddQuestion(event, false)}>
              <div style={{ display: 'grid', gridTemplateColumns: twoColumnGrid, gap: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.questionText}</div>
                  <textarea value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} required />
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.questionType}</div>
                  <select value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })} style={inputStyle}>
                    <option value="MCQ">MCQ</option>
                    <option value="TrueFalse">{text.trueFalse}</option>
                    <option value="ShortAnswer">{text.shortAnswer}</option>
                  </select>
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.marks}</div>
                  <input value={questionForm.marks} onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })} style={inputStyle} required />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.correctAnswer}</div>
                  {questionForm.question_type === 'TrueFalse' ? (
                    <select value={String(questionForm.correct_answer || '').toLowerCase()} onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} style={inputStyle} required>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : questionForm.question_type === 'ShortAnswer' ? (
                    <textarea value={questionForm.correct_answer} onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} required />
                  ) : (
                    <input value={questionForm.correct_answer} onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} style={{ ...inputStyle, opacity: 0.65 }} readOnly placeholder="Correct option is selected below" />
                  )}
                </div>

                {questionForm.question_type === 'MCQ' && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                      <div style={{ color: colors.text, fontWeight: 'bold' }}>{text.options}</div>
                      <button type="button" style={{ ...btnSecondary, padding: '8px 10px', fontSize: 12 }} onClick={addOptionField}>
                        {text.addOption}
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: previewOptionsGrid, gap: 12 }}>
                      {questionForm.options.map((option, index) => (
                        <div key={index} style={{ ...cardBase, padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold' }}>{text.option} {index + 1}</div>
                            {questionForm.options.length > 2 && (
                              <button type="button" style={{ ...btnSecondary, padding: '6px 8px', fontSize: 11 }} onClick={() => removeOptionField(index)}>
                                {text.removeOption}
                              </button>
                            )}
                          </div>
                          <input value={option.option_text} onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)} style={inputStyle} required />
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, color: colors.textMuted, fontSize: 12, fontWeight: 'bold' }}>
                            <input type="radio" checked={option.is_correct} onChange={() => {
                              handleOptionChange(index, 'is_correct', true);
                              setQuestionForm((prev) => ({ ...prev, correct_answer: prev.options[index]?.option_text || '' }));
                            }} />
                            {text.correct}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={modalActionRowStyle}>
                <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, width: isNarrowMobile ? '100%' : 'auto' }} disabled={loading}>{loading ? '...' : text.saveQuestion}</button>
                <button type="button" style={{ ...btnSecondary, opacity: loading ? 0.7 : 1, width: isNarrowMobile ? '100%' : 'auto' }} disabled={loading} onClick={(event) => handleAddQuestion(event, true)}>
                  {text.saveAndNext}
                </button>
                <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => { setShowAddQuestion(false); resetQuestionBuilder(selectedExam); }}>{text.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportPreview && selectedExam && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 5100, background: 'rgba(0,0,0,.58)', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? 10 : 16 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) setShowImportPreview(false); }}
        >
          <div style={{ ...modalCardStyle, width: isNarrowMobile ? '100%' : 'min(980px, 96vw)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{text.previewImport}</div>
                <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{text.previewImportHint}</div>
                <div style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
                  {text.parsedQuestionsCount}: <strong style={{ color: colors.text }}>{bulkImportPreview.length}</strong>
                </div>
              </div>
              <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => setShowImportPreview(false)}>{text.close}</button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {bulkImportPreview.map((question, index) => (
                <div key={`${question.question_text}-${index}`} style={{ ...cardBase, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div style={{ color: colors.text, fontWeight: 'bold' }}>
                      {text.questionNumber} {index + 1}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, border: `1px solid ${colors.border}`, background: colors.cardBg2, color: colors.textMuted, fontSize: 12, fontWeight: 'bold' }}>
                        {question.question_type === 'TrueFalse'
                          ? text.trueFalse
                          : question.question_type === 'ShortAnswer'
                            ? text.shortAnswer
                            : 'MCQ'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, border: `1px solid ${colors.border}`, background: colors.cardBg2, color: colors.textMuted, fontSize: 12, fontWeight: 'bold' }}>
                        {text.marks}: {question.marks}
                      </span>
                    </div>
                  </div>

                  <div style={{ color: colors.text, fontWeight: 600, lineHeight: 1.8, marginBottom: 12 }}>
                    {question.question_text}
                  </div>

                  {question.question_type === 'MCQ' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: previewOptionsGrid, gap: 10 }}>
                      {(question.options || []).length > 0 ? (
                        (question.options || []).map((option, optionIndex) => (
                          <div
                            key={`${option.option_text || optionIndex}-${optionIndex}`}
                            style={{
                              ...cardBase,
                              padding: 12,
                              boxShadow: 'none',
                              borderColor: option.is_correct ? 'rgba(46, 204, 113, 0.45)' : colors.border,
                              background: option.is_correct ? 'rgba(46, 204, 113, 0.08)' : colors.cardBg2,
                            }}
                          >
                            <div style={{ color: colors.textMuted, fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>
                              {text.option} {optionIndex + 1}
                            </div>
                            <div style={{ color: colors.text }}>{option.option_text}</div>
                            {option.is_correct && (
                              <div style={{ color: '#2ecc71', fontSize: 12, fontWeight: 'bold', marginTop: 8 }}>{text.correct}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div style={{ color: colors.textMuted, fontSize: 13 }}>{text.noParsedOptions}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ ...cardBase, padding: 12, boxShadow: 'none', background: colors.cardBg2 }}>
                      <div style={{ color: colors.textMuted, fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>{text.extractedAnswer}</div>
                      <div style={{ color: colors.text, lineHeight: 1.8 }}>{String(question.correct_answer || '-')}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={modalActionRowStyle}>
              <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => setShowImportPreview(false)}>
                {text.backToImportEditor}
              </button>
              <button
                type="button"
                style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, width: isNarrowMobile ? '100%' : 'auto' }}
                disabled={loading || bulkImportPreview.length === 0}
                onClick={handleConfirmBulkImportQuestions}
              >
                {loading ? '...' : text.confirmImportQuestions}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExamPreview && selectedExam && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? 10 : 16 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) setShowExamPreview(false); }}
        >
          <div style={{ ...modalCardStyle, width: isNarrowMobile ? '100%' : 'min(980px, 96vw)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{text.examPreview}</div>
                <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{selectedExam.title}</div>
              </div>
              <div style={actionGroupStyle}>
                <button type="button" style={{ ...btnSecondary, ...compactActionButton, opacity: isExamLocked(selectedExam) ? 0.55 : 1, cursor: isExamLocked(selectedExam) ? 'not-allowed' : 'pointer' }} onClick={() => !isExamLocked(selectedExam) && openEditExam(selectedExam)} disabled={isExamLocked(selectedExam)} title={isExamLocked(selectedExam) ? text.examLocked : ''}>{text.editExam}</button>
                <button type="button" style={{ ...btnSecondary, ...compactActionButton, color: '#c0392b', borderColor: 'rgba(192,57,43,.25)' }} onClick={() => handleDeleteExam(selectedExam)}>{text.deleteExam}</button>
                <button type="button" style={{ ...btnSecondary, ...compactActionButton }} onClick={() => printExamPaper(selectedExam)}>{text.printExam}</button>
                <button type="button" style={{ ...btnSecondary, ...compactActionButton }} onClick={() => setShowExamPreview(false)}>{text.close}</button>
              </div>
            </div>

            <div style={{ color: colors.textMuted, fontSize: 12, marginBottom: 14 }}>{text.printHint}</div>

            {previewLoading && <div style={{ color: colors.textMuted }}>{text.refresh}...</div>}

            {!previewLoading && previewExam && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ ...cardBase, padding: 14, boxShadow: 'none', background: colors.cardBg2 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, color: colors.textMuted, fontSize: 13 }}>
                    <div><strong style={{ color: colors.text }}>{text.code}:</strong> {previewExam.exam_code || '-'}</div>
                    <div><strong style={{ color: colors.text }}>{text.course}:</strong> {previewExam.course_name || '-'}</div>
                    <div><strong style={{ color: colors.text }}>{text.duration}:</strong> {previewExam.duration}</div>
                    <div><strong style={{ color: colors.text }}>{text.totalMarks}:</strong> {previewExam.total_marks}</div>
                    <div><strong style={{ color: colors.text }}>{text.start}:</strong> {formatDateTime(previewExam.start_date)}</div>
                    <div><strong style={{ color: colors.text }}>{text.end}:</strong> {formatDateTime(previewExam.end_date)}</div>
                  </div>
                </div>

                {Array.isArray(previewExam.questions) && previewExam.questions.length > 0 ? (
                  previewExam.questions.map((question, index) => {
                    const options = parseQuestionOptions(question.options);
                    return (
                      <div key={question.id || index} style={{ ...cardBase, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                          <div style={{ color: colors.text, fontWeight: 'bold' }}>{`${text.questionNumber} ${index + 1}`}</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', color: colors.textMuted, fontSize: 12 }}>
                            <span>{text.questionType}: {question.question_type}</span>
                            <span>{text.marks}: {question.marks}</span>
                          </div>
                        </div>
                        <div style={{ color: colors.text, lineHeight: 1.9, marginBottom: 12 }}>{question.question_text}</div>
                        {options.length > 0 && (
                          <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                            {options.map((option, optionIndex) => (
                              <div key={option.id || optionIndex} style={{ color: colors.textMuted, fontSize: 13, padding: '10px 12px', borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.cardBg2 }}>
                                {`${optionIndex + 1}. ${option.option_text || option.text || ''}`}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.question_type !== 'MCQ' && (
                          <div style={{ color: colors.textMuted, fontSize: 13 }}>
                            <strong style={{ color: colors.text }}>{text.modelAnswer}:</strong> {question.correct_answer || '-'}
                          </div>
                        )}
                        <div style={actionGroupStyle}>
                          <button type="button" style={{ ...btnSecondary, ...compactActionButton }} onClick={() => handleSaveQuestionToBank(question)}>
                            {text.saveToBank}
                          </button>
                          <button type="button" style={{ ...btnSecondary, ...compactActionButton, opacity: isExamLocked(selectedExam) ? 0.55 : 1, cursor: isExamLocked(selectedExam) ? 'not-allowed' : 'pointer' }} onClick={() => !isExamLocked(selectedExam) && handleReorderQuestion(question, 'up')} disabled={isExamLocked(selectedExam)} title={isExamLocked(selectedExam) ? text.examLocked : ''}>
                            {text.moveUp}
                          </button>
                          <button type="button" style={{ ...btnSecondary, ...compactActionButton, opacity: isExamLocked(selectedExam) ? 0.55 : 1, cursor: isExamLocked(selectedExam) ? 'not-allowed' : 'pointer' }} onClick={() => !isExamLocked(selectedExam) && handleReorderQuestion(question, 'down')} disabled={isExamLocked(selectedExam)} title={isExamLocked(selectedExam) ? text.examLocked : ''}>
                            {text.moveDown}
                          </button>
                          <button type="button" style={{ ...btnSecondary, ...compactActionButton, opacity: isExamLocked(selectedExam) ? 0.55 : 1, cursor: isExamLocked(selectedExam) ? 'not-allowed' : 'pointer' }} onClick={() => !isExamLocked(selectedExam) && handleDuplicateQuestion(question)} disabled={isExamLocked(selectedExam)} title={isExamLocked(selectedExam) ? text.examLocked : ''}>
                            {text.duplicateQuestion}
                          </button>
                          <button type="button" style={{ ...btnSecondary, ...compactActionButton, opacity: isExamLocked(selectedExam) ? 0.55 : 1, cursor: isExamLocked(selectedExam) ? 'not-allowed' : 'pointer' }} onClick={() => !isExamLocked(selectedExam) && openEditQuestion(question)} disabled={isExamLocked(selectedExam)} title={isExamLocked(selectedExam) ? text.examLocked : ''}>
                            {text.editQuestion}
                          </button>
                          <button type="button" style={{ ...btnSecondary, ...compactActionButton, backgroundColor: isDark ? 'rgba(192,57,43,.12)' : '#fff5f5', color: '#c0392b', opacity: isExamLocked(selectedExam) ? 0.55 : 1, cursor: isExamLocked(selectedExam) ? 'not-allowed' : 'pointer' }} onClick={() => !isExamLocked(selectedExam) && handleDeleteQuestion(question)} disabled={isExamLocked(selectedExam)} title={isExamLocked(selectedExam) ? text.examLocked : ''}>
                            {text.deleteQuestion}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ ...cardBase, padding: 18, color: colors.textMuted }}>{text.noQuestionsYet}</div>
                )}
                {!questionOrderReady && (
                  <div style={{ ...cardBase, padding: 14, color: '#8B4A00', background: 'rgba(230,126,34,.10)', border: '1px solid rgba(230,126,34,.28)' }}>
                    {text.reorderLockedHint}
                  </div>
                )}
                {isExamLocked(selectedExam) && (
                  <div style={{ ...cardBase, padding: 14, color: '#8B4A00', background: 'rgba(230,126,34,.10)', border: '1px solid rgba(230,126,34,.28)' }}>
                    {text.examLocked}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showEditQuestion && selectedExam && editingQuestion && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 5001, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? 10 : 16 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) setShowEditQuestion(false); }}
        >
          <div style={modalCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ color: colors.text, fontWeight: 'bold' }}>{text.editQuestion} - <span style={{ color: colors.textMuted }}>{selectedExam.title}</span></div>
              <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => setShowEditQuestion(false)}>{text.close}</button>
            </div>

            <form onSubmit={handleUpdateQuestion}>
              <div style={{ display: 'grid', gridTemplateColumns: twoColumnGrid, gap: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.questionText}</div>
                  <textarea value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} required />
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.questionType}</div>
                  <select value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })} style={inputStyle}>
                    <option value="MCQ">MCQ</option>
                    <option value="TrueFalse">{text.trueFalse}</option>
                    <option value="ShortAnswer">{text.shortAnswer}</option>
                  </select>
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.marks}</div>
                  <input value={questionForm.marks} onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })} style={inputStyle} required />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.correctAnswer}</div>
                  <input value={questionForm.correct_answer} onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} style={inputStyle} required={questionForm.question_type !== 'MCQ'} />
                </div>

                {questionForm.question_type === 'MCQ' && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: 10 }}>{text.options}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: previewOptionsGrid, gap: 12 }}>
                      {questionForm.options.map((option, index) => (
                        <div key={index} style={{ ...cardBase, padding: 12 }}>
                          <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.option} {index + 1}</div>
                          <input value={option.option_text} onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)} style={inputStyle} required />
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, color: colors.textMuted, fontSize: 12, fontWeight: 'bold' }}>
                            <input type="radio" checked={option.is_correct} onChange={() => handleOptionChange(index, 'is_correct', true)} />
                            {text.correct}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={modalActionRowStyle}>
                <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, width: isNarrowMobile ? '100%' : 'auto' }} disabled={loading}>{loading ? '...' : text.saveChanges}</button>
                <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => setShowEditQuestion(false)}>{text.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditExam && selectedExam && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 5001, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? 10 : 16 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) setShowEditExam(false); }}
        >
          <div style={modalCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ color: colors.text, fontWeight: 'bold' }}>{text.editExam} - <span style={{ color: colors.textMuted }}>{selectedExam.title}</span></div>
              <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => setShowEditExam(false)}>{text.close}</button>
            </div>

            <form onSubmit={handleUpdateExam}>
              <div style={{ display: 'grid', gridTemplateColumns: twoColumnGrid, gap: 12 }}>
                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.title}</div>
                  <input value={editExamForm.title} onChange={(e) => setEditExamForm({ ...editExamForm, title: e.target.value })} style={inputStyle} required />
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.accessMode}</div>
                  <select
                    value={editExamForm.access_mode}
                    onChange={(e) => setEditExamForm({ ...editExamForm, access_mode: e.target.value, course_id: e.target.value === 'link' ? '' : editExamForm.course_id })}
                    style={inputStyle}
                    disabled={isIndependent}
                  >
                    <option value="link">{text.linkExam}</option>
                    {!isIndependent && <option value="department">{text.departmentExam}</option>}
                  </select>
                </div>

                {editExamForm.access_mode === 'department' && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.course}</div>
                    <select value={editExamForm.course_id} onChange={(e) => setEditExamForm({ ...editExamForm, course_id: e.target.value })} style={inputStyle} required disabled={courses.length === 0}>
                      {courses.length === 0 ? (
                        <option value="">{text.noCourses}</option>
                      ) : (
                          courses.map((course) => (
                            <option key={course.id} value={String(course.id)}>{formatCourseLabel(course)}</option>
                          ))
                      )}
                    </select>
                  </div>
                )}

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.duration}</div>
                  <input type="number" min="1" value={editExamForm.duration} onChange={(e) => setEditExamForm({ ...editExamForm, duration: e.target.value })} style={inputStyle} required />
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.totalMarks}</div>
                  <input type="number" min="1" value={editExamForm.total_marks} onChange={(e) => setEditExamForm({ ...editExamForm, total_marks: e.target.value })} style={inputStyle} required />
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.codeMode}</div>
                  <select
                    value={editExamForm.exam_code_mode}
                    onChange={(e) => setEditExamForm({ ...editExamForm, exam_code_mode: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="auto">{text.codeAuto}</option>
                    <option value="manual">{text.codeManual}</option>
                  </select>
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.examCode}</div>
                  <input
                    value={editExamForm.exam_code}
                    onChange={(e) => setEditExamForm({ ...editExamForm, exam_code: e.target.value })}
                    style={{ ...inputStyle, opacity: editExamForm.exam_code_mode === 'manual' ? 1 : 0.65 }}
                    required={editExamForm.exam_code_mode === 'manual'}
                    disabled={editExamForm.exam_code_mode !== 'manual'}
                    placeholder={editExamForm.exam_code_mode === 'manual' ? '' : text.codeAuto}
                  />
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.type}</div>
                  <input value={editExamForm.access_mode === 'link' ? text.linkExam : text.departmentExam} style={{ ...inputStyle, opacity: 0.8 }} readOnly />
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.startDate}</div>
                  <input type="datetime-local" value={editExamForm.start_date} onChange={(e) => setEditExamForm({ ...editExamForm, start_date: e.target.value })} style={inputStyle} required />
                </div>

                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.endDate}</div>
                  <input type="datetime-local" value={editExamForm.end_date} onChange={(e) => setEditExamForm({ ...editExamForm, end_date: e.target.value })} style={inputStyle} required />
                </div>

                <div style={{ gridColumn: '1 / -1', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, background: colors.cardBg2 }}>
                  <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>{text.randomizeQuestions}</div>
                  <div style={{ color: colors.textMuted, fontSize: 12, marginBottom: 12 }}>{text.randomizeHint}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: previewOptionsGrid, gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}>
                      <input type="checkbox" checked={Boolean(editExamForm.randomize_questions)} onChange={(e) => setEditExamForm({ ...editExamForm, randomize_questions: e.target.checked })} />
                      <span>{text.randomizeQuestions}</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}>
                      <input type="checkbox" checked={Boolean(editExamForm.randomize_options)} onChange={(e) => setEditExamForm({ ...editExamForm, randomize_options: e.target.checked })} />
                      <span>{text.randomizeOptions}</span>
                    </label>
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, background: colors.cardBg2 }}>
                  <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: 10 }}>{isAr ? 'إعدادات الأمان والسياسة' : 'Security & Policy Settings'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: previewOptionsGrid, gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}>
                      <input type="checkbox" checked={Boolean(editExamForm.proctoring_enabled)} onChange={(e) => setEditExamForm({ ...editExamForm, proctoring_enabled: e.target.checked })} />
                      <span>{text.proctoringEnabled}</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}>
                      <input type="checkbox" checked={Boolean(editExamForm.screen_capture_protection)} onChange={(e) => setEditExamForm({ ...editExamForm, screen_capture_protection: e.target.checked })} />
                      <span>{text.screenCaptureProtection}</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}>
                      <input type="checkbox" checked={Boolean(editExamForm.is_demo_exam)} onChange={(e) => setEditExamForm({ ...editExamForm, is_demo_exam: e.target.checked })} />
                      <span>{text.demoExam}</span>
                    </label>
                    <div>
                      <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.maxAttempts}</div>
                      <input type="number" min="1" value={editExamForm.max_attempts_per_student} onChange={(e) => setEditExamForm({ ...editExamForm, max_attempts_per_student: e.target.value })} style={inputStyle} required />
                    </div>
                    <div>
                      <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.postEndVisibility}</div>
                      <select value={editExamForm.post_end_visibility_mode} onChange={(e) => setEditExamForm({ ...editExamForm, post_end_visibility_mode: e.target.value })} style={inputStyle}>
                        <option value="hide">{text.hideAfterEnd}</option>
                        <option value="archive">{text.archiveAfterEnd}</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.postEndGraceMinutes}</div>
                      <input type="number" min="0" value={editExamForm.post_end_grace_minutes} onChange={(e) => setEditExamForm({ ...editExamForm, post_end_grace_minutes: e.target.value })} style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={modalActionRowStyle}>
                <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, width: isNarrowMobile ? '100%' : 'auto' }} disabled={loading}>{loading ? '...' : text.saveChanges}</button>
                <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => setShowEditExam(false)}>{text.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewAttempt && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 5002, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? 10 : 16 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) setReviewAttempt(null); }}
        >
          <div style={{ ...modalCardStyle, width: isNarrowMobile ? '100%' : 'min(980px, 96vw)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{text.reviewAttempt}</div>
                <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                  {reviewAttempt.student_name} - {reviewAttempt.exam_title}
                </div>
              </div>
              <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => setReviewAttempt(null)}>{text.close}</button>
            </div>

            {Array.isArray(reviewAttempt.answers) && reviewAttempt.answers.filter((answer) => ['ESSAY', 'SHORTANSWER', 'WRITTEN'].includes(String(answer.question_type || '').toUpperCase())).length > 0 ? (
              <div style={{ display: 'grid', gap: 14 }}>
                {reviewAttempt.answers
                  .filter((answer) => ['ESSAY', 'SHORTANSWER', 'WRITTEN'].includes(String(answer.question_type || '').toUpperCase()))
                  .map((answer, index) => (
                    <div key={answer.answer_id} style={{ ...cardBase, padding: 14, boxShadow: 'none', background: colors.cardBg2 }}>
                      <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8 }}>{`${text.questionNumber} ${index + 1}`}</div>
                      <div style={{ color: colors.text, lineHeight: 1.9, marginBottom: 10 }}>{answer.question_text}</div>
                      <div style={{ color: colors.textMuted, fontSize: 13, marginBottom: 10 }}>
                        <strong style={{ color: colors.text }}>{text.studentAnswer}:</strong> {answer.text_answer || '-'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '180px 1fr', gap: 12 }}>
                        <div>
                          <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.awardedMarks}</div>
                          <input
                            type="number"
                            min="0"
                            max={answer.marks}
                            value={answer.awarded_marks ?? ''}
                            onChange={(e) => updateReviewAnswer(answer.answer_id, { awarded_marks: e.target.value })}
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>{text.reviewFeedback}</div>
                          <textarea
                            value={answer.review_feedback || ''}
                            onChange={(e) => updateReviewAnswer(answer.answer_id, { review_feedback: e.target.value })}
                            style={{ ...inputStyle, minHeight: 88, resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{ ...cardBase, padding: 16, color: colors.textMuted }}>{text.noEssayAnswers}</div>
            )}

            <div style={modalActionRowStyle}>
              <button type="button" style={{ ...btnPrimary, opacity: reviewSaving ? 0.7 : 1, width: isNarrowMobile ? '100%' : 'auto' }} disabled={reviewSaving} onClick={saveAttemptReview}>
                {reviewSaving ? '...' : text.saveChanges}
              </button>
              <button type="button" style={{ ...btnSecondary, width: isNarrowMobile ? '100%' : 'auto' }} onClick={() => setReviewAttempt(null)}>{text.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DoctorDashboard;





