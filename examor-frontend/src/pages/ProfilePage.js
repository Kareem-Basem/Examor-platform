import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import DashboardLayout from '../components/DashboardLayout';

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const isAr = i18n.language === 'ar';
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const isTablet = viewportWidth <= 980;

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const role = currentUser?.role;
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

    const text = useMemo(() => ({
    profile: isAr ? 'الحساب' : 'Profile',
    personalInfo: isAr ? 'البيانات الشخصية' : 'Personal Information',
    academicInfo: isAr ? 'البيانات الأكاديمية' : 'Academic Information',
    security: isAr ? 'الأمان' : 'Security',
    name: isAr ? 'الاسم' : 'Name',
    email: isAr ? 'البريد الإلكتروني' : 'Email',
    phone: isAr ? 'رقم الهاتف' : 'Phone Number',
    academicYear: isAr ? 'الفرقة الدراسية' : 'Academic Year',
    bio: isAr ? 'نبذة قصيرة' : 'Short Bio',
    university: isAr ? 'الجامعة' : 'University',
    branch: isAr ? 'الفرع' : 'Branch',
    faculty: isAr ? 'الكلية' : 'Faculty',
    department: isAr ? 'القسم' : 'Department',
    saveProfile: isAr ? 'حفظ البيانات' : 'Save Profile',
    profileSaved: isAr ? 'تم حفظ بياناتك بنجاح' : 'Profile updated successfully',
    currentPassword: isAr ? 'كلمة المرور الحالية' : 'Current Password',
    newPassword: isAr ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPassword: isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password',
    updatePassword: isAr ? 'تغيير كلمة المرور' : 'Change Password',
    passwordSaved: isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password updated successfully',
    adminManaged: isAr ? 'هذه البيانات الأكاديمية تُدار من لوحة الإدارة للحفاظ على اتساق الهيكل الأكاديمي.' : 'Academic hierarchy is managed by admin to keep institutional data consistent.',
    studentHint: isAr ? 'يمكنك تعديل بياناتك الشخصية الأساسية، بينما تبقى بيانات الجامعة والكلية والقسم للقراءة فقط.' : 'You can edit your basic personal details, while your university, faculty, and department remain read-only.',
    teacherHint: isAr ? 'يمكنك تعديل بياناتك الشخصية ووسائل التواصل، بينما تظل بياناتك الأكاديمية للقراءة فقط.' : 'You can edit your personal and contact details, while academic affiliation stays read-only.',
    loading: isAr ? 'جاري التحميل...' : 'Loading...',
    exams: isAr ? 'الامتحانات المتاحة' : 'Available Exams',
    results: isAr ? 'نتائجي' : 'My Results',
    myExams: isAr ? 'امتحاناتي' : 'My Exams',
    monitor: isAr ? 'مراقبة مباشرة' : 'Live Monitor',
    bank: isAr ? 'بنك الأسئلة' : 'Question Bank',
    courses: isAr ? 'المواد' : 'Courses',
    mismatch: isAr ? 'تأكيد كلمة المرور غير متطابق' : 'Password confirmation does not match',
    basicRequired: isAr ? 'الاسم مطلوب' : 'Name is required',
    recentActivity: isAr ? 'آخر النشاطات' : 'Recent Activity',
    noActivity: isAr ? 'لا توجد نشاطات مسجلة حالياً' : 'No recent activity yet',
    startedExam: isAr ? 'بدء الامتحان' : 'Started an exam',
    submittedExam: isAr ? 'تسليم الامتحان' : 'Submitted exam',
    forceSubmittedExam: isAr ? 'تم تسليم الامتحان تلقائيًا' : 'Exam was force submitted',
    createdExam: isAr ? 'إنشاء امتحان' : 'Created an exam',
    savedQuestionToBank: isAr ? 'حفظ سؤال في بنك الأسئلة' : 'Saved a question to the bank',
    studentSubmittedAttempt: isAr ? 'تسليم محاولة طالب' : 'A student submitted an attempt',
    studentForcedAttempt: isAr ? 'تسليم محاولة طالب تلقائيًا' : 'A student attempt was force submitted',
    scoreLabel: isAr ? 'الدرجة' : 'Score',
    byStudent: isAr ? 'الطالب' : 'Student',
    accessMode: isAr ? 'آلية الوصول' : 'Access mode',
    teacherProfile: isAr ? 'ملف المدرس' : 'Teacher Profile',
    studentProfile: isAr ? 'ملف الطالب' : 'Student Profile',
    profileIntro: isAr ? 'عدّل بياناتك الأساسية ثم احفظ التغييرات.' : 'Update your basic information, then save changes.',
    academicInfoHint: isAr ? 'هذه البيانات تعكس ارتباطك الأكاديمي الحالي.' : 'These fields reflect your current academic affiliation.',
    activityHint: isAr ? 'آخر العمليات التي تمت على حسابك.' : 'Latest actions performed on your account.',
    securityHint: isAr ? 'غيّر كلمة المرور بشكل آمن من هنا.' : 'Change your password securely from here.',
    academicPendingTitleTeacher: isAr ? "حساب مدرس أكاديمي في انتظار الموافقة" : 'Academic teacher account pending approval',
    academicPendingTitleStudent: isAr ? "حساب طالب أكاديمي في انتظار الموافقة" : 'Academic student account pending approval',
    academicPendingDescTeacher: isAr
      ? "سيتم تفعيل حسابك بواسطة الأدمن. حتى الان لن تتمكن من الدخول للوحة الدكتور أو إنشاء امتحانات قسمية."
      : 'Your account needs admin verification before you can access the doctor dashboard or create department exams.',
    academicPendingDescStudent: isAr
      ? "سيتم تفعيل حسابك بواسطة الأدمن. حتى الان لن تتمكن من دخول اللوحة الطلابية أو الامتحانات حتى تم التفعيل."
      : 'Your account needs admin verification before you can access the student dashboard or exams.',
    academicPendingHint: isAr ? "يرجى التواصل مع الإدارة لتسريع عملية التفعيل." : 'Please contact the admin to complete verification.',
  }), [isAr]);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    academic_year: '',
    bio: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateStoredUser = useCallback((nextProfile) => {
    const merged = {
      ...(currentUser || {}),
      ...(nextProfile || {}),
    };
    localStorage.setItem('user', JSON.stringify(merged));
  }, [currentUser]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, activityRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/auth/me/activity'),
        ]);
        const nextProfile = profileRes.data?.data || null;
        setProfile(nextProfile);
        updateStoredUser(nextProfile);
        setActivity(activityRes.data?.data || []);
        setForm({
          name: nextProfile?.name || '',
          phone_number: nextProfile?.phone_number || '',
          academic_year: nextProfile?.academic_year || '',
          bio: nextProfile?.bio || '',
        });
      } catch (err) {
        alert(err.response?.data?.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [updateStoredUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert(text.basicRequired);
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        name: form.name,
        phone_number: form.phone_number,
        academic_year: isStudent ? form.academic_year : null,
        bio: isTeacher ? form.bio : null,
      };
      const res = await API.patch('/auth/me', payload);
      const nextProfile = res.data?.data || null;
      setProfile(nextProfile);
      setForm({
        name: nextProfile?.name || '',
        phone_number: nextProfile?.phone_number || '',
        academic_year: nextProfile?.academic_year || '',
        bio: nextProfile?.bio || '',
      });
      updateStoredUser(nextProfile);
      alert(text.profileSaved);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert(text.mismatch);
      return;
    }

    setSavingPassword(true);
    try {
      await API.patch('/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      alert(text.passwordSaved);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const navItems = useMemo(() => {
    if (isTeacher) {
      return [
        { key: 'exams', label: text.myExams, active: location.pathname === '/doctor' && !new URLSearchParams(location.search).get('tab'), onClick: () => navigate('/doctor') },
        { key: 'results', label: text.results, active: location.pathname === '/doctor' && new URLSearchParams(location.search).get('tab') === 'results', onClick: () => navigate('/doctor?tab=results') },
        { key: 'monitor', label: text.monitor, active: location.pathname === '/doctor' && new URLSearchParams(location.search).get('tab') === 'monitor', onClick: () => navigate('/doctor?tab=monitor') },
        { key: 'bank', label: text.bank, active: location.pathname === '/doctor' && new URLSearchParams(location.search).get('tab') === 'bank', onClick: () => navigate('/doctor?tab=bank') },
        { key: 'courses', label: text.courses, active: location.pathname === '/doctor' && new URLSearchParams(location.search).get('tab') === 'courses', onClick: () => navigate('/doctor?tab=courses') },
        { key: 'profile', label: text.profile, active: location.pathname === '/doctor/profile', onClick: () => navigate('/doctor/profile') },
      ];
    }

    return [
      { key: 'exams', label: text.exams, active: location.pathname === '/student', onClick: () => navigate('/student') },
      { key: 'results', label: text.results, active: location.pathname === '/student/results', onClick: () => navigate('/student/results') },
      { key: 'profile', label: text.profile, active: location.pathname === '/student/profile', onClick: () => navigate('/student/profile') },
    ];
  }, [isTeacher, location.pathname, location.search, navigate, text.bank, text.courses, text.exams, text.monitor, text.myExams, text.profile, text.results]);

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

  const primaryButton = {
    padding: '11px 16px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: colors.btnPrimary,
    color: colors.btnPrimaryTxt,
    fontWeight: 'bold',
    fontSize: 13,
    opacity: savingProfile || savingPassword ? 0.8 : 1,
  };

  const sectionTitle = {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  };

  const sectionHint = {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 1.8,
    marginBottom: 14,
  };

  const infoCards = [
    [text.university, profile?.university_name || '-'],
    [text.branch, profile?.branch_name || '-'],
    [text.faculty, profile?.faculty_name || '-'],
    [text.department, profile?.department_name || '-'],
  ];

  const formatActivityDate = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';

    return parsed.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const describeActivity = (item) => {
    const subject = item?.subject_title || '-';
    const examCode = item?.exam_code ? ` (${item.exam_code})` : '';
    const extraText = item?.extra_text || '';

    switch (item?.activity_type) {
      case 'exam_started':
        return {
          title: `${text.startedExam}${examCode}`,
          detail: subject,
        };
      case 'exam_submitted':
        return {
          title: `${text.submittedExam}${examCode}`,
          detail: extraText ? `${subject} • ${text.scoreLabel}: ${extraText}` : subject,
        };
      case 'exam_force_submitted':
        return {
          title: `${text.forceSubmittedExam}${examCode}`,
          detail: extraText ? `${subject} • ${text.scoreLabel}: ${extraText}` : subject,
        };
      case 'exam_created':
        return {
          title: `${text.createdExam}${examCode}`,
          detail: extraText ? `${subject} • ${text.accessMode}: ${extraText}` : subject,
        };
      case 'question_saved_to_bank':
        return {
          title: text.savedQuestionToBank,
          detail: extraText ? `${subject} • ${extraText}` : subject,
        };
      case 'attempt_submitted':
        return {
          title: `${text.studentSubmittedAttempt}${examCode}`,
          detail: extraText ? `${subject} • ${text.byStudent}: ${extraText}` : subject,
        };
      case 'attempt_force_submitted':
        return {
          title: `${text.studentForcedAttempt}${examCode}`,
          detail: extraText ? `${subject} • ${text.byStudent}: ${extraText}` : subject,
        };
      default:
        return {
          title: subject,
          detail: extraText || examCode,
        };
    }
  };

  const profileMode = String((profile?.profile_mode ?? currentUser?.profile_mode) || '').toLowerCase();
  const hasDepartment = Boolean(profile?.department_id ?? currentUser?.department_id);
  const isAcademicProfile = profileMode ? profileMode === 'academic' : hasDepartment;
  const isAcademicPending = (isTeacher || isStudent)
    && isAcademicProfile
    && !(profile?.academic_verified ?? currentUser?.academic_verified);

  const pendingDescription = isTeacher ? text.academicPendingDescTeacher : text.academicPendingDescStudent;
  const pendingTitle = isTeacher ? text.academicPendingTitleTeacher : text.academicPendingTitleStudent;

  return (
    <DashboardLayout navItems={navItems} interactiveNav>
      <div style={{ marginBottom: 18, color: colors.textMuted, fontSize: 13 }}>
        {loading ? text.loading : (profile?.name || currentUser?.name || text.profile)}
      </div>

      {isAcademicPending && (
        <div style={{ ...cardBase, padding: 18, marginBottom: 16, borderColor: '#f3c37b', backgroundColor: isDark ? 'rgba(243,195,123,.1)' : '#FFF7E8' }}>
          <div style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>{pendingTitle}</div>
          <div style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.8 }}>{pendingDescription}</div>
          <div style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>{text.academicPendingHint}</div>
        </div>
      )}


      <div style={{ ...cardBase, padding: 18, marginBottom: 16 }}>
        <div style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{text.profile}</div>
        <div style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>
          {isTeacher ? text.teacherProfile : text.studentProfile}
        </div>
        <div style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.8 }}>
          {isTeacher ? text.teacherHint : text.studentHint}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : 'minmax(0, 1.3fr) minmax(320px, .9fr)', gap: 16 }}>
        <form onSubmit={handleSaveProfile} style={{ ...cardBase, padding: 18 }}>
          <div style={sectionTitle}>{text.personalInfo}</div>
          <div style={sectionHint}>
            {text.profileIntro}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{text.name}</label>
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{text.email}</label>
              <input value={profile?.email || ''} disabled style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{text.phone}</label>
              <input value={form.phone_number} onChange={(e) => setForm((prev) => ({ ...prev, phone_number: e.target.value }))} style={inputStyle} />
            </div>
            {isStudent && (
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{text.academicYear}</label>
                <input value={form.academic_year} onChange={(e) => setForm((prev) => ({ ...prev, academic_year: e.target.value }))} style={inputStyle} />
              </div>
            )}
          </div>

          {isTeacher && (
            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{text.bio}</label>
              <textarea
                rows={5}
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', justifyContent: isTablet ? 'stretch' : 'flex-end' }}>
            <button
              type="submit"
              style={{ ...primaryButton, minWidth: isTablet ? '100%' : 190 }}
              disabled={savingProfile}
            >
              {text.saveProfile}
            </button>
          </div>
        </form>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ ...cardBase, padding: 18 }}>
            <div style={sectionTitle}>{text.academicInfo}</div>
            <div style={sectionHint}>
              {text.academicInfoHint}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {infoCards.map(([label, value]) => (
                <div key={label} style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,.04)' : '#FBF9F6', border: `1px solid ${colors.border}` }}>
                  <div style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>{label}</div>
                  <div style={{ color: colors.text, fontSize: 13, fontWeight: 'bold', lineHeight: 1.6 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, color: colors.textMuted, fontSize: 12, lineHeight: 1.8 }}>
              {text.adminManaged}
            </div>
          </div>

          <div style={{ ...cardBase, padding: 18 }}>
            <div style={sectionTitle}>{text.recentActivity}</div>
            <div style={{ ...sectionHint, marginBottom: 10 }}>
              {text.activityHint}
            </div>
            {activity.length === 0 ? (
              <div style={{ color: colors.textMuted, fontSize: 13 }}>{text.noActivity}</div>
            ) : (
              <div style={{ display: 'grid', gap: 10, maxHeight: 320, overflowY: 'auto', paddingInlineEnd: 4 }}>
                {activity.map((item) => {
                  const summary = describeActivity(item);
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        backgroundColor: isDark ? 'rgba(255,255,255,.04)' : '#FBF9F6',
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div style={{ color: colors.text, fontSize: 13, fontWeight: 'bold', marginBottom: 4, lineHeight: 1.6 }}>
                        {summary.title}
                      </div>
                      <div style={{ color: colors.textMuted, fontSize: 12, lineHeight: 1.7 }}>
                        {summary.detail}
                      </div>
                      <div style={{ color: colors.textMuted, fontSize: 11, marginTop: 8 }}>
                        {formatActivityDate(item.occurred_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={handleChangePassword} style={{ ...cardBase, padding: 18 }}>
            <div style={sectionTitle}>{text.security}</div>
            <div style={sectionHint}>
              {text.securityHint}
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{text.currentPassword}</label>
                <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{text.newPassword}</label>
                <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{text.confirmPassword}</label>
                <input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: isTablet ? 'stretch' : 'flex-end' }}>
              <button
                type="submit"
                style={{ ...primaryButton, minWidth: isTablet ? '100%' : 190 }}
                disabled={savingPassword}
              >
                {text.updatePassword}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;











