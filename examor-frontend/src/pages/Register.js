import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import ExamorShell from '../components/ExamorShell';
import ExamorTopbar from '../components/ExamorTopbar';

const resolveGoogleClientId = (runtimeClientId) =>
  String(
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    runtimeClientId ||
    window.__EXAMOR_GOOGLE_CLIENT_ID__ ||
    ''
  ).trim();

function Register() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [profileMode, setProfileMode] = useState('independent');
  const [universityId, setUniversityId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [universities, setUniversities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [runtimeGoogleClientId, setRuntimeGoogleClientId] = useState('');
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  const isRTL = i18n.language === 'ar';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  const showProfileMode = isTeacher || isStudent;
  const isMobile = viewportWidth <= 640;
  const isNarrowMobile = viewportWidth <= 430;
  const googleClientId = resolveGoogleClientId(runtimeGoogleClientId);
  const showGoogleButton = Boolean(googleClientId);

  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get('/auth/google-client');
        if (!cancelled) {
          setRuntimeGoogleClientId(String(res?.data?.client_id || '').trim());
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [uRes, bRes, fRes, dRes] = await Promise.all([
          API.get('/auth/institutions/universities'),
          API.get('/auth/institutions/branches'),
          API.get('/auth/institutions/faculties'),
          API.get('/auth/institutions/departments'),
        ]);
        if (cancelled) return;
        setUniversities(uRes.data?.data || []);
        setBranches(bRes.data?.data || []);
        setFaculties(fRes.data?.data || []);
        setDepartments(dRes.data?.data || []);
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (profileMode !== 'academic') {
      setUniversityId('');
      setBranchId('');
      setFacultyId('');
      setDepartmentId('');
    }
  }, [profileMode]);

  useEffect(() => {
    setBranchId('');
    setFacultyId('');
    setDepartmentId('');
  }, [universityId]);

  useEffect(() => {
    setFacultyId('');
    setDepartmentId('');
  }, [branchId]);

  useEffect(() => {
    setDepartmentId('');
  }, [facultyId]);

  const text = useMemo(
    () => ({
      teacherMode: isRTL ? '\u0637\u0631\u064a\u0642\u0629 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0645\u0646\u0635\u0629' : 'How will you use Examor?',
      studentMode: isRTL ? '\u0646\u0648\u0639 \u062d\u0633\u0627\u0628 \u0627\u0644\u0637\u0627\u0644\u0628' : 'Student account type',
      academic: isRTL ? '\u062f\u0643\u062a\u0648\u0631 \u0623\u0643\u0627\u062f\u064a\u0645\u064a' : 'Academic Teacher',
      academicDesc: isRTL ? '\u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0642\u0631\u0631\u0627\u062a \u0648\u0627\u0644\u0623\u0642\u0633\u0627\u0645.' : 'For department and course-based exams.',
      independent: isRTL ? '\u0645\u062f\u0631\u0633 \u0645\u0633\u062a\u0642\u0644' : 'Independent Teacher',
      independentDesc: isRTL ? '\u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0628\u0631\u0627\u0628\u0637 \u0623\u0648 \u0643\u0648\u062f \u0644\u0623\u064a \u0645\u062c\u0645\u0648\u0639\u0629.' : 'Create link-based exams for any group.',
      teacherHint: isRTL ? '\u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0628\u062f\u0621 \u0643\u0645\u062f\u0631\u0633 \u0645\u0633\u062a\u0642\u0644 \u0627\u0644\u0622\u0646\u060c \u062b\u0645 \u062a\u062d\u0648\u064a\u0644 \u062d\u0633\u0627\u0628\u0643 \u0644\u0644\u0646\u0645\u0637 \u0627\u0644\u0623\u0643\u0627\u062f\u064a\u0645\u064a \u0644\u0627\u062d\u0642\u064b\u0627.' : 'You can start as an independent teacher now and switch to academic mode later.',
      academicStudent: isRTL ? '\u0637\u0627\u0644\u0628 \u0623\u0643\u0627\u062f\u064a\u0645\u064a' : 'Academic Student',
      academicStudentDesc: isRTL ? '\u0644\u0644\u0627\u0646\u0636\u0645\u0627\u0645 \u0644\u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0627\u0644\u0642\u0633\u0645 \u0648\u0627\u0644\u0645\u0642\u0631\u0631\u0627\u062a.' : 'For department/course exams assigned to your university.',
      independentStudent: isRTL ? '\u0637\u0627\u0644\u0628 \u0645\u0633\u062a\u0642\u0644' : 'Independent Student',
      independentStudentDesc: isRTL ? '\u0644\u062f\u062e\u0648\u0644 \u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0627\u0644\u0631\u0627\u0628\u0637 \u0628\u0627\u0644\u0643\u0648\u062f \u0641\u0642\u0637.' : 'Join link-based exams by code only.',
      studentHint: isRTL ? '\u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0623\u0643\u0627\u062f\u064a\u0645\u064a \u064a\u062d\u062a\u0627\u062c \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0623\u062f\u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u062a\u0641\u0639\u064a\u0644.' : 'Academic student accounts require admin approval before activation.',
      university: isRTL ? '\u0627\u0644\u062c\u0627\u0645\u0639\u0629' : 'University',
      branch: isRTL ? '\u0627\u0644\u0641\u0631\u0639' : 'Branch',
      faculty: isRTL ? '\u0627\u0644\u0643\u0644\u064a\u0629' : 'Faculty',
      department: isRTL ? '\u0627\u0644\u0642\u0633\u0645' : 'Department',
      selectUniversity: isRTL ? '\u0627\u062e\u062a\u0631 \u0627\u0644\u062c\u0627\u0645\u0639\u0629' : 'Select university',
      selectBranch: isRTL ? '\u0627\u062e\u062a\u0631 \u0627\u0644\u0641\u0631\u0639' : 'Select branch',
      selectFaculty: isRTL ? '\u0627\u062e\u062a\u0631 \u0627\u0644\u0643\u0644\u064a\u0629' : 'Select faculty',
      selectDepartment: isRTL ? '\u0627\u062e\u062a\u0631 \u0627\u0644\u0642\u0633\u0645' : 'Select department',
    }),
    [isRTL]
  );

  const roles = useMemo(
    () => [
      { key: 'student', label: t('register.student') },
      { key: 'teacher', label: t('register.teacher') },
    ],
    [t]
  );

  const modeOptions = useMemo(() => {
    if (isTeacher) {
      return [
        { key: 'independent', title: text.independent, desc: text.independentDesc },
        { key: 'academic', title: text.academic, desc: text.academicDesc },
      ];
    }
    if (isStudent) {
      return [
        { key: 'independent', title: text.independentStudent, desc: text.independentStudentDesc },
        { key: 'academic', title: text.academicStudent, desc: text.academicStudentDesc },
      ];
    }
    return [];
  }, [isTeacher, isStudent, text]);

  const filteredBranches = useMemo(() => (
    universityId
      ? branches.filter((branch) => String(branch.university_id) === String(universityId))
      : branches
  ), [branches, universityId]);

  const hasFaculties = faculties.length > 0;

  const filteredFaculties = useMemo(() => (
    branchId
      ? faculties.filter((faculty) => String(faculty.branch_id) === String(branchId))
      : faculties
  ), [faculties, branchId]);

  const filteredDepartments = useMemo(() => {
    let list = departments;
    if (facultyId) {
      list = list.filter((dept) => String(dept.faculty_id || '') === String(facultyId));
    } else if (branchId) {
      list = list.filter((dept) => String(dept.branch_id) === String(branchId));
    } else if (universityId) {
      const branchIds = new Set(filteredBranches.map((branch) => String(branch.id)));
      list = list.filter((dept) => branchIds.has(String(dept.branch_id)));
    }
    return list;
  }, [departments, facultyId, branchId, universityId, filteredBranches]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (showProfileMode && profileMode === 'academic' && !departmentId) {
        setError(isRTL ? 'يرجى اختيار القسم للملف الأكاديمي' : 'Please select a department for academic accounts');
        setLoading(false);
        return;
      }

      await API.post('/auth/register', {
        name,
        email,
        password,
        role,
        ...(showProfileMode ? { profile_mode: profileMode } : {}),
        ...(profileMode === 'academic'
          ? {
              university_id: universityId ? Number(universityId) : null,
              department_id: departmentId ? Number(departmentId) : null,
            }
          : {}),
      });
      setSuccess(t('register.success'));
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    if (!credential) return;
    setError('');
    setSuccess('');
    setGoogleLoading(true);
    try {
      const res = await API.post('/auth/google', {
        credential,
        role,
        ...(showProfileMode ? { profile_mode: profileMode } : {})
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('user', JSON.stringify(user));

      const isAcademicPending = ['teacher', 'doctor', 'student'].includes(user?.role)
        && String(user?.profile_mode || '').toLowerCase() === 'academic'
        && !user?.academic_verified;

      if (user.role === 'admin') navigate('/admin');
      if (user.role === 'teacher') navigate(isAcademicPending ? '/doctor/profile?pending=1' : '/doctor');
      if (user.role === 'student') navigate(isAcademicPending ? '/student/profile?pending=1' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || (isRTL ? 'فشل التسجيل عبر Google' : 'Google sign-up failed'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    if (!googleClientId) {
      setError(isRTL ? 'Google Client ID غير مضبوط في إعدادات الواجهة' : 'Google Client ID is not configured. Set GOOGLE_CLIENT_ID (backend) or REACT_APP_GOOGLE_CLIENT_ID (frontend) and restart.');
      return;
    }

    if (!window.google?.accounts?.id) {
      setError(isRTL ? 'Google Sign-In غير متاح حالياً' : 'Google Sign-In is unavailable');
      return;
    }

    setError('');
    setSuccess('');
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => handleGoogleCredential(response?.credential),
      auto_select: false,
      cancel_on_tap_outside: true
    });
    window.google.accounts.id.prompt();
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '10px',
    fontSize: '14px',
    color: colors.inputText,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <ExamorShell style={{ display: 'flex', flexDirection: 'column' }}>
      <ExamorTopbar />
      <div style={{ flex: 1, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isNarrowMobile ? '16px 10px 24px' : isMobile ? '22px 12px 28px' : '34px 18px' }}>
        <div
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: '16px',
            padding: isNarrowMobile ? '22px 16px' : isMobile ? '28px 22px' : '40px 36px',
            width: '100%',
            maxWidth: '560px',
            border: `1px solid ${colors.border}`,
            boxShadow: colors.shadow,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '20px' : '28px', direction: 'ltr' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: colors.logoDot, borderRadius: '50%' }} />
            <span style={{ fontSize: isNarrowMobile ? '18px' : isMobile ? '20px' : '22px', fontWeight: 'bold', color: colors.logoText, letterSpacing: isNarrowMobile ? '2px' : '3px' }}>EXAMOR</span>
          </div>

          <h2 style={{ fontSize: isNarrowMobile ? '21px' : isMobile ? '22px' : '24px', fontWeight: 'bold', color: colors.text, margin: '0 0 6px 0' }}>{t('register.title')}</h2>
          <p style={{ fontSize: isNarrowMobile ? '13px' : '14px', color: colors.textMuted, margin: '0 0 20px 0' }}>{t('register.subtitle')}</p>

          <div style={{ display: 'flex', flexDirection: isNarrowMobile ? 'column' : 'row', gap: '8px', marginBottom: '24px' }}>
            {roles.map((item) => {
              const active = role === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRole(item.key)}
                  style={{
                    flex: 1,
                    padding: '10px 6px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: active ? colors.btnPrimary : colors.btnSecondary,
                    color: active ? colors.btnPrimaryTxt : colors.btnSecTxt,
                    border: active ? 'none' : `1px solid ${colors.border}`,
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {showProfileMode && (
            <div
              style={{
                marginBottom: 22,
                padding: 16,
                borderRadius: 14,
                background: isDark ? 'rgba(255,255,255,.03)' : colors.cardBg2,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ color: colors.text, fontWeight: 'bold', marginBottom: 10 }}>
                {isTeacher ? text.teacherMode : text.studentMode}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                {modeOptions.map((mode) => {
                  const active = profileMode === mode.key;
                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setProfileMode(mode.key)}
                      style={{
                        textAlign: isRTL ? 'right' : 'left',
                        padding: 14,
                        borderRadius: 12,
                        cursor: 'pointer',
                        background: active ? colors.btnPrimary : colors.cardBg,
                        color: active ? colors.btnPrimaryTxt : colors.text,
                        border: active ? 'none' : `1px solid ${colors.border}`,
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{mode.title}</div>
                      <div style={{ fontSize: 12, lineHeight: 1.7, color: active ? colors.btnPrimaryTxt : colors.textMuted }}>{mode.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ color: colors.textMuted, fontSize: 12, marginTop: 10 }}>
                {isTeacher ? text.teacherHint : text.studentHint}
              </div>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.textMuted, marginBottom: '6px' }}>{t('register.name')}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('register.name')} style={inputStyle} required />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.textMuted, marginBottom: '6px' }}>{t('register.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" style={inputStyle} required />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.textMuted, marginBottom: '6px' }}>{t('register.password')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" style={inputStyle} required />
            </div>

            {showProfileMode && profileMode === 'academic' && (
              <div style={{ marginBottom: '18px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.textMuted, marginBottom: '6px' }}>{text.university}</label>
                  <select
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">{text.selectUniversity}</option>
                    {universities.map((uni) => (
                      <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.textMuted, marginBottom: '6px' }}>{text.branch}</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    style={inputStyle}
                    disabled={!universityId}
                  >
                    <option value="">{text.selectBranch}</option>
                    {filteredBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
                {hasFaculties && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.textMuted, marginBottom: '6px' }}>{text.faculty}</label>
                    <select
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      style={inputStyle}
                      disabled={!branchId}
                    >
                      <option value="">{text.selectFaculty}</option>
                      {filteredFaculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.textMuted, marginBottom: '6px' }}>{text.department}</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    style={inputStyle}
                    disabled={hasFaculties ? !facultyId : !branchId}
                  >
                    <option value="">{text.selectDepartment}</option>
                    {filteredDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {error && (
              <p style={{ color: '#c0392b', fontSize: '13px', backgroundColor: colors.errorBg, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${colors.errorBorder}`, marginBottom: '14px', marginTop: 0 }}>
                ! {error}
              </p>
            )}

            {success && (
              <p style={{ color: '#1e6b3e', fontSize: '13px', backgroundColor: colors.successBg, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${colors.successBorder}`, marginBottom: '14px', marginTop: 0 }}>
                + {success}
              </p>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: colors.btnPrimary,
                color: colors.btnPrimaryTxt,
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                letterSpacing: '1px',
                opacity: loading ? 0.75 : 1,
                transition: 'opacity .2s ease',
              }}
              disabled={loading}
            >
              {loading ? '...' : t('register.button')}
            </button>

            {showGoogleButton && (
            <button
              type="button"
              onClick={handleGoogleRegister}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: colors.btnSecondary,
                color: colors.btnSecTxt,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: googleLoading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                opacity: googleLoading ? 0.75 : 1,
                transition: 'opacity .2s ease'
              }}
              disabled={googleLoading}
            >
              {googleLoading
                ? '...'
                : (isRTL ? 'التسجيل باستخدام Google' : 'Continue with Google')}
            </button>
            )}
          </form>

          <p style={{ textAlign: 'center', fontSize: isNarrowMobile ? '12px' : '13px', color: colors.textMuted, marginTop: isMobile ? '16px' : '20px' }}>
            {t('register.hasAccount')}{' '}
            <span style={{ color: colors.text, fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>
              {t('register.login')}
            </span>
          </p>
        </div>
      </div>
    </ExamorShell>
  );
}

export default Register;
