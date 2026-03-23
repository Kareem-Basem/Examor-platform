import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/DashboardLayout';

function Results() {
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
      loading: isAr ? '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644...' : 'Loading...',
      noResults: isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c \u0628\u0639\u062f. \u0627\u0628\u062f\u0623 \u0627\u0645\u062a\u062d\u0627\u0646\u0627 \u0623\u0648\u0644\u0627.' : 'No results yet. Start an exam first!',
      goToExams: isAr ? '\u0627\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a' : 'Go to Exams',
      examsTaken: isAr ? '\u0639\u062f\u062f \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a' : 'Exams Taken',
      averageScore: isAr ? '\u0645\u062a\u0648\u0633\u0637 \u0627\u0644\u062f\u0631\u062c\u0629' : 'Average Score',
      bestScore: isAr ? '\u0623\u0641\u0636\u0644 \u062f\u0631\u062c\u0629' : 'Best Score',
      exam: isAr ? '\u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646' : 'Exam',
      course: isAr ? '\u0627\u0644\u0645\u0627\u062f\u0629' : 'Course',
      academicYear: isAr ? '\u0627\u0644\u0641\u0631\u0642\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629' : 'Academic Year',
      university: isAr ? '\u0627\u0644\u062c\u0627\u0645\u0639\u0629' : 'University',
      branch: isAr ? '\u0627\u0644\u0641\u0631\u0639' : 'Branch',
      faculty: isAr ? '\u0627\u0644\u0643\u0644\u064a\u0629' : 'Faculty',
      department: isAr ? '\u0627\u0644\u0642\u0633\u0645' : 'Department',
      score: isAr ? '\u0627\u0644\u062f\u0631\u062c\u0629' : 'Score',
      total: isAr ? '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a' : 'Total',
      percentage: isAr ? '\u0627\u0644\u0646\u0633\u0628\u0629' : 'Percentage',
      status: isAr ? '\u0627\u0644\u062d\u0627\u0644\u0629' : 'Status',
      violations: isAr ? '\u0627\u0644\u0645\u062e\u0627\u0644\u0641\u0627\u062a' : 'Violations',
      details: isAr ? '\u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644' : 'Details',
      terminated: isAr ? '\u0625\u0646\u0647\u0627\u0621 \u0625\u062c\u0628\u0627\u0631\u064a' : 'Forced Submit',
      completed: isAr ? '\u062a\u0633\u0644\u064a\u0645 \u0639\u0627\u062f\u064a' : 'Normal Submit',
      pendingReview: isAr ? '\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629' : 'Pending Review',
      date: isAr ? '\u0627\u0644\u062a\u0627\u0631\u064a\u062e' : 'Date',
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

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = viewportWidth <= 1024;
  const isMobile = viewportWidth <= 640;
  const isNarrowMobile = viewportWidth <= 430;

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await API.get('/student/results');
      setResults(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navItems = useMemo(
    () => [
      { key: 'exams', label: text.availableExams, active: window.location.pathname === '/student', onClick: () => navigate('/student') },
      { key: 'results', label: text.myResults, active: window.location.pathname === '/student/results', onClick: () => navigate('/student/results') },
    ],
    [navigate, text.availableExams, text.myResults]
  );

  const cardBase = {
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    boxShadow: colors.shadow,
  };

  const tableRowBg = (index) => {
    if (isDark) return index % 2 === 0 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)';
    return index % 2 === 0 ? '#fff' : '#FBF9F6';
  };

  const tableBase = {
    width: '100%',
    minWidth: isMobile ? 860 : isTablet ? 980 : '100%',
    borderCollapse: 'collapse',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    overflow: 'hidden',
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
  };

  const thStyle = {
    backgroundColor: colors.cardBg2,
    color: colors.text,
    padding: '12px 12px',
    textAlign: 'left',
    fontSize: 13,
    borderBottom: `1px solid ${colors.border}`,
  };

  const tdStyle = {
    padding: '12px 12px',
    fontSize: 13,
    color: colors.textMuted,
    borderBottom: `1px solid ${colors.border}`,
  };

  const avg = results.length ? (results.reduce((sum, result) => sum + parseFloat(result.percentage), 0) / results.length).toFixed(1) : '0.0';
  const best = results.length ? Math.max(...results.map((result) => parseFloat(result.percentage))).toFixed(1) : '0.0';
  const summaryValueStyle = (color) => ({ color, fontSize: isNarrowMobile ? 24 : isMobile ? 26 : 30, margin: 0, fontWeight: 'bold' });

  return (
    <DashboardLayout navItems={navItems} interactiveNav>
      <div style={{ marginBottom: isMobile ? 14 : 18, color: colors.textMuted, fontSize: 13 }}>
        {user?.name ? `${text.welcome}\u060c ${user.name}` : text.student}
      </div>
      <h2 style={{ color: colors.text, fontSize: isMobile ? 20 : 22, margin: `0 0 ${isMobile ? 12 : 16}px 0` }}>{text.myResults}</h2>

      {loading ? (
        <div style={{ ...cardBase, padding: isMobile ? 14 : 18, color: colors.textMuted }}>{text.loading}</div>
      ) : results.length === 0 ? (
        <div style={{ ...cardBase, padding: 26, textAlign: 'center' }}>
          <div style={{ color: colors.textMuted, marginBottom: 10 }}>{text.noResults}</div>
          <button
            style={{ padding: '10px 16px', backgroundColor: colors.btnPrimary, color: colors.btnPrimaryTxt, border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' }}
            onClick={() => navigate('/student')}
          >
            {text.goToExams}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
            <div
              style={{ ...cardBase, padding: isMobile ? 14 : 18, textAlign: 'center', transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease', cursor: 'default' }}
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
              <div style={summaryValueStyle(colors.accent)}>{results.length}</div>
              <div style={{ color: colors.textMuted, marginTop: 6, fontSize: 13 }}>{text.examsTaken}</div>
            </div>
            <div
              style={{ ...cardBase, padding: isMobile ? 14 : 18, textAlign: 'center', transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease', cursor: 'default' }}
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
              <div style={summaryValueStyle('#4A8050')}>{avg}%</div>
              <div style={{ color: colors.textMuted, marginTop: 6, fontSize: 13 }}>{text.averageScore}</div>
            </div>
            <div
              style={{ ...cardBase, padding: isMobile ? 14 : 18, textAlign: 'center', transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease', cursor: 'default' }}
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
              <div style={summaryValueStyle(isDark ? '#4A6FA5' : '#2C3E6B')}>{best}%</div>
              <div style={{ color: colors.textMuted, marginTop: 6, fontSize: 13 }}>{text.bestScore}</div>
            </div>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', borderRadius: 14 }}>
            <table style={tableBase}>
              <thead>
                <tr>
                  {[text.exam, text.course, text.academicYear, text.department, text.faculty, text.branch, text.university, text.score, text.total, text.percentage, text.status, text.violations, text.details, text.date].map((header) => (
                    <th key={header} style={thStyle}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => {
                  const pct = parseFloat(result.percentage);
                  const tone =
                    pct >= 85
                      ? { fg: '#86efac', bg: 'rgba(30,107,62,.15)', border: colors.successBorder }
                      : pct >= 50
                        ? { fg: colors.accent, bg: isDark ? 'rgba(201,168,130,.12)' : 'rgba(139,107,74,.10)', border: isDark ? 'rgba(201,168,130,.22)' : 'rgba(139,107,74,.22)' }
                        : { fg: '#ffb4aa', bg: 'rgba(192,57,43,.15)', border: colors.errorBorder };

                  return (
                    <tr
                      key={index}
                      style={{ backgroundColor: tableRowBg(index), transition: 'background-color 180ms ease, transform 180ms ease' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(201,168,130,.10)' : '#F6EFE3';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = tableRowBg(index);
                      }}
                    >
                      <td style={{ ...tdStyle, color: colors.text, fontWeight: 'bold' }}>{result.exam_title}</td>
                      <td style={tdStyle}>{result.course_name}</td>
                      <td style={tdStyle}>{result.level || '-'}</td>
                      <td style={tdStyle}>{result.department_name || '-'}</td>
                      <td style={tdStyle}>{result.faculty_name || '-'}</td>
                      <td style={tdStyle}>{result.branch_name || '-'}</td>
                      <td style={tdStyle}>{result.university_name || '-'}</td>
                      <td style={tdStyle}>{result.score}</td>
                      <td style={tdStyle}>{result.total_marks}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '4px 10px', borderRadius: 999, color: tone.fg, backgroundColor: tone.bg, border: `1px solid ${tone.border}`, fontSize: 12, fontWeight: 'bold' }}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {result.status === 'Terminated'
                          ? text.terminated
                          : result.status === 'Pending Review'
                            ? text.pendingReview
                            : text.completed}
                      </td>
                      <td style={tdStyle}>{result.violations_count ?? 0}</td>
                      <td style={{ ...tdStyle, maxWidth: 260 }}>{result.violation_summary || '-'}</td>
                      <td style={tdStyle}>{result.submit_time ? new Date(result.submit_time).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Results;
