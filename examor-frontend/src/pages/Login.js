import React, { useEffect, useState } from 'react';
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

function Login() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [runtimeGoogleClientId, setRuntimeGoogleClientId] = useState('');
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  const isRTL = i18n.language === 'ar';
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
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
      const apiMessage = err?.response?.data?.message;
      if (apiMessage) {
        setError(apiMessage);
      } else if (err?.response?.status === 409) {
        setError(
          isRTL
            ? 'هذا الحساب مفتوح على جهاز آخر. سجّل الخروج أولاً من الجهاز الآخر.'
            : 'This account is active on another device. Please logout there first.'
        );
      } else {
        setError(t('login.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    if (!credential) return;
    setError('');
    setGoogleLoading(true);
    try {
      const res = await API.post('/auth/google', { credential });
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
      setError(err.response?.data?.message || (isRTL ? 'فشل تسجيل الدخول عبر Google' : 'Google sign-in failed'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!googleClientId) {
      setError(isRTL ? 'Google Client ID غير مضبوط في إعدادات الواجهة' : 'Google Client ID is not configured. Set GOOGLE_CLIENT_ID (backend) or REACT_APP_GOOGLE_CLIENT_ID (frontend) and restart.');
      return;
    }

    if (!window.google?.accounts?.id) {
      setError(isRTL ? 'Google Sign-In غير متاح حالياً' : 'Google Sign-In is unavailable');
      return;
    }

    setError('');
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => handleGoogleCredential(response?.credential),
      auto_select: false,
      cancel_on_tap_outside: true
    });
    window.google.accounts.id.prompt();
  };

  return (
    <ExamorShell style={{ display: 'flex', flexDirection: 'column' }}>
      <ExamorTopbar />
      <div style={{ flex: 1, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isNarrowMobile ? '16px 10px 24px' : isMobile ? '22px 12px 28px' : '34px 18px' }}>
        <div style={{ backgroundColor: colors.cardBg, borderRadius: '16px', padding: isNarrowMobile ? '22px 16px' : isMobile ? '28px 22px' : '40px 36px', width: '100%', maxWidth: '420px', border: `1px solid ${colors.border}`, boxShadow: colors.shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '20px' : '28px', direction: 'ltr' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: colors.logoDot, borderRadius: '50%' }} />
            <span style={{ fontSize: isNarrowMobile ? '18px' : isMobile ? '20px' : '22px', fontWeight: 'bold', color: colors.logoText, letterSpacing: isNarrowMobile ? '2px' : '3px' }}>EXAMOR</span>
          </div>

          <h2 style={{ fontSize: isNarrowMobile ? '21px' : isMobile ? '22px' : '24px', fontWeight: 'bold', color: colors.text, margin: '0 0 6px 0' }}>{t('login.title')}</h2>
          <p style={{ fontSize: isNarrowMobile ? '13px' : '14px', color: colors.textMuted, margin: `0 0 ${isMobile ? '22px' : '28px'} 0` }}>{t('login.subtitle')}</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.textMuted, marginBottom: '6px' }}>{t('login.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={{ width: '100%', padding: '11px 14px', backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '10px', fontSize: '14px', color: colors.inputText, outline: 'none', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.textMuted, marginBottom: '6px' }}>{t('login.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                style={{ width: '100%', padding: '11px 14px', backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '10px', fontSize: '14px', color: colors.inputText, outline: 'none', boxSizing: 'border-box' }}
                required
              />
            </div>

            {error && (
              <p style={{ color: '#c0392b', fontSize: '13px', backgroundColor: colors.errorBg, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${colors.errorBorder}`, marginBottom: '14px', marginTop: 0 }}>
                ! {error}
              </p>
            )}

            <button
              type="submit"
              style={{ width: '100%', padding: '13px', backgroundColor: colors.btnPrimary, color: colors.btnPrimaryTxt, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px', letterSpacing: '1px', opacity: loading ? 0.75 : 1, transition: 'opacity .2s ease' }}
              disabled={loading}
            >
              {loading ? '...' : t('login.button')}
            </button>

            {showGoogleButton && (
            <button
              type="button"
              onClick={handleGoogleLogin}
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
                : (isRTL ? 'تسجيل الدخول باستخدام Google' : 'Continue with Google')}
            </button>
            )}
          </form>

          <p style={{ textAlign: 'center', fontSize: isNarrowMobile ? '12px' : '13px', color: colors.textMuted, marginTop: isMobile ? '16px' : '20px' }}>
            {t('login.noAccount')}{' '}
            <span style={{ color: colors.text, fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/register')}>
              {t('login.register')}
            </span>
          </p>
        </div>
      </div>
    </ExamorShell>
  );
}

export default Login;
