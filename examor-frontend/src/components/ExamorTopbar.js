import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';

function getDefaultDashboardRoute(role) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/doctor';
  if (role === 'student') return '/student';
  return '/';
}

export default function ExamorTopbar({ compact = false, lockExamMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { isDark, toggle, colors } = useTheme();
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAr = i18n.language === 'ar';
  const isHome = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const isAuthed = Boolean(token && role) && !isAuthPage;

  const user = useMemo(() => {
    if (!isAuthed) return null;

    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [isAuthed]);

  const labels = useMemo(
    () => ({
      home: isAr ? 'الرئيسية' : 'Home',
      dashboard: isAr ? 'لوحة التحكم' : 'Dashboard',
      logout: isAr ? 'خروج' : 'Logout',
      login: isAr ? 'تسجيل الدخول' : 'Login',
      register: isAr ? 'إنشاء حساب' : 'Register',
      lang: isAr ? 'EN' : 'عر',
      theme: isDark ? 'Light' : 'Dark',
    }),
    [isAr, isDark]
  );

  const toggleLang = () => {
    const next = isAr ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
    document.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  const logout = async () => {
    const confirmMessage = isAr
      ? 'هل تريد تسجيل الخروج الآن؟'
      : 'Do you want to logout now?';
    if (!window.confirm(confirmMessage)) return;

    try {
      await API.post('/auth/logout');
    } catch {
      // Ignore backend logout failures and clear local session anyway.
    }

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navHeight = compact ? 60 : 66;
  const examModeLabel = isAr ? 'وضع الامتحان' : 'Exam Mode';
  const isTablet = viewportWidth <= 980;
  const isMobile = viewportWidth <= 720;
  const isNarrowMobile = viewportWidth <= 480;
  const stackMobileLayout = isMobile;
  const navPadding = compact
    ? isNarrowMobile
      ? '8px 10px'
      : isMobile
        ? '10px 12px'
        : isTablet
          ? '0 14px'
          : '0 20px'
    : isNarrowMobile
      ? '8px 10px'
      : isMobile
        ? '10px 12px'
        : isTablet
          ? '0 18px'
          : '0 52px';
  const controlPadding = isNarrowMobile ? '5px 8px' : isMobile ? '7px 10px' : '7px 14px';
  const controlFontSize = isNarrowMobile ? 9.5 : isMobile ? 11 : 12;
  const showUserPill = !compact && !isTablet && !isNarrowMobile;

  return (
    <nav
      style={{
        background: isDark ? 'rgba(15,29,53,.97)' : 'rgba(250,248,244,.97)',
        backdropFilter: 'blur(12px)',
        padding: navPadding,
        minHeight: navHeight,
        display: 'flex',
        flexDirection: stackMobileLayout ? 'column' : 'row',
        alignItems: stackMobileLayout ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: isNarrowMobile ? 6 : isMobile ? 8 : 12,
        flexWrap: 'nowrap',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,.25)' : '0 4px 24px rgba(74,46,26,.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        gap: isNarrowMobile ? 8 : 10,
        direction: 'ltr',
        cursor: lockExamMode ? 'default' : 'pointer',
        minWidth: stackMobileLayout ? '100%' : 'auto',
        justifyContent: stackMobileLayout ? 'space-between' : 'flex-start',
      }}
        onClick={() => {
          if (!lockExamMode) navigate('/?landing=1');
        }}
      >
        <div
          style={{
            width: isNarrowMobile ? 32 : 36,
            height: isNarrowMobile ? 32 : 36,
            border: `1.5px solid ${colors.accent}`,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
          }}
        >
          <svg
            width={isNarrowMobile ? '16' : '18'}
            height={isNarrowMobile ? '16' : '18'}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.accent}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="12" y2="17" />
          </svg>
        </div>
        <span style={{ color: colors.logoText, fontSize: isNarrowMobile ? 15 : isMobile ? 17 : 19, fontWeight: 'bold', letterSpacing: isNarrowMobile ? 1.8 : 2.5 }}>
          EXAMOR
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: isNarrowMobile ? 6 : isMobile ? 8 : 10,
          alignItems: 'center',
          flexWrap: stackMobileLayout ? 'wrap' : 'nowrap',
          justifyContent: 'flex-start',
          width: stackMobileLayout ? '100%' : 'auto',
          overflowX: stackMobileLayout ? 'auto' : 'visible',
          paddingBottom: stackMobileLayout ? 2 : 0,
          scrollbarWidth: 'none',
        }}
      >
        {lockExamMode ? (
          <div
            style={{
              padding: controlPadding,
              background: isDark ? 'rgba(201,168,130,.12)' : 'rgba(139,107,74,.1)',
              color: colors.accent,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontSize: controlFontSize,
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            {examModeLabel}
          </div>
        ) : !isHome && (
          <button
            onClick={() => navigate('/?landing=1')}
            style={{
              padding: controlPadding,
              background: colors.btnSecondary,
              color: colors.btnSecTxt,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontSize: controlFontSize,
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
            }}
          >
            {labels.home}
          </button>
        )}

        {isAuthed && user?.name && showUserPill && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,.04)' : colors.cardBg2,
              border: `1px solid ${colors.border}`,
              color: colors.textMuted,
              fontSize: 12,
              maxWidth: isMobile ? '100%' : 260,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
            title={user.name}
          >
            <span style={{ color: colors.text, fontWeight: 'bold' }}>{user.name}</span>
            {role && (
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: isDark ? 'rgba(201,168,130,.16)' : 'rgba(139,107,74,.12)',
                  color: colors.accent,
                  border: `1px solid ${isDark ? 'rgba(201,168,130,.22)' : 'rgba(139,107,74,.25)'}`,
                  fontWeight: 'bold',
                  fontSize: 11,
                }}
              >
                {role}
              </span>
            )}
          </div>
        )}

        {!lockExamMode && (
          <>
            <button
              onClick={toggleLang}
              style={{
                padding: controlPadding,
                background: isDark ? 'rgba(255,255,255,.06)' : colors.cardBg2,
                color: colors.textMuted,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontSize: controlFontSize,
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
            }}
          >
            {labels.lang}
          </button>

            <button
              onClick={toggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: isNarrowMobile ? '6px 10px' : isMobile ? '7px 12px' : '7px 16px',
                background: isDark ? 'rgba(255,255,255,.06)' : colors.cardBg2,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                fontSize: controlFontSize,
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flex: '0 0 auto',
              }}
            >
              {labels.theme}
            </button>
          </>
        )}

        {!lockExamMode &&
          (isAuthed ? (
            <>
              <button
                onClick={() => navigate(getDefaultDashboardRoute(role))}
                style={{
                  padding: controlPadding,
                  background: colors.btnSecondary,
                  color: colors.btnSecTxt,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: controlFontSize,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto',
                }}
              >
                {labels.dashboard}
              </button>
              <button
                onClick={logout}
                style={{
                  padding: controlPadding,
                  background: isDark ? 'rgba(192,57,43,.14)' : colors.errorBg,
                  color: isDark ? '#ffb4aa' : '#c0392b',
                  border: `1px solid ${colors.errorBorder}`,
                  borderRadius: 8,
                  fontSize: controlFontSize,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto',
                }}
              >
                {labels.logout}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: controlPadding,
                  background: colors.btnSecondary,
                  color: colors.btnSecTxt,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: controlFontSize,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto',
                }}
              >
                {labels.login}
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  padding: controlPadding,
                  background: colors.btnPrimary,
                  color: colors.btnPrimaryTxt,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: controlFontSize,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto',
                }}
              >
                {labels.register}
              </button>
            </>
          ))}
      </div>
    </nav>
  );
}
