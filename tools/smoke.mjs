const baseUrl = (process.env.SMOKE_BASE_URL || 'https://examor-backend.vercel.app').replace(/\/$/, '');
const studentEmail = process.env.SMOKE_STUDENT_EMAIL || '';
const studentPassword = process.env.SMOKE_STUDENT_PASSWORD || '';

const log = (label, ok, details = '') => {
  const status = ok ? 'OK' : 'FAIL';
  const line = `[${status}] ${label}${details ? ` - ${details}` : ''}`;
  console.log(line);
  return ok;
};

const check = async (label, url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const ok = res.ok;
    const text = await res.text().catch(() => '');
    log(label, ok, `${res.status}${text ? ` ${text.slice(0, 120)}` : ''}`);
    return { ok, status: res.status, text };
  } catch (err) {
    log(label, false, err.message);
    return { ok: false, status: 0, text: '' };
  }
};

const loginAndGetToken = async (email, password) => {
  if (!email || !password) return null;
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    log('Auth login', false, `${res.status} ${text.slice(0, 120)}`);
    return null;
  }
  const data = await res.json();
  log('Auth login', true, 'token received');
  return data?.token || null;
};

const main = async () => {
  console.log(`Smoke test: ${baseUrl}`);
  await check('Root', `${baseUrl}/`);
  await check('Health', `${baseUrl}/api/health`);
  await check('Public stats', `${baseUrl}/api/auth/stats`);
  await check('Google client', `${baseUrl}/api/auth/google-client`);

  const token = await loginAndGetToken(studentEmail, studentPassword);
  if (token) {
    await check('Auth me', `${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await check('Student exams', `${baseUrl}/api/student/exams`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } else {
    console.log('[SKIP] Authenticated checks (set SMOKE_STUDENT_EMAIL / SMOKE_STUDENT_PASSWORD)');
  }
};

main();
