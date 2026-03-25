import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/DashboardLayout';

function AdminDashboard() {
  const { i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const isAr = i18n.language === 'ar';
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  const isMobile = viewportWidth <= 768;
  const isTablet = viewportWidth <= 980;
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    if (!message) return;
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const notifyError = (err, fallback = 'Request failed') => {
    showToast(err?.response?.data?.message || fallback, 'error');
  };
  const t = useMemo(() => ({
    welcome: isAr ? 'مرحبا،' : 'Welcome,',
    admin: isAr ? 'المشرف' : 'Admin',
    statistics: isAr ? 'الإحصائيات' : 'Statistics',
    universities: isAr ? 'الجامعات' : 'Universities',
    branches: isAr ? 'الفروع' : 'Branches',
    faculties: isAr ? 'الكليات' : 'Faculties',
    departments: isAr ? 'الأقسام' : 'Departments',
    courses: isAr ? 'المواد' : 'Courses',
    users: isAr ? 'المستخدمون' : 'Users',
    exams: isAr ? 'الامتحانات' : 'Exams',
    attempts: isAr ? 'المحاولات' : 'Attempts',
    violations: isAr ? 'المخالفات' : 'Violations',
    auditLogs: isAr ? 'سجل الأحداث' : 'Audit Logs',
    sortBy: isAr ? 'الترتيب حسب' : 'Sort by',
    refresh: isAr ? 'تحديث' : 'Refresh',
    name: isAr ? 'الاسم' : 'Name',
    email: isAr ? 'البريد الإلكتروني' : 'Email',
    role: isAr ? 'الدور' : 'Role',
    actions: isAr ? 'إجراءات' : 'Actions',
    delete: isAr ? 'حذف' : 'Delete',
    deleteConfirm: isAr ? 'هل تريد حذف' : 'Are you sure you want to delete',
    forceDeleteUserConfirm: isAr ? 'هذا المستخدم لديه محاولات. هل تريد حذف المستخدم وكل محاولاته؟' : 'This user has attempts. Delete the user and all attempts?',
    accountType: isAr ? 'نوع الحساب' : 'Account Type',
    accountState: isAr ? 'حالة الحساب' : 'Account State',
    university: isAr ? 'الجامعة' : 'University',
    branch: isAr ? 'الفرع' : 'Branch',
    department: isAr ? 'القسم' : 'Department',
    faculty: isAr ? 'الكلية' : 'Faculty',
    country: isAr ? 'الدولة' : 'Country',
    city: isAr ? 'المدينة' : 'City',
    level: isAr ? 'الفرقة الدراسية' : 'Academic Year',
    password: isAr ? 'كلمة المرور' : 'Password',
    examTitle: isAr ? 'عنوان الامتحان' : 'Exam Title',
    examCode: isAr ? 'كود الامتحان' : 'Exam Code',
    accessMode: isAr ? 'نوع الوصول' : 'Access Mode',
    questions: isAr ? 'الأسئلة' : 'Questions',
    attemptsCount: isAr ? 'المحاولات' : 'Attempts',
    score: isAr ? 'الدرجة' : 'Score',
    status: isAr ? 'الحالة' : 'Status',
    start: isAr ? 'البداية' : 'Start',
    end: isAr ? 'النهاية' : 'End',
    submitTime: isAr ? 'وقت التسليم' : 'Submit Time',
    count: isAr ? 'العدد' : 'Count',
    reason: isAr ? 'السبب' : 'Reason',
    createdAt: isAr ? 'الوقت' : 'Created At',
    actor: isAr ? 'المنفذ' : 'Actor',
    target: isAr ? 'الهدف' : 'Target',
    details: isAr ? 'التفاصيل' : 'Details',
    type: isAr ? 'النوع' : 'Type',
    student: isAr ? 'طالب' : 'Student',
    teacher: isAr ? 'مدرس' : 'Teacher',
    adminRole: isAr ? 'أدمن' : 'Admin',
    academic: isAr ? 'أكاديمي' : 'Academic',
    independent: isAr ? 'مستقل' : 'Independent',
    active: isAr ? 'نشط' : 'Active',
    inactive: isAr ? 'غير نشط' : 'Inactive',
    saveChanges: isAr ? 'حفظ التعديلات' : 'Save Changes',
    editUser: isAr ? 'تعديل' : 'Edit',
    cancel: isAr ? 'إلغاء' : 'Cancel',
    resetPassword: isAr ? 'تعيين كلمة مرور' : 'Reset Password',
    editUserTitle: isAr ? 'تعديل بيانات المستخدم' : 'Edit User',
    resetPasswordTitle: isAr ? 'تغيير كلمة المرور للمستخدم' : 'Reset User Password',
    confirmAction: isAr ? 'تأكيد' : 'Confirm',
    close: isAr ? 'إغلاق' : 'Close',
    verifyAcademic: isAr ? 'توثيق أكاديمي' : 'Verify Academic',
    unverifyAcademic: isAr ? 'إلغاء التوثيق الأكاديمي' : 'Unverify Academic',
    academicPending: isAr ? 'في انتظار التوثيق' : 'Pending Verification',
    academicVerified: isAr ? 'موثق أكاديميًا' : 'Academic Verified',
    verifyConfirm: isAr ? 'تأكيد توثيق الحساب الأكاديمي؟' : 'Confirm academic verification?',
    unverifyConfirm: isAr ? 'إلغاء توثيق الحساب الأكاديمي؟' : 'Remove academic verification?',
    notAcademic: isAr ? 'هذا الحساب غير أكاديمي' : 'This account is not academic',
    successSaved: isAr ? 'تم الحفظ بنجاح' : 'Saved successfully',
    successUpdated: isAr ? 'تم التحديث بنجاح' : 'Updated successfully',
    successPassword: isAr ? 'تم تغيير كلمة المرور' : 'Password updated successfully',
    successVerified: isAr ? 'تم توثيق الحساب بنجاح' : 'Academic verified successfully',
    successUnverified: isAr ? 'تم إلغاء التوثيق' : 'Academic verification removed',
    successDeleted: isAr ? 'تم الحذف بنجاح' : 'Deleted successfully',
    successActivated: isAr ? 'تم تفعيل الحساب' : 'Account activated',
    successDeactivated: isAr ? 'تم تعطيل الحساب' : 'Account deactivated',
    successBulkUpdated: isAr ? 'تم تنفيذ العملية على المحدد' : 'Bulk action completed',
    successForceSubmit: isAr ? 'تم إنهاء المحاولة' : 'Attempt force-submitted',
    alreadyVerified: isAr ? 'الحساب/الحسابات المحددة موثقة بالفعل' : 'Selected account(s) are already verified',
    alreadyUnverified: isAr ? 'الحساب/الحسابات المحددة غير موثقة بالفعل' : 'Selected account(s) are already unverified',
    noAcademicSelected: isAr ? 'لا يوجد حسابات أكاديمية ضمن المحدد' : 'No academic accounts selected',
    alreadyActive: isAr ? 'الحسابات المحددة نشطة بالفعل' : 'Selected accounts are already active',
    alreadyInactive: isAr ? 'الحسابات المحددة معطلة بالفعل' : 'Selected accounts are already inactive',
    allAcademicStates: isAr ? 'كل الحالات الأكاديمية' : 'All academic states',
    academicOnly: isAr ? 'الأكاديميون فقط' : 'Academic only',
    pendingOnly: isAr ? 'غير الموثقين فقط' : 'Pending only',
    activate: isAr ? 'تفعيل' : 'Activate',
    deactivate: isAr ? 'تعطيل' : 'Deactivate',
    forceSubmit: isAr ? 'إنهاء إجباري' : 'Force Submit',
    updateExam: isAr ? 'تعديل الامتحان' : 'Update Exam',
    open: isAr ? 'مفتوحة' : 'Open',
    submitted: isAr ? 'تم التسليم' : 'Submitted',
    forced: isAr ? 'إجباري' : 'Forced',
    addUniversity: isAr ? 'إضافة جامعة' : 'Add University',
    addBranch: isAr ? 'إضافة فرع' : 'Add Branch',
    addFaculty: isAr ? 'إضافة كلية' : 'Add Faculty',
    addDepartment: isAr ? 'إضافة قسم' : 'Add Department',
    addCourse: isAr ? 'إضافة مادة' : 'Add Course',
    addUser: isAr ? 'إضافة مستخدم' : 'Add User',
    createUser: isAr ? 'إنشاء المستخدم' : 'Create User',
    hideForm: isAr ? 'إخفاء النموذج' : 'Hide Form',
    noUniversity: isAr ? 'بدون جامعة' : 'No university',
    noDepartment: isAr ? 'بدون قسم' : 'No department',
    allRoles: isAr ? 'كل الأدوار' : 'All roles',
    allStatuses: isAr ? 'كل الحالات' : 'All statuses',
    allAccessModes: isAr ? 'كل الأنواع' : 'All access modes',
    exportCsv: isAr ? 'تصدير CSV' : 'Export CSV',
    exportExcel: isAr ? 'تصدير Excel' : 'Export Excel',
    activateSelected: isAr ? 'تفعيل المحدد' : 'Activate Selected',
    deactivateSelected: isAr ? 'تعطيل المحدد' : 'Deactivate Selected',
    verifySelected: isAr ? 'توثيق المحدد' : 'Verify Selected',
    unverifySelected: isAr ? 'إلغاء توثيق المحدد' : 'Unverify Selected',
    forceSubmitSelected: isAr ? 'إنهاء المحدد' : 'Force Submit Selected',
    selectedCount: isAr ? 'عدد المحدد' : 'Selected',
    openAttemptsOnly: isAr ? 'الإنهاء الجماعي يعمل فقط على المحاولات المفتوحة.' : 'Bulk force submit works only for open attempts.',
    previous: isAr ? 'السابق' : 'Previous',
    next: isAr ? 'التالي' : 'Next',
    page: isAr ? 'صفحة' : 'Page',
    byId: 'ID',
    byName: isAr ? 'الاسم' : 'Name',
    byNewest: isAr ? 'الأحدث' : 'Newest',
    searchUsers: isAr ? 'ابحث بالاسم أو البريد أو الدور...' : 'Search by name, email, or role...',
    searchExams: isAr ? 'ابحث بعنوان الامتحان أو الكود أو المدرس...' : 'Search by exam title, code, or teacher...',
    searchAttempts: isAr ? 'ابحث باسم الطالب أو كود الامتحان...' : 'Search by student or exam code...',
    searchViolations: isAr ? 'ابحث باسم الطالب أو نوع المخالفة...' : 'Search by student or violation type...',
    searchAudit: isAr ? 'ابحث بنوع الإجراء أو المنفذ...' : 'Search by action or actor...',
    totalUsers: isAr ? 'إجمالي المستخدمين' : 'Total Users',
    totalExams: isAr ? 'إجمالي الامتحانات' : 'Total Exams',
    totalUniversities: isAr ? 'الجامعات' : 'Universities',
    totalAttempts: isAr ? 'إجمالي المحاولات' : 'Total Attempts',
    totalTeachers: isAr ? 'المدرسون' : 'Teachers',
    totalStudents: isAr ? 'الطلاب' : 'Students',
    activeAttempts: isAr ? 'محاولات مفتوحة' : 'Open Attempts',
    forcedSubmits: isAr ? 'تسليمات إجبارية' : 'Forced Submits',
    totalViolations: isAr ? 'إجمالي المخالفات' : 'Total Violations',
  }), [isAr]);

  const [activeTab, setActiveTab] = useState('statistics');
  const [data, setData] = useState({ statistics: null, universities: [], branches: [], faculties: [], departments: [], courses: [], users: [], exams: [], attempts: [], violations: [], auditLogs: [] });
  const [sortBy, setSortBy] = useState({ universities: 'name', branches: 'name', faculties: 'name', departments: 'name', courses: 'name', users: 'newest', exams: 'newest', attempts: 'newest', violations: 'newest', auditLogs: 'newest' });
  const [search, setSearch] = useState({ users: '', exams: '', attempts: '', violations: '', auditLogs: '' });
  const [filters, setFilters] = useState({ usersRole: 'all', usersAcademic: 'all', examsAccessMode: 'all', attemptsStatus: 'all' });
  const [usersMeta, setUsersMeta] = useState({ page: 1, pageSize: 10, total: 0 });
  const [pages, setPages] = useState({ universities: 1, branches: 1, faculties: 1, departments: 1, courses: 1, users: 1, exams: 1, attempts: 1, violations: 1, auditLogs: 1 });
  const [showForm, setShowForm] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedAttemptIds, setSelectedAttemptIds] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserDraft, setEditingUserDraft] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [forms, setForms] = useState({
    university: { name: '', country: '' },
    branch: { university_id: '', name: '', city: '' },
    faculty: { university_id: '', branch_id: '', name: '' },
    department: { university_id: '', branch_id: '', faculty_id: '', name: '' },
    course: { university_id: '', branch_id: '', department_id: '', name: '', level: '' },
    user: { name: '', email: '', password: '', role: 'student', university_id: '', branch_id: '', faculty_id: '', department_id: '', profile_mode: '' },
  });

  const fetchUsers = useCallback(async () => {
    const userParams = {
      page: pages.users || 1,
      pageSize: usersMeta.pageSize || 10,
      role: filters.usersRole !== 'all' ? filters.usersRole : undefined,
      academic: filters.usersAcademic !== 'all' ? filters.usersAcademic : undefined,
      q: search.users || undefined,
    };
    const users = await API.get('/admin/users', { params: userParams });
    setData((prev) => ({ ...prev, users: users.data.data || [] }));
    if (users.data?.meta) {
      setUsersMeta(users.data.meta);
    } else {
      setUsersMeta((prev) => ({ ...prev, total: (users.data.data || []).length }));
    }
  }, [filters.usersAcademic, filters.usersRole, pages.users, search.users, usersMeta.pageSize]);

  const fetchStatistics = useCallback(async () => {
    const statistics = await API.get('/admin/statistics');
    setData((prev) => ({ ...prev, statistics: statistics.data.data || null }));
  }, []);

  const fetchUniversities = useCallback(async () => {
    const universities = await API.get('/admin/universities');
    setData((prev) => ({ ...prev, universities: universities.data.data || [] }));
  }, []);

  const fetchBranches = useCallback(async () => {
    const branches = await API.get('/admin/branches');
    setData((prev) => ({ ...prev, branches: branches.data.data || [] }));
  }, []);

  const fetchFaculties = useCallback(async () => {
    const faculties = await API.get('/admin/faculties');
    setData((prev) => ({ ...prev, faculties: faculties.data.data || [] }));
  }, []);

  const fetchDepartments = useCallback(async () => {
    const departments = await API.get('/admin/departments');
    setData((prev) => ({ ...prev, departments: departments.data.data || [] }));
  }, []);

  const fetchCourses = useCallback(async () => {
    const courses = await API.get('/admin/courses');
    setData((prev) => ({ ...prev, courses: courses.data.data || [] }));
  }, []);

  const fetchExams = useCallback(async () => {
    const exams = await API.get('/admin/exams');
    setData((prev) => ({ ...prev, exams: exams.data.data || [] }));
  }, []);

  const fetchAttempts = useCallback(async () => {
    const attempts = await API.get('/admin/attempts');
    setData((prev) => ({ ...prev, attempts: attempts.data.data || [] }));
  }, []);

  const fetchViolations = useCallback(async () => {
    const violations = await API.get('/admin/violations');
    setData((prev) => ({ ...prev, violations: violations.data.data || [] }));
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    const auditLogs = await API.get('/admin/audit-logs');
    setData((prev) => ({ ...prev, auditLogs: auditLogs.data.data || [] }));
  }, []);

  const fetchAll = useCallback(async () => {
    await fetchStatistics();
    await Promise.all([
      fetchUniversities(),
      fetchBranches(),
      fetchFaculties(),
      fetchDepartments(),
      fetchCourses(),
      fetchExams(),
      fetchAttempts(),
      fetchViolations(),
      fetchAuditLogs(),
    ]);
  }, [fetchAttempts, fetchAuditLogs, fetchBranches, fetchCourses, fetchDepartments, fetchExams, fetchFaculties, fetchStatistics, fetchUniversities, fetchViolations]);

  useEffect(() => { fetchStatistics(); }, [fetchStatistics]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === 'statistics' && !data.statistics) {
      fetchStatistics().catch(() => {});
    }
    if (activeTab === 'universities' && data.universities.length === 0) {
      fetchUniversities().catch(() => {});
    }
    if (activeTab === 'branches' && data.branches.length === 0) {
      fetchBranches().catch(() => {});
    }
    if (activeTab === 'faculties' && data.faculties.length === 0) {
      fetchFaculties().catch(() => {});
    }
    if (activeTab === 'departments' && data.departments.length === 0) {
      fetchDepartments().catch(() => {});
    }
    if (activeTab === 'courses' && data.courses.length === 0) {
      fetchCourses().catch(() => {});
    }
    if (activeTab === 'users') {
      if (data.universities.length === 0) fetchUniversities().catch(() => {});
      if (data.branches.length === 0) fetchBranches().catch(() => {});
      if (data.faculties.length === 0) fetchFaculties().catch(() => {});
      if (data.departments.length === 0) fetchDepartments().catch(() => {});
    }
    if (activeTab === 'exams' && data.exams.length === 0) {
      fetchExams().catch(() => {});
    }
    if (activeTab === 'attempts' && data.attempts.length === 0) {
      fetchAttempts().catch(() => {});
    }
    if (activeTab === 'violations' && data.violations.length === 0) {
      fetchViolations().catch(() => {});
    }
    if (activeTab === 'auditLogs' && data.auditLogs.length === 0) {
      fetchAuditLogs().catch(() => {});
    }
  }, [
    activeTab,
    data.attempts.length,
    data.auditLogs.length,
    data.branches.length,
    data.courses.length,
    data.departments.length,
    data.exams.length,
    data.faculties.length,
    data.statistics,
    data.universities.length,
    data.violations.length,
    fetchAttempts,
    fetchAuditLogs,
    fetchBranches,
    fetchCourses,
    fetchDepartments,
    fetchExams,
    fetchFaculties,
    fetchStatistics,
    fetchUniversities,
    fetchViolations,
  ]);

  const refreshActiveTab = async () => {
    try {
      if (activeTab === 'statistics') return fetchStatistics();
      if (activeTab === 'universities') return fetchUniversities();
      if (activeTab === 'branches') return fetchBranches();
      if (activeTab === 'faculties') return fetchFaculties();
      if (activeTab === 'departments') return fetchDepartments();
      if (activeTab === 'courses') return fetchCourses();
      if (activeTab === 'users') return fetchUsers();
      if (activeTab === 'exams') return fetchExams();
      if (activeTab === 'attempts') return fetchAttempts();
      if (activeTab === 'violations') return fetchViolations();
      if (activeTab === 'auditLogs') return fetchAuditLogs();
      return fetchAll();
    } catch (err) {
      notifyError(err);
    }
  };

  useEffect(() => {
    setPages((prev) => ({ ...prev, users: 1 }));
  }, [filters.usersRole, filters.usersAcademic, search.users]);

  const setForm = (key, value) => setForms((prev) => ({ ...prev, [key]: { ...prev[key], ...value } }));
  const resetForm = (key, value) => setForms((prev) => ({ ...prev, [key]: value }));
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();

  const submitCreate = async (endpoint, payload, formKey, initial) => {
    setSaving(true);
    try {
      await API.post(endpoint, payload);
      resetForm(formKey, initial);
      setShowForm('');
      await fetchAll();
      showToast(t.successSaved, 'success');
      if (endpoint.includes('/admin/users')) {
        await fetchUsers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Request failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const beginUserEdit = (account) => {
    setEditingUserId(account.id);
    setEditingUserDraft({
      role: account.role,
      university_id: account.university_id ? String(account.university_id) : '',
      branch_id: account.branch_id ? String(account.branch_id) : '',
      faculty_id: account.faculty_id ? String(account.faculty_id) : '',
      department_id: account.department_id ? String(account.department_id) : '',
      profile_mode: ['teacher', 'student'].includes(account.role)
        ? (account.profile_mode || (account.department_id ? 'academic' : 'independent'))
        : '',
    });
    setShowEditModal(true);
  };

  const cancelUserEdit = () => {
    setEditingUserId(null);
    setEditingUserDraft(null);
    setShowEditModal(false);
  };

  const handleUpdateUserDraft = async () => {
    if (!editingUserId || !editingUserDraft) return;
    await API.patch(`/admin/users/${editingUserId}`, {
      role: editingUserDraft.role,
      university_id: editingUserDraft.university_id ? Number(editingUserDraft.university_id) : null,
      department_id: editingUserDraft.department_id ? Number(editingUserDraft.department_id) : null,
      profile_mode: ['teacher', 'student'].includes(editingUserDraft.role) ? (editingUserDraft.profile_mode || null) : null,
    });
    cancelUserEdit();
    await fetchUsers();
    showToast(t.successUpdated, 'success');
  };

  const handleResetPassword = async (account) => {
    setResetTargetUser(account);
    setResetPasswordValue('');
    setShowResetModal(true);
  };

  const confirmResetPassword = async () => {
    if (!resetTargetUser || !resetPasswordValue) return;
    await API.patch(`/admin/users/${resetTargetUser.id}/password`, { password: resetPasswordValue });
    setShowResetModal(false);
    setResetTargetUser(null);
    setResetPasswordValue('');
    await fetchUsers();
    showToast(t.successPassword, 'success');
  };

  const handleToggleUserStatus = async (account) => {
    await API.patch(`/admin/users/${account.id}/status`, { is_active: !account.is_active });
    await fetchUsers();
    showToast(account.is_active ? t.successDeactivated : t.successActivated, 'success');
  };

  const handleBulkUserStatus = async (isActive) => {
    if (selectedUserIds.length === 0) return;
    const selectedUsers = (data.users || []).filter((u) => selectedUserIds.includes(u.id));
    if (selectedUsers.length === 0) return;
    const allSameState = selectedUsers.every((u) => Boolean(u.is_active) === Boolean(isActive));
    if (allSameState) {
      showToast(isActive ? t.alreadyActive : t.alreadyInactive, 'info');
      return;
    }
    await API.patch('/admin/users/bulk/status', { user_ids: selectedUserIds, is_active: isActive });
    setSelectedUserIds((prev) => prev.filter((id) => id !== user?.id || isActive));
    await fetchUsers();
    showToast(t.successBulkUpdated, 'success');
  };

  const handleBulkAcademicVerification = async (academicVerified) => {
    if (selectedUserIds.length === 0) return;
    const selectedUsers = (data.users || []).filter((u) => selectedUserIds.includes(u.id));
    const academicSelected = selectedUsers.filter((u) => isAcademicAccount(u));
    if (academicSelected.length === 0) {
      showToast(t.noAcademicSelected, 'info');
      return;
    }
    const allSameState = academicSelected.every((u) => Boolean(u.academic_verified) === Boolean(academicVerified));
    if (allSameState) {
      showToast(academicVerified ? t.alreadyVerified : t.alreadyUnverified, 'info');
      return;
    }
    const ok = window.confirm(academicVerified ? t.verifyConfirm : t.unverifyConfirm);
    if (!ok) return;
    await API.patch('/admin/users/bulk/academic-verification', { user_ids: selectedUserIds, academic_verified: academicVerified });
    await fetchUsers();
    showToast(academicVerified ? t.successVerified : t.successUnverified, 'success');
  };

  const handleSetAcademicVerification = async (account, academicVerified) => {
    await API.patch(`/admin/users/${account.id}/academic-verification`, {
      academic_verified: Boolean(academicVerified),
      confirm_academic_email: Boolean(academicVerified),
    });
    await fetchUsers();
    showToast(academicVerified ? t.successVerified : t.successUnverified, 'success');
  };

  const handleUpdateExam = async (exam) => {
    const title = window.prompt(t.examTitle, exam.title);
    if (title === null) return;
    const startDate = window.prompt(`${t.start} (YYYY-MM-DD HH:mm:ss)`, exam.start_date ? exam.start_date.replace('T', ' ').slice(0, 19) : '');
    if (startDate === null) return;
    const endDate = window.prompt(`${t.end} (YYYY-MM-DD HH:mm:ss)`, exam.end_date ? exam.end_date.replace('T', ' ').slice(0, 19) : '');
    if (endDate === null) return;
    const accessMode = window.prompt(`${t.accessMode} (department / link)`, exam.access_mode);
    if (accessMode === null) return;
    await API.patch(`/admin/exams/${exam.id}`, {
      title,
      start_date: startDate ? startDate.replace(' ', 'T') : null,
      end_date: endDate ? endDate.replace(' ', 'T') : null,
      access_mode: accessMode,
    });
    await fetchExams();
    showToast(t.successUpdated, 'success');
  };

  const handleUpdateUniversity = async (item) => {
    const name = window.prompt(t.name, item.name || '');
    if (name === null) return;
    const country = window.prompt(t.country, item.country || '');
    if (country === null) return;
    await API.patch(`/admin/universities/${item.id}`, { name, country });
    await fetchUniversities();
    showToast(t.successUpdated, 'success');
  };

  const handleUpdateBranch = async (item) => {
    const universityId = window.prompt(`${t.university} ID`, item.university_id || '');
    if (universityId === null) return;
    const name = window.prompt(t.name, item.name || '');
    if (name === null) return;
    const city = window.prompt(t.city, item.city || '');
    if (city === null) return;
    await API.patch(`/admin/branches/${item.id}`, { university_id: Number(universityId), name, city });
    await fetchBranches();
    showToast(t.successUpdated, 'success');
  };

  const handleUpdateFaculty = async (item) => {
    const branchId = window.prompt(`${t.branch} ID`, item.branch_id || '');
    if (branchId === null) return;
    const name = window.prompt(t.name, item.name || '');
    if (name === null) return;
    await API.patch(`/admin/faculties/${item.id}`, { branch_id: Number(branchId), name });
    await fetchFaculties();
    showToast(t.successUpdated, 'success');
  };

  const handleUpdateDepartment = async (item) => {
    const branchId = window.prompt(`${t.branch} ID`, item.branch_id || '');
    if (branchId === null) return;
    const facultyId = window.prompt(`${t.faculty} ID`, item.faculty_id || '');
    if (facultyId === null) return;
    const name = window.prompt(t.name, item.name || '');
    if (name === null) return;
    await API.patch(`/admin/departments/${item.id}`, {
      branch_id: Number(branchId),
      faculty_id: facultyId ? Number(facultyId) : null,
      name
    });
    await fetchDepartments();
    showToast(t.successUpdated, 'success');
  };

  const handleUpdateCourse = async (item) => {
    const departmentId = window.prompt(`${t.department} ID`, item.department_id || '');
    if (departmentId === null) return;
    const name = window.prompt(t.name, item.name || '');
    if (name === null) return;
    const level = window.prompt(t.level, item.level || '');
    if (level === null) return;
    await API.patch(`/admin/courses/${item.id}`, { department_id: Number(departmentId), name, level });
    await fetchCourses();
    showToast(t.successUpdated, 'success');
  };

  const confirmDelete = (label) => window.confirm(`${t.deleteConfirm} ${label}?`);

  const handleDeleteResource = async ({ endpoint, label, refresh }) => {
    const ok = confirmDelete(label);
    if (!ok) return;
    await API.delete(endpoint);
    if (typeof refresh === 'function') {
      await refresh();
    }
    showToast(t.successDeleted, 'success');
  };

  const handleDeleteUniversity = (item) => handleDeleteResource({
    endpoint: `/admin/universities/${item.id}`,
    label: item.name || t.university,
    refresh: fetchUniversities
  });

  const handleDeleteBranch = (item) => handleDeleteResource({
    endpoint: `/admin/branches/${item.id}`,
    label: item.name || t.branch,
    refresh: fetchBranches
  });

  const handleDeleteFaculty = (item) => handleDeleteResource({
    endpoint: `/admin/faculties/${item.id}`,
    label: item.name || t.faculty,
    refresh: fetchFaculties
  });

  const handleDeleteDepartment = (item) => handleDeleteResource({
    endpoint: `/admin/departments/${item.id}`,
    label: item.name || t.department,
    refresh: fetchDepartments
  });

  const handleDeleteCourse = (item) => handleDeleteResource({
    endpoint: `/admin/courses/${item.id}`,
    label: item.name || t.courses,
    refresh: fetchCourses
  });

  const handleDeleteUser = async (item) => {
    const label = item.email || item.name || t.users;
    const ok = confirmDelete(label);
    if (!ok) return;
    try {
      await API.delete(`/admin/users/${item.id}`);
      await fetchUsers();
      showToast(t.successDeleted, 'success');
    } catch (err) {
      const message = String(err?.response?.data?.message || '');
      if (err?.response?.status === 409 && message.toLowerCase().includes('attempt')) {
        const forceOk = window.confirm(`${t.forceDeleteUserConfirm}\n${label}`);
        if (!forceOk) return;
        await API.delete(`/admin/users/${item.id}?force=true`);
        await fetchUsers();
        showToast(t.successDeleted, 'success');
        return;
      }
      throw err;
    }
  };

  const handleDeleteExam = (item) => handleDeleteResource({
    endpoint: `/admin/exams/${item.id}`,
    label: item.title || item.exam_code || t.exams,
    refresh: fetchExams
  });

  const handleForceSubmitAttempt = async (attempt) => {
    await API.patch(`/admin/attempts/${attempt.id}/force-submit`);
    await fetchAttempts();
    showToast(t.successForceSubmit, 'success');
  };
  const handleBulkForceSubmitAttempts = async () => {
    if (selectedAttemptIds.length === 0) return;
    await API.patch('/admin/attempts/bulk/force-submit', { attempt_ids: selectedAttemptIds });
    setSelectedAttemptIds([]);
    await fetchAttempts();
    showToast(t.successForceSubmit, 'success');
  };

  const sortItems = useCallback((items, tab) => {
    const mode = sortBy[tab] || 'id';
    const getName = (item) => (tab === 'exams' ? item.title : tab === 'attempts' || tab === 'violations' ? item.student_name : tab === 'auditLogs' ? item.action_type : item.name) || '';
    const getNewest = (item) => (tab === 'attempts' ? new Date(item.start_time || 0).getTime() : new Date(item.created_at || 0).getTime()) || Number(item.id || 0);
    const result = [...items];
    if (mode === 'id') return result.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
    if (mode === 'name') return result.sort((a, b) => String(getName(a)).localeCompare(String(getName(b))));
    return result.sort((a, b) => getNewest(b) - getNewest(a));
  }, [sortBy]);

  const sorted = {
    universities: sortItems(data.universities, 'universities'),
    branches: sortItems(data.branches, 'branches'),
    faculties: sortItems(data.faculties, 'faculties'),
    departments: sortItems(data.departments, 'departments'),
    courses: sortItems(data.courses, 'courses'),
    users: sortItems(data.users, 'users'),
    exams: sortItems(data.exams, 'exams'),
    attempts: sortItems(data.attempts, 'attempts'),
    violations: sortItems(data.violations, 'violations'),
    auditLogs: sortItems(data.auditLogs, 'auditLogs'),
  };

  const visibleUsers = data.users || [];
  const visibleExams = sorted.exams.filter((item) => {
    const q = search.exams.trim().toLowerCase();
    const hay = `${item.title || ''} ${item.exam_code || ''} ${item.teacher_name || ''}`.toLowerCase();
    return (filters.examsAccessMode === 'all' || item.access_mode === filters.examsAccessMode) && (!q || hay.includes(q));
  });
  const visibleAttempts = sorted.attempts.filter((item) => {
    const q = search.attempts.trim().toLowerCase();
    const status = !item.submit_time ? 'open' : item.forced_submit ? 'forced' : 'submitted';
    const hay = `${item.student_name || ''} ${item.student_email || ''} ${item.exam_title || ''} ${item.exam_code || ''}`.toLowerCase();
    return (filters.attemptsStatus === 'all' || filters.attemptsStatus === status) && (!q || hay.includes(q));
  });
  const visibleViolations = sorted.violations.filter((item) => !search.violations || `${item.student_name || ''} ${item.violation_type || ''} ${item.exam_title || ''} ${item.reason || ''}`.toLowerCase().includes(search.violations.toLowerCase()));
  const visibleAuditLogs = sorted.auditLogs.filter((item) => !search.auditLogs || `${item.admin_name || ''} ${item.action_type || ''} ${item.target_type || ''} ${item.details || ''}`.toLowerCase().includes(search.auditLogs.toLowerCase()));

  const styles = {
    card: { backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 14, boxShadow: colors.shadow, padding: 18 },
    table: { width: '100%', minWidth: isTablet ? 900 : '100%', borderCollapse: 'collapse', backgroundColor: 'transparent', border: 'none', tableLayout: 'fixed' },
    th: { backgroundColor: colors.cardBg2, color: colors.text, padding: '12px 15px', textAlign: 'left', fontSize: 13, borderBottom: `1px solid ${colors.border}`, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' },
    td: { padding: '12px 15px', fontSize: 13, color: colors.textMuted, borderBottom: `1px solid ${colors.border}`, verticalAlign: 'top', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere', overflow: 'hidden' },
    input: { width: '100%', padding: '11px 12px', backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 10, fontSize: 13, color: colors.inputText, outline: 'none', boxSizing: 'border-box' },
    row: (index) => ({ backgroundColor: isDark ? (index % 2 === 0 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)') : (index % 2 === 0 ? '#fff' : '#FBF9F6'), transition: 'background-color 180ms ease, transform 180ms ease, box-shadow 180ms ease' }),
    btn: (bg, fg) => ({ padding: '8px 10px', backgroundColor: bg, color: fg, border: `1px solid ${colors.border}`, borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }),
    actionsWrap: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, minWidth: 220, alignContent: 'start' },
    actionBtn: { padding: '8px 12px', borderRadius: 10, border: `1px solid ${colors.border}`, fontSize: 12, fontWeight: 'bold', cursor: 'pointer', transition: 'transform 120ms ease, box-shadow 120ms ease', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2, minHeight: 36, textAlign: 'center' },
    actionBtnPrimary: { backgroundColor: colors.btnPrimary, color: colors.btnPrimaryTxt },
    actionBtnNeutral: { backgroundColor: colors.cardBg2, color: colors.text },
    actionBtnSuccess: { backgroundColor: '#1f3f27', color: '#fff' },
    actionBtnDanger: { backgroundColor: '#7a1f1f', color: '#fff' },
    actionBtnWarn: { backgroundColor: '#6b4b2a', color: '#fff' },
    actionBtnDisabled: { opacity: 0.55, cursor: 'not-allowed' },
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 },
    modalCard: { width: 'min(720px, 92vw)', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, boxShadow: colors.shadow, padding: 20 },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
    modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16, flexWrap: 'wrap' },
    toastContainer: {
      position: 'fixed',
      bottom: 24,
      [isAr ? 'left' : 'right']: 24,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    },
    toastCard: (variant) => ({
      minWidth: 240,
      maxWidth: 360,
      padding: '10px 14px',
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
      backgroundColor: variant === 'error' ? '#5a1f1f' : variant === 'success' ? '#1f3f27' : colors.cardBg2,
      color: variant === 'info' ? colors.text : '#fff',
      boxShadow: colors.shadow,
      fontSize: 13,
      cursor: 'pointer',
    }),
    stickyHeaderCell: {
      position: 'sticky',
      [isAr ? 'left' : 'right']: 0,
      zIndex: 3,
      backgroundColor: colors.cardBg2,
      boxShadow: isAr ? '2px 0 8px rgba(0,0,0,0.04)' : '-2px 0 8px rgba(0,0,0,0.04)',
    },
    stickyCell: (bg) => ({
      position: 'sticky',
      [isAr ? 'left' : 'right']: 0,
      zIndex: 4,
      backgroundColor: isDark ? colors.cardBg : bg,
      backgroundClip: 'padding-box',
      boxShadow: isAr ? '2px 0 8px rgba(0,0,0,0.04)' : '-2px 0 8px rgba(0,0,0,0.04)',
    }),
  };

  const navItems = ['statistics', 'universities', 'branches', 'faculties', 'departments', 'courses', 'users', 'exams', 'attempts', 'violations', 'auditLogs'].map((key) => ({ key, label: t[key], active: activeTab === key, onClick: () => setActiveTab(key) }));
  const sortControl = (tab) => <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span style={{ color: colors.textMuted, fontSize: 13 }}>{t.sortBy}</span><select value={sortBy[tab] || 'id'} onChange={(e) => setSortBy((prev) => ({ ...prev, [tab]: e.target.value }))} style={{ ...styles.input, width: 160, padding: '8px 10px' }}><option value="id">{t.byId}</option><option value="name">{t.byName}</option><option value="newest">{t.byNewest}</option></select></div>;
  const searchInput = (key, placeholder) => <input value={search[key]} onChange={(e) => setSearch((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} style={{ ...styles.input, minWidth: isMobile ? '100%' : isTablet ? 170 : 260, width: isMobile ? '100%' : 'auto', flex: isMobile ? '1 1 100%' : 1, boxSizing: 'border-box' }} />;
  const renderTable = (heads, rows, options = {}) => (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div
        style={{
          minWidth: '100%',
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 14,
          boxShadow: colors.shadow,
          padding: 6,
        }}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              {heads.map((head, index) => {
                const stickyLast = options?.stickyLast && index === heads.length - 1;
                const stickyStyle = stickyLast ? styles.stickyHeaderCell : null;
                const width = options?.colWidths?.[index];
                return (
                  <th
                    key={String(head)}
                    style={{
                      ...styles.th,
                      ...stickyStyle,
                      width: width || 'auto',
                      minWidth: width || undefined,
                    }}
                  >
                    {head}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              if (!React.isValidElement(row)) return row;
              const baseBg = isDark ? (index % 2 === 0 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)') : (index % 2 === 0 ? '#fff' : '#FBF9F6');
              const hoverBg = isDark ? 'rgba(201,168,130,.10)' : '#F6EFE3';
              const stickyLast = options?.stickyLast;
              let children = row.props.children;
              if (stickyLast) {
                const childArray = React.Children.toArray(row.props.children);
                const lastIndex = childArray.length - 1;
                if (lastIndex >= 0 && React.isValidElement(childArray[lastIndex])) {
                  childArray[lastIndex] = React.cloneElement(childArray[lastIndex], {
                    style: { ...childArray[lastIndex].props.style, ...styles.stickyCell(baseBg) },
                  });
                }
                children = childArray;
              }
              return React.cloneElement(row, {
                ...row.props,
                children,
                onMouseEnter: (e) => {
                  row.props.onMouseEnter?.(e);
                  e.currentTarget.style.backgroundColor = hoverBg;
                },
                onMouseLeave: (e) => {
                  row.props.onMouseLeave?.(e);
                  e.currentTarget.style.backgroundColor = baseBg;
                },
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
  const roleFilter = <select value={filters.usersRole} onChange={(e) => setFilters((prev) => ({ ...prev, usersRole: e.target.value }))} style={{ ...styles.input, width: 170 }}><option value="all">{t.allRoles}</option><option value="student">{t.student}</option><option value="teacher">{t.teacher}</option><option value="admin">{t.adminRole}</option></select>;
  const academicFilter = <select value={filters.usersAcademic} onChange={(e) => setFilters((prev) => ({ ...prev, usersAcademic: e.target.value }))} style={{ ...styles.input, width: 190 }}><option value="all">{t.allAcademicStates}</option><option value="academic">{t.academicOnly}</option><option value="pending">{t.pendingOnly}</option></select>;
  const examFilter = <select value={filters.examsAccessMode} onChange={(e) => setFilters((prev) => ({ ...prev, examsAccessMode: e.target.value }))} style={{ ...styles.input, width: 170 }}><option value="all">{t.allAccessModes}</option><option value="department">department</option><option value="link">link</option></select>;
  const attemptsFilter = <select value={filters.attemptsStatus} onChange={(e) => setFilters((prev) => ({ ...prev, attemptsStatus: e.target.value }))} style={{ ...styles.input, width: 170 }}><option value="all">{t.allStatuses}</option><option value="open">{t.open}</option><option value="submitted">{t.submitted}</option><option value="forced">{t.forced}</option></select>;
  const statusLabel = (item) => (!item.submit_time ? t.open : item.forced_submit ? t.forced : t.submitted);
  const profileLabel = (item) => {
    if (item.role === 'admin') return '-';
    const mode = String(item.profile_mode || '').toLowerCase();
    if (mode === 'academic') return t.academic;
    if (mode === 'independent') return t.independent;
    return item?.department_id ? t.academic : t.independent;
  };

  const isAcademicAccount = (item) => {
    const role = String(item?.role || '').toLowerCase();
    if (!['teacher', 'student'].includes(role)) return false;
    const mode = String(item?.profile_mode || '').toLowerCase();
    if (mode) return mode === 'academic';
    return Boolean(item?.department_id);
  };
  const editDraft = editingUserDraft || {
    role: 'student',
    university_id: '',
    branch_id: '',
    faculty_id: '',
    department_id: '',
    profile_mode: '',
  };
  const editModalBranches = sorted.branches.filter((branch) => !editDraft.university_id || String(branch.university_id) === String(editDraft.university_id));
  const editModalFaculties = sorted.faculties.filter((faculty) => !editDraft.branch_id || String(faculty.branch_id) === String(editDraft.branch_id));
  const editModalDepartments = sorted.departments.filter((department) => {
    if (editDraft.faculty_id) return String(department.faculty_id || '') === String(editDraft.faculty_id);
    if (editDraft.branch_id) return String(department.branch_id || '') === String(editDraft.branch_id);
    if (editDraft.university_id) return String(department.university_id || '') === String(editDraft.university_id);
    return true;
  });
  const courseBranches = useMemo(() => (
    sorted.branches.filter((branch) => !forms.course.university_id || String(branch.university_id) === String(forms.course.university_id))
  ), [forms.course.university_id, sorted.branches]);
  const courseDepartments = useMemo(() => (
    sorted.departments.filter((department) => !forms.course.branch_id || String(department.branch_id) === String(forms.course.branch_id))
  ), [forms.course.branch_id, sorted.departments]);
  const departmentFaculties = useMemo(() => (
    sorted.faculties.filter((faculty) => !forms.department.branch_id || String(faculty.branch_id) === String(forms.department.branch_id))
  ), [forms.department.branch_id, sorted.faculties]);
  const facultyBranches = useMemo(() => (
    sorted.branches.filter((branch) => !forms.faculty.university_id || String(branch.university_id) === String(forms.faculty.university_id))
  ), [forms.faculty.university_id, sorted.branches]);
  const departmentBranches = useMemo(() => (
    sorted.branches.filter((branch) => !forms.department.university_id || String(branch.university_id) === String(forms.department.university_id))
  ), [forms.department.university_id, sorted.branches]);
  const userBranches = useMemo(() => (
    sorted.branches.filter((branch) => !forms.user.university_id || String(branch.university_id) === String(forms.user.university_id))
  ), [forms.user.university_id, sorted.branches]);
  const userFaculties = useMemo(() => (
    sorted.faculties.filter((faculty) => !forms.user.branch_id || String(faculty.branch_id) === String(forms.user.branch_id))
  ), [forms.user.branch_id, sorted.faculties]);
  const userDepartments = useMemo(() => (
    sorted.departments.filter((department) => {
      if (forms.user.faculty_id) return String(department.faculty_id || '') === String(forms.user.faculty_id);
      if (forms.user.branch_id) return String(department.branch_id || '') === String(forms.user.branch_id);
      if (forms.user.university_id) return String(department.university_id || '') === String(forms.user.university_id);
      return true;
    })
  ), [forms.user.faculty_id, forms.user.branch_id, forms.user.university_id, sorted.departments]);
  const fmt = (value) => (value ? new Date(value).toLocaleString(isAr ? 'ar-EG' : 'en-US') : '-');
  const escapeCell = (value) => String(value ?? '-').replace(/"/g, '""');
  const escapeHtml = (value) => String(value ?? '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
  const adminExportData = {
    universities: { columns: ['ID', t.name, t.country], rows: sorted.universities.map((item) => [item.id, item.name, item.country || '-']) },
    branches: { columns: ['ID', t.name, t.university, t.city], rows: sorted.branches.map((item) => [item.id, item.name, item.university_name || '-', item.city || '-']) },
    faculties: { columns: ['ID', t.name, t.branch, t.university], rows: sorted.faculties.map((item) => [item.id, item.name, item.branch_name || '-', item.university_name || '-']) },
    departments: { columns: ['ID', t.name, t.faculty, t.branch, t.university], rows: sorted.departments.map((item) => [item.id, item.name, item.faculty_name || '-', item.branch_name || '-', item.university_name || '-']) },
    courses: { columns: ['ID', t.name, t.university, t.branch, t.faculty, t.department, t.level], rows: sorted.courses.map((item) => [item.id, item.name, item.university_name || '-', item.branch_name || '-', item.faculty_name || '-', item.department_name || '-', item.level || '-']) },
    users: { columns: ['ID', t.name, t.email, t.role, t.accountType, t.university, t.branch, t.faculty, t.department, t.accountState], rows: visibleUsers.map((item) => [item.id, item.name, item.email, item.role, profileLabel(item), item.university_name || t.noUniversity, item.branch_name || '-', item.faculty_name || '-', item.department_name || t.noDepartment, item.is_active ? t.active : t.inactive]) },
    exams: { columns: ['ID', t.examTitle, t.examCode, t.accessMode, t.teacher, t.questions, t.attemptsCount, t.start, t.end], rows: visibleExams.map((item) => [item.id, item.title, item.exam_code || '-', item.access_mode, item.teacher_name || '-', item.question_count ?? 0, item.attempt_count ?? 0, fmt(item.start_date), fmt(item.end_date)]) },
    attempts: { columns: ['ID', t.name, t.email, t.examTitle, t.examCode, t.score, t.status, t.start, t.submitTime], rows: visibleAttempts.map((item) => [item.id, item.student_name, item.student_email, item.exam_title, item.exam_code || '-', item.score ?? 0, statusLabel(item), fmt(item.start_time), fmt(item.submit_time)]) },
    violations: { columns: ['ID', t.name, t.examTitle, t.examCode, t.type, t.count, t.reason, t.createdAt], rows: visibleViolations.map((item) => [item.id, item.student_name, item.exam_title || '-', item.exam_code || '-', item.violation_type, item.count ?? 0, item.reason || '-', fmt(item.created_at)]) },
    auditLogs: { columns: ['ID', t.actor, t.email, t.actions, t.target, 'Target ID', t.details, t.createdAt], rows: visibleAuditLogs.map((item) => [item.id, item.admin_name || '-', item.admin_email || '-', item.action_type, item.target_type, item.target_id ?? '-', item.details || '-', fmt(item.created_at)]) },
  };
  const exportButtons = (key) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button type="button" onClick={() => exportCsv(`admin-${key}`, adminExportData[key].columns, adminExportData[key].rows)} style={styles.btn(colors.cardBg2, colors.text)}>{t.exportCsv}</button>
      <button type="button" onClick={() => exportExcel(`admin-${key}`, adminExportData[key].columns, adminExportData[key].rows)} style={styles.btn(colors.cardBg2, colors.text)}>{t.exportExcel}</button>
    </div>
  );
  const pageSize = 10;
  const paginate = (items, key) => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const current = Math.min(pages[key] || 1, totalPages);
    const startIndex = (current - 1) * pageSize;
    return { items: items.slice(startIndex, startIndex + pageSize), current, totalPages };
  };
  const paged = {
    universities: paginate(sorted.universities, 'universities'),
    branches: paginate(sorted.branches, 'branches'),
    faculties: paginate(sorted.faculties, 'faculties'),
    departments: paginate(sorted.departments, 'departments'),
    courses: paginate(sorted.courses, 'courses'),
    users: {
      items: visibleUsers,
      current: usersMeta.page || (pages.users || 1),
      totalPages: Math.max(1, Math.ceil((usersMeta.total || visibleUsers.length) / pageSize)),
    },
    exams: paginate(visibleExams, 'exams'),
    attempts: paginate(visibleAttempts, 'attempts'),
    violations: paginate(visibleViolations, 'violations'),
    auditLogs: paginate(visibleAuditLogs, 'auditLogs'),
  };
  const renderPagination = (key) => {
    const meta = paged[key];
    if (!meta || meta.totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
        <span style={{ color: colors.textMuted, fontSize: 13 }}>{`${t.page} ${meta.current} / ${meta.totalPages}`}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setPages((prev) => ({ ...prev, [key]: Math.max(1, meta.current - 1) }))} disabled={meta.current === 1} style={{ ...styles.btn(colors.cardBg2, colors.text), opacity: meta.current === 1 ? 0.6 : 1 }}>
            {t.previous}
          </button>
          <button type="button" onClick={() => setPages((prev) => ({ ...prev, [key]: Math.min(meta.totalPages, meta.current + 1) }))} disabled={meta.current === meta.totalPages} style={{ ...styles.btn(colors.cardBg2, colors.text), opacity: meta.current === meta.totalPages ? 0.6 : 1 }}>
            {t.next}
          </button>
        </div>
      </div>
    );
  };
  const toggleSelectedUser = (userId) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };
  const toggleSelectAllVisibleUsers = () => {
    const visibleIds = paged.users.items.map((item) => item.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedUserIds.includes(id));
    setSelectedUserIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return [...new Set([...prev, ...visibleIds])];
    });
  };
  const toggleSelectedAttempt = (attemptId) => {
    setSelectedAttemptIds((prev) => (prev.includes(attemptId) ? prev.filter((id) => id !== attemptId) : [...prev, attemptId]));
  };
  const toggleSelectAllVisibleAttempts = () => {
    const visibleIds = paged.attempts.items.filter((item) => !item.submit_time).map((item) => item.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedAttemptIds.includes(id));
    setSelectedAttemptIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return [...new Set([...prev, ...visibleIds])];
    });
  };

  return (
    <DashboardLayout navItems={navItems} interactiveNav>
      <div style={{ marginBottom: 18, color: colors.textMuted, fontSize: 13 }}>{user?.name ? `${t.welcome} ${user.name}` : t.admin}</div>
      {activeTab === 'statistics' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>{data.statistics && [['totalUsers', data.statistics.total_users, isDark ? '#8ab4f8' : '#2C3E6B'], ['totalExams', data.statistics.total_exams, '#4A8050'], ['totalUniversities', data.statistics.total_universities, colors.accent], ['totalAttempts', data.statistics.total_attempts, '#c0392b'], ['totalTeachers', data.statistics.total_teachers, '#7c3aed'], ['totalStudents', data.statistics.total_students, '#0f766e'], ['activeAttempts', data.statistics.active_attempts, '#d97706'], ['forcedSubmits', data.statistics.forced_submits, '#dc2626'], ['totalViolations', data.statistics.total_violations, '#b45309']].map(([key, value, color]) => <div key={key} style={{ ...styles.card, transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease', cursor: 'default' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isDark ? '0 14px 28px rgba(0,0,0,.24)' : '0 16px 30px rgba(139,107,74,.12)'; e.currentTarget.style.borderColor = colors.accent; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = colors.shadow; e.currentTarget.style.borderColor = colors.border; }}><div style={{ color, fontSize: 30, fontWeight: 'bold' }}>{value}</div><div style={{ color: colors.textMuted, marginTop: 6, fontSize: 13 }}>{t[key]}</div></div>)}</div>}
      {activeTab === 'universities' && <div style={styles.card}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>{sortControl('universities')}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{exportButtons('universities')}<button type="button" onClick={() => setShowForm(showForm === 'university' ? '' : 'university')} style={styles.btn(colors.accent, colors.primaryBtnText)}>{showForm === 'university' ? t.hideForm : t.addUniversity}</button></div></div>{showForm === 'university' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}><input value={forms.university.name} onChange={(e) => setForm('university', { name: e.target.value })} placeholder={t.name} style={styles.input} /><input value={forms.university.country} onChange={(e) => setForm('university', { country: e.target.value })} placeholder={t.country} style={styles.input} /><button type="button" disabled={saving} onClick={() => submitCreate('/admin/universities', forms.university, 'university', { name: '', country: '' })} style={styles.btn(colors.accent, colors.primaryBtnText)}>{t.addUniversity}</button></div>}{renderTable(['ID', t.name, t.country, t.actions], paged.universities.items.map((item, index) => <tr key={item.id} style={styles.row(index)}><td style={styles.td}>{item.id}</td><td style={{ ...styles.td, color: colors.text }}>{item.name}</td><td style={styles.td}>{item.country || '-'}</td><td style={styles.td}><div style={styles.actionsWrap}><button type="button" onClick={async () => { try { await handleUpdateUniversity(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnNeutral }}>{t.editUser}</button><button type="button" onClick={async () => { try { await handleDeleteUniversity(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}>{t.delete}</button></div></td></tr>), { stickyLast: true, colWidths: [60, 220, 180, 220] })}{renderPagination('universities')}</div>}
      {activeTab === 'branches' && <div style={styles.card}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>{sortControl('branches')}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{exportButtons('branches')}<button type="button" onClick={() => setShowForm(showForm === 'branch' ? '' : 'branch')} style={styles.btn(colors.accent, colors.primaryBtnText)}>{showForm === 'branch' ? t.hideForm : t.addBranch}</button></div></div>{showForm === 'branch' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}><select value={forms.branch.university_id} onChange={(e) => setForm('branch', { university_id: e.target.value })} style={styles.input}><option value="">{t.university}</option>{sorted.universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select><input value={forms.branch.name} onChange={(e) => setForm('branch', { name: e.target.value })} placeholder={t.name} style={styles.input} /><input value={forms.branch.city} onChange={(e) => setForm('branch', { city: e.target.value })} placeholder={t.city} style={styles.input} /><button type="button" disabled={saving || !forms.branch.university_id} onClick={() => submitCreate('/admin/branches', { ...forms.branch, university_id: Number(forms.branch.university_id) }, 'branch', { university_id: '', name: '', city: '' })} style={styles.btn(colors.accent, colors.primaryBtnText)}>{t.addBranch}</button></div>}{renderTable(['ID', t.name, t.university, t.city, t.actions], paged.branches.items.map((item, index) => <tr key={item.id} style={styles.row(index)}><td style={styles.td}>{item.id}</td><td style={{ ...styles.td, color: colors.text }}>{item.name}</td><td style={styles.td}>{item.university_name || '-'}</td><td style={styles.td}>{item.city || '-'}</td><td style={styles.td}><div style={styles.actionsWrap}><button type="button" onClick={async () => { try { await handleUpdateBranch(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnNeutral }}>{t.editUser}</button><button type="button" onClick={async () => { try { await handleDeleteBranch(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}>{t.delete}</button></div></td></tr>), { stickyLast: true, colWidths: [60, 200, 200, 140, 220] })}{renderPagination('branches')}</div>}
      {activeTab === 'faculties' && <div style={styles.card}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>{sortControl('faculties')}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{exportButtons('faculties')}<button type="button" onClick={() => setShowForm(showForm === 'faculty' ? '' : 'faculty')} style={styles.btn(colors.accent, colors.primaryBtnText)}>{showForm === 'faculty' ? t.hideForm : t.addFaculty}</button></div></div>{showForm === 'faculty' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}><select value={forms.faculty.university_id} onChange={(e) => setForm('faculty', { university_id: e.target.value, branch_id: '' })} style={styles.input}><option value="">{t.university}</option>{sorted.universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select><select value={forms.faculty.branch_id} onChange={(e) => setForm('faculty', { branch_id: e.target.value })} style={styles.input} disabled={!forms.faculty.university_id}><option value="">{t.branch}</option>{facultyBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select><input value={forms.faculty.name} onChange={(e) => setForm('faculty', { name: e.target.value })} placeholder={t.name} style={styles.input} /><button type="button" disabled={saving || !forms.faculty.branch_id} onClick={() => submitCreate('/admin/faculties', { branch_id: Number(forms.faculty.branch_id), name: forms.faculty.name }, 'faculty', { university_id: '', branch_id: '', name: '' })} style={styles.btn(colors.accent, colors.primaryBtnText)}>{t.addFaculty}</button></div>}{renderTable(['ID', t.name, t.branch, t.university, t.actions], paged.faculties.items.map((item, index) => <tr key={item.id} style={styles.row(index)}><td style={styles.td}>{item.id}</td><td style={{ ...styles.td, color: colors.text }}>{item.name}</td><td style={styles.td}>{item.branch_name || '-'}</td><td style={styles.td}>{item.university_name || '-'}</td><td style={styles.td}><div style={styles.actionsWrap}><button type="button" onClick={async () => { try { await handleUpdateFaculty(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnNeutral }}>{t.editUser}</button><button type="button" onClick={async () => { try { await handleDeleteFaculty(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}>{t.delete}</button></div></td></tr>), { stickyLast: true, colWidths: [60, 200, 180, 200, 220] })}{renderPagination('faculties')}</div>}
      {activeTab === 'departments' && <div style={styles.card}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>{sortControl('departments')}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{exportButtons('departments')}<button type="button" onClick={() => setShowForm(showForm === 'department' ? '' : 'department')} style={styles.btn(colors.accent, colors.primaryBtnText)}>{showForm === 'department' ? t.hideForm : t.addDepartment}</button></div></div>{showForm === 'department' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}><select value={forms.department.university_id} onChange={(e) => setForm('department', { university_id: e.target.value, branch_id: '', faculty_id: '' })} style={styles.input}><option value="">{t.university}</option>{sorted.universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select><select value={forms.department.branch_id} onChange={(e) => setForm('department', { branch_id: e.target.value, faculty_id: '' })} style={styles.input} disabled={!forms.department.university_id}><option value="">{t.branch}</option>{departmentBranches.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select><select value={forms.department.faculty_id} onChange={(e) => setForm('department', { faculty_id: e.target.value })} style={styles.input} disabled={!forms.department.branch_id}><option value="">{t.faculty}</option>{departmentFaculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}</select><input value={forms.department.name} onChange={(e) => setForm('department', { name: e.target.value })} placeholder={t.name} style={styles.input} /><button type="button" disabled={saving || !forms.department.branch_id} onClick={() => submitCreate('/admin/departments', { branch_id: Number(forms.department.branch_id), faculty_id: forms.department.faculty_id ? Number(forms.department.faculty_id) : null, name: forms.department.name }, 'department', { university_id: '', branch_id: '', faculty_id: '', name: '' })} style={styles.btn(colors.accent, colors.primaryBtnText)}>{t.addDepartment}</button></div>}{renderTable(['ID', t.name, t.faculty, t.branch, t.university, t.actions], paged.departments.items.map((item, index) => <tr key={item.id} style={styles.row(index)}><td style={styles.td}>{item.id}</td><td style={{ ...styles.td, color: colors.text }}>{item.name}</td><td style={styles.td}>{item.faculty_name || '-'}</td><td style={styles.td}>{item.branch_name || '-'}</td><td style={styles.td}>{item.university_name || '-'}</td><td style={styles.td}><div style={styles.actionsWrap}><button type="button" onClick={async () => { try { await handleUpdateDepartment(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnNeutral }}>{t.editUser}</button><button type="button" onClick={async () => { try { await handleDeleteDepartment(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}>{t.delete}</button></div></td></tr>), { stickyLast: true, colWidths: [60, 200, 180, 180, 200, 220] })}{renderPagination('departments')}</div>}
      {activeTab === 'courses' && <div style={styles.card}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>{sortControl('courses')}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{exportButtons('courses')}<button type="button" onClick={() => setShowForm(showForm === 'course' ? '' : 'course')} style={styles.btn(colors.accent, colors.primaryBtnText)}>{showForm === 'course' ? t.hideForm : t.addCourse}</button></div></div>{showForm === 'course' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}><select value={forms.course.university_id} onChange={(e) => setForm('course', { university_id: e.target.value, branch_id: '', department_id: '' })} style={styles.input}><option value="">{t.university}</option>{sorted.universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select><select value={forms.course.branch_id} onChange={(e) => setForm('course', { branch_id: e.target.value, department_id: '' })} style={styles.input} disabled={!forms.course.university_id}><option value="">{t.branch}</option>{courseBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select><select value={forms.course.department_id} onChange={(e) => setForm('course', { department_id: e.target.value })} style={styles.input} disabled={!forms.course.branch_id}><option value="">{t.department}</option>{courseDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select><input value={forms.course.name} onChange={(e) => setForm('course', { name: e.target.value })} placeholder={t.name} style={styles.input} /><input value={forms.course.level} onChange={(e) => setForm('course', { level: e.target.value })} placeholder={t.level} style={styles.input} /><button type="button" disabled={saving || !forms.course.department_id} onClick={() => submitCreate('/admin/courses', { department_id: Number(forms.course.department_id), name: forms.course.name, level: forms.course.level }, 'course', { university_id: '', branch_id: '', department_id: '', name: '', level: '' })} style={styles.btn(colors.accent, colors.primaryBtnText)}>{t.addCourse}</button></div>}{renderTable(['ID', t.name, t.university, t.branch, t.faculty, t.department, t.level, t.actions], paged.courses.items.map((item, index) => <tr key={item.id} style={styles.row(index)}><td style={styles.td}>{item.id}</td><td style={{ ...styles.td, color: colors.text }}>{item.name}</td><td style={styles.td}>{item.university_name || '-'}</td><td style={styles.td}>{item.branch_name || '-'}</td><td style={styles.td}>{item.faculty_name || '-'}</td><td style={styles.td}>{item.department_name || '-'}</td><td style={styles.td}>{item.level || '-'}</td><td style={styles.td}><div style={styles.actionsWrap}><button type="button" onClick={async () => { try { await handleUpdateCourse(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnNeutral }}>{t.editUser}</button><button type="button" onClick={async () => { try { await handleDeleteCourse(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}>{t.delete}</button></div></td></tr>), { stickyLast: true, colWidths: [60, 180, 180, 160, 160, 160, 120, 220] })}{renderPagination('courses')}</div>}
      {activeTab === 'users' && <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {sortControl('users')}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {exportButtons('users')}
            <button type="button" onClick={() => setShowForm(showForm === 'user' ? '' : 'user')} style={styles.btn(colors.accent, colors.primaryBtnText)}>{showForm === 'user' ? t.hideForm : t.addUser}</button>
          </div>
        </div>
        {showForm === 'user' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
            <input value={forms.user.name} onChange={(e) => setForm('user', { name: e.target.value })} placeholder={t.name} style={styles.input} />
            <input value={forms.user.email} onChange={(e) => setForm('user', { email: e.target.value })} placeholder={t.email} style={styles.input} />
            <input value={forms.user.password} onChange={(e) => setForm('user', { password: e.target.value })} placeholder={t.password} style={styles.input} />
            <select value={forms.user.role} onChange={(e) => setForm('user', { role: e.target.value })} style={styles.input}>
              <option value="student">{t.student}</option>
              <option value="teacher">{t.teacher}</option>
              <option value="admin">{t.adminRole}</option>
            </select>
            <select value={forms.user.university_id} onChange={(e) => setForm('user', { university_id: e.target.value, branch_id: '', faculty_id: '', department_id: '' })} style={styles.input}>
              <option value="">{t.university}</option>
              {sorted.universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={forms.user.branch_id} onChange={(e) => setForm('user', { branch_id: e.target.value, faculty_id: '', department_id: '' })} style={styles.input} disabled={!forms.user.university_id}>
              <option value="">{t.branch}</option>
              {userBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
            <select value={forms.user.faculty_id} onChange={(e) => setForm('user', { faculty_id: e.target.value, department_id: '' })} style={styles.input} disabled={!forms.user.branch_id}>
              <option value="">{t.faculty}</option>
              {userFaculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
            </select>
            <select value={forms.user.department_id} onChange={(e) => setForm('user', { department_id: e.target.value })} style={styles.input} disabled={!forms.user.branch_id}>
              <option value="">{t.department}</option>
              {userDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            {['teacher', 'student'].includes(forms.user.role) && <select value={forms.user.profile_mode} onChange={(e) => setForm('user', { profile_mode: e.target.value })} style={styles.input}><option value="">{t.accountType}</option><option value="academic">{t.academic}</option><option value="independent">{t.independent}</option></select>}
            <button
              type="button"
              disabled={saving}
              onClick={() => submitCreate('/admin/users', {
                ...forms.user,
                university_id: forms.user.university_id ? Number(forms.user.university_id) : null,
                department_id: forms.user.department_id ? Number(forms.user.department_id) : null,
                profile_mode: ['teacher', 'student'].includes(forms.user.role) ? (forms.user.profile_mode || null) : null,
              }, 'user', { name: '', email: '', password: '', role: 'student', university_id: '', branch_id: '', faculty_id: '', department_id: '', profile_mode: '' })}
              style={styles.btn(colors.accent, colors.primaryBtnText)}
            >
              {t.createUser}
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>{searchInput('users', t.searchUsers)}{roleFilter}{academicFilter}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ color: colors.textMuted, fontSize: 13 }}>{`${t.selectedCount}: ${selectedUserIds.length}`}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" disabled={selectedUserIds.length === 0} onClick={async () => { try { await handleBulkUserStatus(true); } catch (err) { notifyError(err); } }} style={{ ...styles.btn('#1f3f27', '#fff'), opacity: selectedUserIds.length === 0 ? 0.6 : 1 }}>{t.activateSelected}</button>
            <button type="button" disabled={selectedUserIds.length === 0} onClick={async () => { try { await handleBulkUserStatus(false); } catch (err) { notifyError(err); } }} style={{ ...styles.btn('#3f1f1f', '#fff'), opacity: selectedUserIds.length === 0 ? 0.6 : 1 }}>{t.deactivateSelected}</button>
            <button type="button" disabled={selectedUserIds.length === 0} onClick={async () => { try { await handleBulkAcademicVerification(true); } catch (err) { notifyError(err); } }} style={{ ...styles.btn('#1f3f27', '#fff'), opacity: selectedUserIds.length === 0 ? 0.6 : 1 }}>{t.verifySelected}</button>
            <button type="button" disabled={selectedUserIds.length === 0} onClick={async () => { try { await handleBulkAcademicVerification(false); } catch (err) { notifyError(err); } }} style={{ ...styles.btn('#3f1f1f', '#fff'), opacity: selectedUserIds.length === 0 ? 0.6 : 1 }}>{t.unverifySelected}</button>
          </div>
        </div>
          {renderTable([
            <input key="select-all" type="checkbox" checked={paged.users.items.length > 0 && paged.users.items.every((item) => selectedUserIds.includes(item.id))} onChange={toggleSelectAllVisibleUsers} />,
            'ID', t.name, t.email, t.role, t.accountType, t.university, t.branch, t.faculty, t.department, t.accountState, t.actions,
          ], paged.users.items.map((item, index) => {
            return (
              <tr key={item.id} style={styles.row(index)}>
                <td style={styles.td}><input type="checkbox" checked={selectedUserIds.includes(item.id)} onChange={() => toggleSelectedUser(item.id)} /></td>
                <td style={styles.td}>{item.id}</td>
                <td style={{ ...styles.td, color: colors.text }}>{item.name}</td>
                <td style={styles.td}>{item.email}</td>
                <td style={styles.td}>{item.role}</td>
                <td style={{ ...styles.td, minWidth: 240, maxWidth: 260, wordBreak: 'break-word', whiteSpace: 'normal' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>{profileLabel(item)}</span>
                    {isAcademicAccount(item) && (
                    <span style={{ padding: '3px 8px', borderRadius: 999, backgroundColor: item.academic_verified ? 'rgba(30,107,62,.15)' : 'rgba(227,164,74,.18)', color: item.academic_verified ? '#1e6b3e' : '#a46a11', fontSize: 11, fontWeight: 'bold', border: `1px solid ${colors.border}` }}>
                      {item.academic_verified ? t.academicVerified : t.academicPending}
                    </span>
                  )}
                </div>
              </td>
                <td style={{ ...styles.td, maxWidth: 180, wordBreak: 'break-word', whiteSpace: 'normal' }}>{item.university_name || t.noUniversity}</td>
                <td style={{ ...styles.td, maxWidth: 140, wordBreak: 'break-word', whiteSpace: 'normal' }}>{item.branch_name || '-'}</td>
                <td style={{ ...styles.td, maxWidth: 140, wordBreak: 'break-word', whiteSpace: 'normal' }}>{item.faculty_name || '-'}</td>
                <td style={{ ...styles.td, maxWidth: 140, wordBreak: 'break-word', whiteSpace: 'normal' }}>{item.department_name || t.noDepartment}</td>
                <td style={styles.td}><span style={{ padding: '4px 10px', borderRadius: 999, backgroundColor: item.is_active ? 'rgba(74, 128, 80, 0.18)' : 'rgba(192, 57, 43, 0.18)', color: item.is_active ? '#4A8050' : '#c0392b', fontSize: 12, fontWeight: 'bold', display: 'inline-block' }}>{item.is_active ? t.active : t.inactive}</span></td>
                  <td style={{ ...styles.td, minWidth: 260 }}>
                    <div style={styles.actionsWrap}>
                    <button type="button" onClick={() => beginUserEdit(item)} style={{ ...styles.actionBtn, ...styles.actionBtnNeutral }}>
                      {t.editUser}
                    </button>
                  <button type="button" onClick={async () => { try { await handleResetPassword(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnWarn }}>
                    {t.resetPassword}
                  </button>
                  {(() => {
                    const canAcademic = isAcademicAccount(item);
                    const isVerified = Boolean(item.academic_verified);
                    const verifyDisabled = !canAcademic || isVerified;
                    const unverifyDisabled = !canAcademic || !isVerified;
                    return (
                      <>
                        <button
                          type="button"
                          disabled={false}
                          title={!canAcademic ? t.notAcademic : isVerified ? t.alreadyVerified : ''}
                          onClick={async () => {
                            if (!canAcademic) {
                              showToast(t.notAcademic, 'info');
                              return;
                            }
                            if (isVerified) {
                              showToast(t.alreadyVerified, 'info');
                              return;
                            }
                            const ok = window.confirm(t.verifyConfirm);
                            if (!ok) return;
                            try {
                              await handleSetAcademicVerification(item, true);
                            } catch (err) {
                              notifyError(err);
                            }
                          }}
                          style={{
                            ...styles.actionBtn,
                            ...styles.actionBtnSuccess,
                            ...(verifyDisabled ? styles.actionBtnDisabled : null),
                          }}
                        >
                          {t.verifyAcademic}
                        </button>
                        <button
                          type="button"
                          disabled={false}
                          title={!canAcademic ? t.notAcademic : !isVerified ? t.alreadyUnverified : ''}
                          onClick={async () => {
                            if (!canAcademic) {
                              showToast(t.notAcademic, 'info');
                              return;
                            }
                            if (!isVerified) {
                              showToast(t.alreadyUnverified, 'info');
                              return;
                            }
                            const ok = window.confirm(t.unverifyConfirm);
                            if (!ok) return;
                            try {
                              await handleSetAcademicVerification(item, false);
                            } catch (err) {
                              notifyError(err);
                            }
                          }}
                          style={{
                            ...styles.actionBtn,
                            ...styles.actionBtnDanger,
                            ...(unverifyDisabled ? styles.actionBtnDisabled : null),
                          }}
                        >
                          {t.unverifyAcademic}
                        </button>
                      </>
                    );
                  })()}
                  <button type="button" onClick={async () => { try { await handleToggleUserStatus(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...(item.is_active ? styles.actionBtnDanger : styles.actionBtnSuccess) }}>
                    {item.is_active ? t.deactivate : t.activate}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await handleDeleteUser(item);
                      } catch (err) {
                        notifyError(err);
                      }
                    }}
                    style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}
                  >
                    {t.delete}
                  </button>
                </div>
              </td>
            </tr>
          );
        }), {
          stickyLast: true,
          colWidths: [
            36, 60, 140, 200, 90, 240, 180, 140, 140, 140, 140, 260,
          ],
        })}
        {renderPagination('users')}
      </div>}
      {activeTab === 'exams' && <div style={styles.card}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>{sortControl('exams')}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{exportButtons('exams')}<button type="button" onClick={refreshActiveTab} style={styles.btn(colors.cardBg2, colors.text)}>{t.refresh}</button></div></div><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>{searchInput('exams', t.searchExams)}{examFilter}</div>{renderTable(['ID', t.examTitle, t.examCode, t.accessMode, t.teacher, t.questions, t.attemptsCount, t.start, t.end, t.actions], paged.exams.items.map((item, index) => <tr key={item.id} style={styles.row(index)}><td style={styles.td}>{item.id}</td><td style={{ ...styles.td, color: colors.text }}>{item.title}</td><td style={styles.td}>{item.exam_code || '-'}</td><td style={styles.td}>{item.access_mode}</td><td style={styles.td}>{item.teacher_name || '-'}</td><td style={styles.td}>{item.question_count ?? 0}</td><td style={styles.td}>{item.attempt_count ?? 0}</td><td style={styles.td}>{fmt(item.start_date)}</td><td style={styles.td}>{fmt(item.end_date)}</td><td style={styles.td}><div style={styles.actionsWrap}><button type="button" onClick={async () => { try { await handleUpdateExam(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnNeutral }}>{t.updateExam}</button><button type="button" onClick={async () => { try { await handleDeleteExam(item); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}>{t.delete}</button></div></td></tr>), { stickyLast: true, colWidths: [60, 220, 160, 120, 180, 90, 110, 140, 140, 240] })}{renderPagination('exams')}</div>}
      {activeTab === 'attempts' && <div style={styles.card}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>{sortControl('attempts')}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{exportButtons('attempts')}<button type="button" onClick={refreshActiveTab} style={styles.btn(colors.cardBg2, colors.text)}>{t.refresh}</button></div></div><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>{searchInput('attempts', t.searchAttempts)}{attemptsFilter}</div><div style={{ color: colors.textMuted, fontSize: 13, marginBottom: 10 }}>{t.openAttemptsOnly}</div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}><span style={{ color: colors.textMuted, fontSize: 13 }}>{`${t.selectedCount}: ${selectedAttemptIds.length}`}</span><button type="button" disabled={selectedAttemptIds.length === 0} onClick={async () => { try { await handleBulkForceSubmitAttempts(); } catch (err) { notifyError(err); } }} style={{ ...styles.btn('#7a1f1f', '#fff'), opacity: selectedAttemptIds.length === 0 ? 0.6 : 1 }}>{t.forceSubmitSelected}</button></div>{renderTable([<input key="select-all-attempts" type="checkbox" checked={paged.attempts.items.filter((item) => !item.submit_time).length > 0 && paged.attempts.items.filter((item) => !item.submit_time).every((item) => selectedAttemptIds.includes(item.id))} onChange={toggleSelectAllVisibleAttempts} />, 'ID', t.name, t.email, t.examTitle, t.examCode, t.score, t.status, t.start, t.submitTime, t.actions], paged.attempts.items.map((item, index) => <tr key={item.id} style={styles.row(index)}><td style={styles.td}>{!item.submit_time ? <input type="checkbox" checked={selectedAttemptIds.includes(item.id)} onChange={() => toggleSelectedAttempt(item.id)} /> : null}</td><td style={styles.td}>{item.id}</td><td style={{ ...styles.td, color: colors.text }}>{item.student_name}</td><td style={styles.td}>{item.student_email}</td><td style={styles.td}>{item.exam_title}</td><td style={styles.td}>{item.exam_code || '-'}</td><td style={styles.td}>{item.score ?? 0}</td><td style={styles.td}>{statusLabel(item)}</td><td style={styles.td}>{fmt(item.start_time)}</td><td style={styles.td}>{fmt(item.submit_time)}</td><td style={styles.td}>{!item.submit_time ? <button type="button" onClick={async () => { try { await handleForceSubmitAttempt(item); } catch (err) { notifyError(err); } }} style={styles.btn('#7a1f1f', '#fff')}>{t.forceSubmit}</button> : '-'}</td></tr>))}{renderPagination('attempts')}</div>}
      {activeTab === 'violations' && <div style={styles.card}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>{sortControl('violations')}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{exportButtons('violations')}<button type="button" onClick={refreshActiveTab} style={styles.btn(colors.cardBg2, colors.text)}>{t.refresh}</button></div></div><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>{searchInput('violations', t.searchViolations)}</div>{renderTable(['ID', t.name, t.examTitle, t.examCode, t.type, t.count, t.reason, t.createdAt], paged.violations.items.map((item, index) => <tr key={item.id} style={styles.row(index)}><td style={styles.td}>{item.id}</td><td style={{ ...styles.td, color: colors.text }}>{item.student_name}</td><td style={styles.td}>{item.exam_title || '-'}</td><td style={styles.td}>{item.exam_code || '-'}</td><td style={styles.td}>{item.violation_type}</td><td style={styles.td}>{item.count ?? 0}</td><td style={styles.td}>{item.reason || '-'}</td><td style={styles.td}>{fmt(item.created_at)}</td></tr>))}{renderPagination('violations')}</div>}
      {activeTab === 'auditLogs' && <div style={styles.card}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>{sortControl('auditLogs')}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{exportButtons('auditLogs')}<button type="button" onClick={refreshActiveTab} style={styles.btn(colors.cardBg2, colors.text)}>{t.refresh}</button></div></div><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>{searchInput('auditLogs', t.searchAudit)}</div>{renderTable(['ID', t.actor, t.email, t.actions, t.target, 'Target ID', t.details, t.createdAt], paged.auditLogs.items.map((item, index) => <tr key={item.id} style={styles.row(index)}><td style={styles.td}>{item.id}</td><td style={{ ...styles.td, color: colors.text }}>{item.admin_name || '-'}</td><td style={styles.td}>{item.admin_email || '-'}</td><td style={styles.td}>{item.action_type}</td><td style={styles.td}>{item.target_type}</td><td style={styles.td}>{item.target_id ?? '-'}</td><td style={styles.td}>{item.details || '-'}</td><td style={styles.td}>{fmt(item.created_at)}</td></tr>))}{renderPagination('auditLogs')}</div>}

      {showEditModal && (
        <div style={styles.modalOverlay} onClick={cancelUserEdit}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>{t.editUserTitle}</div>
            <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{t.role}</label>
                <select
                  value={editDraft.role}
                  onChange={(e) => setEditingUserDraft((prev) => ({ ...(prev || {}), role: e.target.value, profile_mode: ['teacher', 'student'].includes(e.target.value) ? (prev?.profile_mode || 'academic') : '' }))}
                  style={styles.input}
                >
                  <option value="student">{t.student}</option>
                  <option value="teacher">{t.teacher}</option>
                  <option value="admin">{t.adminRole}</option>
                </select>
              </div>
              {['teacher', 'student'].includes(editDraft.role) && (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{t.accountType}</label>
                  <select
                    value={editDraft.profile_mode || ''}
                    onChange={(e) => setEditingUserDraft((prev) => ({ ...(prev || {}), profile_mode: e.target.value }))}
                    style={styles.input}
                  >
                    <option value="academic">{t.academic}</option>
                    <option value="independent">{t.independent}</option>
                  </select>
                </div>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{t.university}</label>
                <select
                  value={editDraft.university_id || ''}
                  onChange={(e) => setEditingUserDraft((prev) => ({ ...(prev || {}), university_id: e.target.value, branch_id: '', faculty_id: '', department_id: '' }))}
                  style={styles.input}
                >
                  <option value="">{t.noUniversity}</option>
                  {sorted.universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{t.branch}</label>
                <select
                  value={editDraft.branch_id || ''}
                  onChange={(e) => setEditingUserDraft((prev) => ({ ...(prev || {}), branch_id: e.target.value, faculty_id: '', department_id: '' }))}
                  style={styles.input}
                  disabled={!editDraft.university_id}
                >
                  <option value="">-</option>
                  {editModalBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{t.faculty}</label>
                <select
                  value={editDraft.faculty_id || ''}
                  onChange={(e) => setEditingUserDraft((prev) => ({ ...(prev || {}), faculty_id: e.target.value, department_id: '' }))}
                  style={styles.input}
                  disabled={!editDraft.branch_id}
                >
                  <option value="">-</option>
                  {editModalFaculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{t.department}</label>
                <select
                  value={editDraft.department_id || ''}
                  onChange={(e) => setEditingUserDraft((prev) => ({ ...(prev || {}), department_id: e.target.value }))}
                  style={styles.input}
                  disabled={!editDraft.branch_id}
                >
                  <option value="">{t.noDepartment}</option>
                  {editModalDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                </select>
              </div>
            </div>
            <div style={styles.modalActions}>
              <button type="button" onClick={cancelUserEdit} style={{ ...styles.actionBtn, ...styles.actionBtnNeutral }}>{t.close}</button>
              <button type="button" onClick={async () => { try { await handleUpdateUserDraft(); } catch (err) { notifyError(err); } }} style={{ ...styles.actionBtn, ...styles.actionBtnSuccess }}>
                {t.confirmAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div style={styles.modalOverlay} onClick={() => { setShowResetModal(false); setResetTargetUser(null); setResetPasswordValue(''); }}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>{t.resetPasswordTitle}</div>
            <div style={{ color: colors.textMuted, fontSize: 12, marginBottom: 10 }}>
              {resetTargetUser ? `${resetTargetUser.name} • ${resetTargetUser.email}` : ''}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textMuted, fontSize: 12 }}>{t.password}</label>
              <input
                type="password"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.modalActions}>
              <button type="button" onClick={() => { setShowResetModal(false); setResetTargetUser(null); setResetPasswordValue(''); }} style={{ ...styles.actionBtn, ...styles.actionBtnNeutral }}>{t.close}</button>
              <button
                type="button"
                onClick={async () => { try { await confirmResetPassword(); } catch (err) { notifyError(err); } }}
                style={{ ...styles.actionBtn, ...styles.actionBtnSuccess, ...(!resetPasswordValue ? styles.actionBtnDisabled : null) }}
                disabled={!resetPasswordValue}
              >
                {t.confirmAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={styles.toastContainer}>
          <div style={styles.toastCard(toast.type)} onClick={() => setToast(null)}>
            {toast.message}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;








