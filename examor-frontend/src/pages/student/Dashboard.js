import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/DashboardLayout';

function StudentDashboard() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const isAr = i18n.language === 'ar';
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

  const text = useMemo(
    () => ({
      welcome: isAr ? '\u0645\u0631\u062d\u0628\u0627' : 'Welcome',
      student: isAr ? '\u0627\u0644\u0637\u0627\u0644\u0628' : 'Student',
      availableExams: isAr ? '\u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629' : 'Available Exams',
      myResults: isAr ? '\u0646\u062a\u0627\u0626\u062c\u064a' : 'My Results',
      profile: isAr ? '\u0627\u0644\u062d\u0633\u0627\u0628' : 'Profile',
      joinByCode: isAr ? '\u0627\u0644\u0627\u0646\u0636\u0645\u0627\u0645 \u0628\u0627\u0644\u0643\u0648\u062f' : 'Join by Code',
      joinCodePlaceholder: isAr ? '\u0623\u062f\u062e\u0644 \u0643\u0648\u062f \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Enter exam code',
      joinExam: isAr ? '\u0627\u062f\u062e\u0644 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Join Exam',
      linkOnlyHint: isAr ? '\u0647\u0630\u0627 \u062d\u0633\u0627\u0628 \u0639\u0627\u0645. \u064a\u0645\u0643\u0646\u0643 \u062f\u062e\u0648\u0644 \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0627\u0644\u0631\u0627\u0628\u0637 \u0628\u0627\u0644\u0643\u0648\u062f \u0623\u0648 \u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u0642\u0637.' : 'This is a general student account. You can join link-based exams by code or direct link only.',
      academicHint: isAr ? '\u064a\u0645\u0643\u0646\u0643 \u0631\u0624\u064a\u0629 \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a\u0643 \u0627\u0644\u0623\u0643\u0627\u062f\u064a\u0645\u064a\u0629\u060c \u0648\u0623\u064a\u0636\u064b\u0627 \u062f\u062e\u0648\u0644 \u0623\u064a \u0627\u0645\u062a\u062d\u0627\u0646 \u0631\u0627\u0628\u0637 \u0628\u0627\u0644\u0643\u0648\u062f.' : 'You can view your academic exams and also join any link-based exam by code.',
      academicType: isAr ? '\u062d\u0633\u0627\u0628 \u0623\u0643\u0627\u062f\u064a\u0645\u064a' : 'Academic Account',
      generalType: isAr ? '\u062d\u0633\u0627\u0628 \u0639\u0627\u0645' : 'General Account',
      academicProfile: isAr ? '\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0623\u0643\u0627\u062f\u064a\u0645\u064a' : 'Academic Profile',
      accountOverview: isAr ? '\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629 \u0639\u0644\u0649 \u062d\u0633\u0627\u0628\u0643' : 'Account Overview',
      accountAccess: isAr ? '\u0622\u0644\u064a\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a' : 'Exam Access',
      university: isAr ? '\u0627\u0644\u062c\u0627\u0645\u0639\u0629' : 'University',
      branch: isAr ? '\u0627\u0644\u0641\u0631\u0639' : 'Branch',
      faculty: isAr ? '\u0627\u0644\u0643\u0644\u064a\u0629' : 'Faculty',
      department: isAr ? '\u0627\u0644\u0642\u0633\u0645' : 'Department',
      academicYear: isAr ? '\u0627\u0644\u0641\u0631\u0642\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629' : 'Academic Year',
      course: isAr ? '\u0627\u0644\u0645\u0627\u062f\u0629' : 'Course',
      linkedDepartment: isAr ? '\u0647\u0630\u0627 \u0627\u0644\u062d\u0633\u0627\u0628 \u0645\u0631\u062a\u0628\u0637 \u0628\u0645\u0644\u0641 \u0623\u0643\u0627\u062f\u064a\u0645\u064a\u060c \u0644\u0630\u0644\u0643 \u062a\u0638\u0647\u0631 \u0644\u0643 \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a\u0643 \u0627\u0644\u0623\u0643\u0627\u062f\u064a\u0645\u064a\u0629 \u0625\u0644\u0649 \u062c\u0627\u0646\u0628 \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0627\u0644\u0631\u0627\u0628\u0637.' : 'This account is linked to an academic profile, so your academic exams appear alongside link-based exams.',
      joinOnly: isAr ? '\u0647\u0630\u0627 \u0627\u0644\u062d\u0633\u0627\u0628 \u063a\u064a\u0631 \u0645\u0631\u062a\u0628\u0637 \u0628\u0642\u0633\u0645 \u0623\u0643\u0627\u062f\u064a\u0645\u064a\u060c \u0644\u0630\u0644\u0643 \u0633\u062a\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0627\u0644\u0643\u0648\u062f \u0623\u0648 \u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u0642\u0637.' : 'This account is not linked to an academic department, so you will use code or link access only.',
      searchPlaceholder: isAr ? '\u0627\u0628\u062d\u062b \u0628\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0623\u0648 \u0643\u0648\u062f \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646...' : 'Search by title or code...',
      sortBy: isAr ? '\u0627\u0644\u062a\u0631\u062a\u064a\u0628 \u062d\u0633\u0628' : 'Sort by',
      allStatuses: isAr ? '\u0643\u0644 \u0627\u0644\u062d\u0627\u0644\u0627\u062a' : 'All statuses',
      filterStatus: isAr ? '\u0627\u0644\u062d\u0627\u0644\u0629' : 'Status',
      byId: 'ID',
      byName: isAr ? '\u0627\u0644\u0627\u0633\u0645' : 'Name',
      byNewest: isAr ? '\u0627\u0644\u0623\u062d\u062f\u062b' : 'Newest',
      duration: isAr ? '\u062f\u0642\u064a\u0642\u0629' : 'min',
      marks: isAr ? '\u062f\u0631\u062c\u0629' : 'marks',
      start: isAr ? '\u0627\u0644\u0628\u062f\u0627\u064a\u0629' : 'Start',
      end: isAr ? '\u0627\u0644\u0646\u0647\u0627\u064a\u0629' : 'End',
      startExam: isAr ? '\u0627\u0628\u062f\u0623 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Start Exam',
      continueExam: isAr ? '\u0627\u0633\u062a\u0643\u0645\u0644 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Continue Exam',
      completed: isAr ? '\u0645\u0643\u062a\u0645\u0644' : 'Completed',
      upcoming: isAr ? '\u0642\u0627\u062f\u0645' : 'Upcoming',
      active: isAr ? '\u0645\u062a\u0627\u062d \u0627\u0644\u0622\u0646' : 'Active',
      inProgress: isAr ? '\u0642\u064a\u062f \u0627\u0644\u0627\u0633\u062a\u0643\u0645\u0627\u0644' : 'In Progress',
      starting: isAr ? '\u062c\u0627\u0631\u064d \u0627\u0644\u0641\u062a\u062d...' : 'Opening...',
      noExams: isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627.' : 'No exams available.',
      openError: isAr ? '\u062a\u0639\u0630\u0631 \u0641\u062a\u062d \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0627\u0644\u0622\u0646.' : 'Unable to open this exam right now.',
    }),
    [isAr]
  );

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const hasDepartment = Boolean(user?.department_id);
  const isAcademicProfile = String(user?.profile_mode || '').toLowerCase() === 'academic' || hasDepartment;

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadingCode, setLoadingCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = viewportWidth <= 1024;
  const isMobile = viewportWidth <= 640;
  const isNarrowMobile = viewportWidth <= 430;

  useEffect(() => {
    if (!user?.id) return;
    fetchExams();
  }, [user?.id]);

  const fetchExams = async () => {
    setLoadingExams(true);
    setLoadError('');
    try {
      const res = await API.get('/student/exams');
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const demoPrefix = user?.id ? `DEMO-STUDENT-${user.id}-` : null;
      const filtered = data.filter((exam) => {
        const isDemo = Number(exam?.is_demo_exam || 0) === 1;
        if (!isDemo) return true;
        if (!demoPrefix) return false;
        return typeof exam.exam_code === 'string' && exam.exam_code.startsWith(demoPrefix);
      });
      setExams(filtered);
    } catch (err) {
      console.error(err);
      setLoadError(text.openError);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleStartExam = async (code) => {
    setLoadingCode(code);
    try {
      navigate(`/student/exam/${code}`);
    } catch (err) {
      setLoadError(err.response?.data?.message || text.openError);
    } finally {
      setLoadingCode('');
    }
  };

  const filteredExams = useMemo(() => {
    const query = searchCode.trim().toLowerCase();
    const next = exams.filter((exam) => {
      const matchesQuery = !query || `${exam.title || ''} ${exam.exam_code || ''} ${exam.course_name || ''} ${exam.level || ''} ${exam.department_name || ''} ${exam.faculty_name || ''} ${exam.branch_name || ''} ${exam.university_name || ''}`.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    const getNewest = (exam) => new Date(exam.start_date || 0).getTime() || Number(exam.id || 0);

    if (sortBy === 'id') {
      return [...next].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
    }

    if (sortBy === 'name') {
      return [...next].sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    }

    return [...next].sort((a, b) => getNewest(b) - getNewest(a));
  }, [exams, searchCode, sortBy, statusFilter]);

  const navItems = useMemo(
    () => [
      { key: 'exams', label: text.availableExams, active: window.location.pathname === '/student', onClick: () => navigate('/student') },
      { key: 'results', label: text.myResults, active: window.location.pathname === '/student/results', onClick: () => navigate('/student/results') },
      { key: 'profile', label: text.profile, active: window.location.pathname === '/student/profile', onClick: () => navigate('/student/profile') },
    ],
    [navigate, text.availableExams, text.myResults, text.profile]
  );

  const cardBase = {
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    boxShadow: colors.shadow,
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'completed':
        return { label: text.completed, bg: 'rgba(30,107,62,.15)', fg: '#86efac' };
      case 'in_progress':
        return { label: text.inProgress, bg: 'rgba(44,62,107,.15)', fg: isDark ? '#b7cdf1' : '#2C3E6B' };
      case 'upcoming':
        return { label: text.upcoming, bg: 'rgba(230,126,34,.15)', fg: '#f5c08a' };
      default:
        return { label: text.active, bg: isDark ? 'rgba(201,168,130,.12)' : 'rgba(139,107,74,.10)', fg: colors.accent };
    }
  };

  const getActionMeta = (exam) => {
    if (exam.status === 'completed') return { label: text.completed, disabled: true };
    if (exam.status === 'upcoming') return { label: text.upcoming, disabled: true };
    if (exam.status === 'in_progress') return { label: text.continueExam, disabled: false };
    return { label: text.startExam, disabled: false };
  };

  return (
    <DashboardLayout navItems={navItems} interactiveNav>
      <div style={{ marginBottom: isMobile ? 14 : 18, color: colors.textMuted, fontSize: isNarrowMobile ? 12 : 13 }}>
        {user?.name ? `${text.welcome}\u060c ${user.name}` : text.student}
      </div>

      <div style={{ ...cardBase, padding: isNarrowMobile ? 14 : isMobile ? 16 : 18, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: colors.text, fontSize: isNarrowMobile ? 15 : 17, fontWeight: 'bold', marginBottom: 6 }}>
              {isAcademicProfile ? text.academicProfile : text.accountOverview}
            </div>
            <div style={{ color: colors.textMuted, fontSize: isNarrowMobile ? 11 : 12, lineHeight: 1.8 }}>
              {isAcademicProfile ? text.linkedDepartment : text.joinOnly}
            </div>
          </div>
          <span style={{ backgroundColor: isAcademicProfile ? 'rgba(30,107,62,.15)' : 'rgba(44,62,107,.15)', color: isAcademicProfile ? '#86efac' : (isDark ? '#b7cdf1' : '#2C3E6B'), padding: isNarrowMobile ? '5px 10px' : '6px 12px', borderRadius: 999, fontSize: isNarrowMobile ? 11 : 12, fontWeight: 'bold', border: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>
            {isAcademicProfile ? text.academicType : text.generalType}
          </span>
        </div>
        {isAcademicProfile && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(auto-fit, minmax(210px, 1fr))`, gap: 12, marginBottom: 14 }}>
            {[
              [text.university, user?.university_name || '-'],
              [text.branch, user?.branch_name || '-'],
              [text.faculty, user?.faculty_name || '-'],
              [text.department, user?.department_name || '-'],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: isNarrowMobile ? '11px 12px' : '12px 14px',
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
                <div style={{ color: colors.textMuted, fontSize: isNarrowMobile ? 10 : 11, marginBottom: 4 }}>{label}</div>
                <div style={{ color: colors.text, fontSize: isNarrowMobile ? 12 : 13, fontWeight: 'bold', lineHeight: 1.6 }}>{value}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ padding: isNarrowMobile ? '11px 12px' : '12px 14px', borderRadius: 12, backgroundColor: isDark ? 'rgba(201,168,130,.08)' : 'rgba(139,107,74,.06)', border: `1px solid ${colors.border}` }}>
          <div style={{ color: colors.text, fontSize: isNarrowMobile ? 12 : 13, fontWeight: 'bold', marginBottom: 6 }}>
            {text.accountAccess}
          </div>
          <div style={{ color: colors.textMuted, fontSize: isNarrowMobile ? 12 : 13, lineHeight: 1.9 }}>
            {isAcademicProfile ? text.academicHint : text.linkOnlyHint}
          </div>
        </div>
      </div>

      {loadError && (
        <div style={{ ...cardBase, padding: 14, marginBottom: 14, borderColor: colors.errorBorder, color: colors.errorText }}>
          {loadError}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ color: colors.text, fontSize: isNarrowMobile ? 20 : 22, margin: 0 }}>{text.availableExams}</h2>
        {isAcademicProfile && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%', flexDirection: isMobile ? 'column' : 'row' }}>
            <input
              type="text"
              placeholder={text.searchPlaceholder}
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.inputText, fontSize: 13, minWidth: '100%', width: '100%', flex: '1 1 100%', outline: 'none', boxSizing: 'border-box' }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.inputText, fontSize: 13, minWidth: isMobile ? '100%' : 150, width: isMobile ? '100%' : 'auto', flex: isMobile ? '1 1 100%' : '0 0 auto', outline: 'none', boxSizing: 'border-box' }}
            >
              <option value="all">{text.allStatuses}</option>
              <option value="upcoming">{text.upcoming}</option>
              <option value="active">{text.active}</option>
              <option value="in_progress">{text.inProgress}</option>
              <option value="completed">{text.completed}</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.inputText, fontSize: 13, minWidth: isMobile ? '100%' : 150, width: isMobile ? '100%' : 'auto', flex: isMobile ? '1 1 100%' : '0 0 auto', outline: 'none', boxSizing: 'border-box' }}
            >
              <option value="newest">{`${text.sortBy}: ${text.byNewest}`}</option>
              <option value="name">{`${text.sortBy}: ${text.byName}`}</option>
              <option value="id">{`${text.sortBy}: ${text.byId}`}</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ ...cardBase, padding: isNarrowMobile ? 14 : 16, marginBottom: 14 }}>
        <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: 10 }}>{text.joinByCode}</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder={text.joinCodePlaceholder}
            style={{ flex: 1, minWidth: isMobile ? '100%' : 220, width: isMobile ? '100%' : 'auto', padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.inputText, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            type="button"
            style={{ padding: '10px 14px', width: isNarrowMobile ? '100%' : 'auto', backgroundColor: colors.btnPrimary, color: colors.btnPrimaryTxt, border: 'none', borderRadius: 12, cursor: joinCode.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 'bold', opacity: joinCode.trim() ? 1 : 0.7 }}
            disabled={!joinCode.trim()}
            onClick={() => handleStartExam(joinCode.trim())}
          >
            {text.joinExam}
          </button>
        </div>
      </div>

      <>
        {loadingExams && (
          <div style={{ ...cardBase, padding: 16, color: colors.textMuted, marginBottom: 12 }}>
            {text.starting}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(auto-fill, minmax(${isTablet ? 240 : 280}px, 1fr))`, gap: 14 }}>
          {filteredExams.map((exam) => {
            const isLoading = loadingCode === exam.exam_code;
            const statusMeta = getStatusMeta(exam.status);
            const actionMeta = getActionMeta(exam);

            return (
              <div key={exam.id} style={{ ...cardBase, padding: isNarrowMobile ? 14 : 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isNarrowMobile ? 'flex-start' : 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: isDark ? 'rgba(201,168,130,.12)' : 'rgba(139,107,74,.10)', color: colors.accent, padding: '4px 10px', borderRadius: 999, fontSize: isNarrowMobile ? 11 : 12, fontWeight: 'bold', border: `1px solid ${isDark ? 'rgba(201,168,130,.18)' : 'rgba(139,107,74,.22)'}` }}>
                    {exam.course_name}
                  </span>
                  <span style={{ backgroundColor: isDark ? 'rgba(255,255,255,.05)' : colors.cardBg2, color: colors.textMuted, padding: '4px 10px', borderRadius: 10, fontSize: isNarrowMobile ? 11 : 12, border: `1px solid ${colors.border}` }}>
                    {exam.exam_code}
                  </span>
                </div>

                <div style={{ alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 999, fontSize: isNarrowMobile ? 11 : 12, fontWeight: 'bold', backgroundColor: statusMeta.bg, color: statusMeta.fg, border: `1px solid ${colors.border}` }}>
                  {statusMeta.label}
                </div>

                <h3 style={{ color: colors.text, fontSize: 15, margin: 0, fontWeight: 'bold' }}>{exam.title}</h3>

                <div style={{ display: 'flex', gap: 14, color: colors.textMuted, fontSize: 12, flexWrap: 'wrap' }}>
                  <span>{exam.duration} {text.duration}</span>
                  <span>{exam.total_marks} {text.marks}</span>
                </div>

                <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 10 }}>
                  <div style={{ color: colors.textMuted, fontSize: 12, margin: '2px 0' }}>
                    {text.course}: {exam.course_name || '-'}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: 12, margin: '2px 0' }}>
                    {text.academicYear}: {exam.level || '-'}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: 12, margin: '2px 0' }}>
                    {text.department}: {exam.department_name || '-'}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: 12, margin: '2px 0' }}>
                    {text.faculty}: {exam.faculty_name || '-'}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: 12, margin: '2px 0' }}>
                    {text.branch}: {exam.branch_name || '-'}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: 12, margin: '2px 0' }}>
                    {text.university}: {exam.university_name || '-'}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: 12, margin: '2px 0' }}>
                    {text.start}: {exam.start_date ? new Date(exam.start_date).toLocaleString(isAr ? 'ar-EG' : 'en-US') : '-'}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: 12, margin: '2px 0' }}>
                    {text.end}: {exam.end_date ? new Date(exam.end_date).toLocaleString(isAr ? 'ar-EG' : 'en-US') : '-'}
                  </div>
                </div>

                <button
                  style={{ marginTop: 'auto', padding: '10px 12px', width: isNarrowMobile ? '100%' : 'auto', backgroundColor: colors.btnPrimary, color: colors.btnPrimaryTxt, border: 'none', borderRadius: 12, cursor: isLoading || actionMeta.disabled ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 'bold', opacity: isLoading || actionMeta.disabled ? 0.75 : 1 }}
                  onClick={() => handleStartExam(exam.exam_code)}
                  disabled={Boolean(loadingCode) || actionMeta.disabled}
                >
                  {isLoading ? text.starting : actionMeta.label}
                </button>
              </div>
            );
          })}
        </div>

        {filteredExams.length === 0 && (
          <div style={{ ...cardBase, textAlign: 'center', color: colors.textMuted, padding: 30, marginTop: 14 }}>
            {text.noExams}
          </div>
        )}
      </>
    </DashboardLayout>
  );
}

export default StudentDashboard;
