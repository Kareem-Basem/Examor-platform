import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/axios";
import useProctoring from "../../hooks/useProctoring";
import { useTheme } from "../../context/ThemeContext";
import ExamorShell from "../../components/ExamorShell";
import ExamorTopbar from "../../components/ExamorTopbar";

const ar = {
  loading: "\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646...",
  examEnded: "\u062a\u0645 \u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646",
  submitExit: "\u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a \u0648\u0627\u0644\u062e\u0631\u0648\u062c",
  examSubmitted: "\u0644\u0642\u062f \u0633\u0644\u0645\u062a \u0647\u0630\u0627 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0645\u0633\u0628\u0642\u064b\u0627.",
  viewResults: "\u0639\u0631\u0636 \u0627\u0644\u0646\u062a\u0627\u0626\u062c",
  backToDashboard: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0648\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
  notStarted: "\u0644\u0645 \u064a\u0628\u062f\u0623 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0628\u0639\u062f.",
  notFound: "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0623\u0648 \u0627\u0646\u062a\u0647\u0649 \u0648\u0642\u062a\u0647.",
  submitError: "\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u062a\u0633\u0644\u064a\u0645.",
  startError: "\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u0628\u062f\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646.",
  noCamera: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0648\u0635\u0648\u0644 \u0644\u0644\u0643\u0627\u0645\u064a\u0631\u0627",
  proctoring: "\u0645\u0631\u0627\u0642\u0628\u0629 \u0646\u0634\u0637\u0629",
  cameraDenied: "\u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627 \u0645\u0631\u0641\u0648\u0636\u0629",
  returnFullscreen: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0645\u0644\u0621 \u0627\u0644\u0634\u0627\u0634\u0629",
  fullscreenRequired: "\u064a\u062c\u0628 \u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0645\u0644\u0621 \u0627\u0644\u0634\u0627\u0634\u0629 \u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646.",
  startExam: "\u0628\u062f\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646",
  startNow: "\u0628\u062f\u0621 \u0627\u0644\u0622\u0646",
  startHint: "\u0633\u064a\u062a\u0645 \u062a\u0641\u0639\u064a\u0644 \u0648\u0636\u0639 \u0645\u0644\u0621 \u0627\u0644\u0634\u0627\u0634\u0629 \u0648\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627 \u0644\u0644\u0645\u0631\u0627\u0642\u0628\u0629.",
  question: "\u0633\u0624\u0627\u0644",
  of: "\u0645\u0646",
  previous: "\u0627\u0644\u0633\u0627\u0628\u0642",
  next: "\u0627\u0644\u062a\u0627\u0644\u064a",
  submit: "\u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646",
  unanswered: "\u0644\u0645 \u062a\u064f\u062c\u0628 \u0639\u0644\u0649",
  questions: "\u0623\u0633\u0626\u0644\u0629",
  exam: "\u0627\u0645\u062a\u062d\u0627\u0646",
  timeUp: "\u0627\u0646\u062a\u0647\u0649 \u0648\u0642\u062a \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u2014 \u062a\u0645 \u0627\u0644\u062a\u0633\u0644\u064a\u0645 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627.",
  securityWarning: "\u062a\u062d\u0630\u064a\u0631 \u0623\u0645\u0646\u064a",
  reviewAndSubmit: "\u0645\u0631\u0627\u062c\u0639\u0629 \u0648\u062a\u0633\u0644\u064a\u0645",
  markForReview: "\u062a\u0639\u0644\u064a\u0645 \u0644\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
  unmarkReview: "\u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u062a\u0639\u0644\u064a\u0645",
  submitConfirm: "\u062a\u0623\u0643\u064a\u062f \u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646",
  submitConfirmHint: "\u0631\u0627\u062c\u0639 \u062d\u0627\u0644\u0629 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0642\u0628\u0644 \u0627\u0644\u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u0646\u0647\u0627\u0626\u064a.",
  continueExam: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0627\u0645\u062a\u062d\u0627\u0646",
  submitNow: "\u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u0622\u0646",
  answeredCount: "\u062a\u0645\u062a \u0625\u062c\u0627\u0628\u062a\u0647\u0627",
  unansweredCount: "\u063a\u064a\u0631 \u0645\u062c\u0627\u0628 \u0639\u0646\u0647\u0627",
  reviewCount: "\u0645\u0639\u0644\u0645\u0629 \u0644\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
  jumpToFirstUnanswered: "\u0627\u0644\u0630\u0647\u0627\u0628 \u0644\u0623\u0648\u0644 \u0633\u0624\u0627\u0644 \u063a\u064a\u0631 \u0645\u062c\u0627\u0628",
  legendCurrent: "\u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u062d\u0627\u0644\u064a",
  legendAnswered: "\u0645\u062c\u0627\u0628",
  legendUnanswered: "\u063a\u064a\u0631 \u0645\u062c\u0627\u0628",
  legendReview: "\u0644\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
  questionPalette: "\u062e\u0631\u064a\u0637\u0629 \u0627\u0644\u0623\u0633\u0626\u0644\u0629",
  sessionLocked: "\u0647\u0630\u0627 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0646\u0634\u0637 \u0628\u0627\u0644\u0641\u0639\u0644 \u0641\u064a \u0646\u0627\u0641\u0630\u0629 \u0623\u0648 \u062c\u0647\u0627\u0632 \u0622\u062e\u0631.",
  autosavedNow: "\u062a\u0645 \u062d\u0641\u0638 \u0625\u062c\u0627\u0628\u0627\u062a\u0643 \u0627\u0644\u0622\u0646.",
  autosaving: "\u062c\u0627\u0631\u064d \u062d\u0641\u0638 \u0625\u062c\u0627\u0628\u0627\u062a\u0643...",
  securityChecklist: "\u0627\u0644\u062a\u062d\u0642\u0642 \u0642\u0628\u0644 \u0628\u062f\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646",
  checklistCamera: "\u062a\u0623\u0643\u062f \u0623\u0646 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627 \u0645\u062a\u0627\u062d\u0629 \u0648\u0623\u0646\u0643 \u0641\u064a \u0645\u0643\u0627\u0646 \u0647\u0627\u062f\u0626.",
  checklistFullscreen: "\u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646 \u0633\u064a\u0639\u0645\u0644 \u0628\u0648\u0636\u0639 \u0645\u0644\u0621 \u0627\u0644\u0634\u0627\u0634\u0629 \u0637\u0648\u0627\u0644 \u0648\u0642\u062a \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646.",
  checklistWarnings: "\u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0645\u0644\u0621 \u0627\u0644\u0634\u0627\u0634\u0629 \u0623\u0648 \u0645\u062d\u0627\u0648\u0644\u0629 \u062a\u0635\u0648\u064a\u0631 \u0627\u0644\u0634\u0627\u0634\u0629 \u064a\u0639\u0637\u064a \u0625\u0646\u0630\u0627\u0631\u064b\u0627 \u0648\u0627\u062d\u062f\u064b\u0627\u060c \u0648\u0641\u064a \u0627\u0644\u0645\u0631\u0629 \u0627\u0644\u062b\u0627\u0646\u064a\u0629 \u064a\u062a\u0645 \u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646.",
  checklistAutosave: "\u0625\u062c\u0627\u0628\u0627\u062a\u0643 \u062a\u064f\u062d\u0641\u0638 \u062f\u0648\u0631\u064a\u064b\u0627\u060c \u0644\u0643\u0646 \u0627\u0644\u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u0646\u0647\u0627\u0626\u064a \u064a\u0638\u0644 \u0645\u0633\u0624\u0648\u0644\u064a\u062a\u0643.",
  readyConfirm: "\u0623\u0641\u0647\u0645 \u0627\u0644\u062a\u0639\u0644\u064a\u0645\u0627\u062a \u0648\u0623\u0646\u0627 \u062c\u0627\u0647\u0632 \u0644\u0628\u062f\u0621 \u0627\u0644\u0627\u0645\u062a\u062d\u0627\u0646.",
};

const extractQuestions = (payload, examPayload) => {
  const candidates = [payload?.questions, payload?.data?.questions, payload?.exam?.questions, payload?.exam?.data?.questions, payload?.exam_questions, payload?.examQuestions, examPayload?.questions, examPayload?.data?.questions];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && Array.isArray(candidate.data)) return candidate.data;
  }
  return [];
};

function ExamTimer({ initialSeconds, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, initialSeconds));

  useEffect(() => {
    setTimeLeft(Math.max(0, initialSeconds));
  }, [initialSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onTimeUp]);

  const h = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  return <div style={{ padding: "8px 14px", borderRadius: 12, background: "#2C3E6B", color: "#fff", fontWeight: "bold" }}>{h}:{m}:{s}</div>;
}

const formatSeconds = (value) => {
  const totalSeconds = Math.max(0, Number(value) || 0);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

function ExamPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const isAr = i18n.language === "ar";
  const t = useCallback((en, arText) => (isAr ? arText : en), [isAr]);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const currentUserId = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      const parsed = rawUser ? JSON.parse(rawUser) : null;
      return parsed?.id ? String(parsed.id) : "anonymous";
    } catch {
      return "anonymous";
    }
  }, []);
  const draftKey = `exam_draft_${code}_${currentUserId}`;
  const sessionKey = useMemo(() => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `exam-session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attemptId, setAttemptId] = useState(null);
  const [proctorStarted, setProctorStarted] = useState(false);
  const [cameraOK, setCameraOK] = useState(true);
  const [forceQuit, setForceQuit] = useState(false);
  const [forceReason, setForceReason] = useState("");
  const [violations, setViolations] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [needsFullscreenRecovery, setNeedsFullscreenRecovery] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [sessionConflict, setSessionConflict] = useState("");
  const [autosaveStatus, setAutosaveStatus] = useState("");
  const [startConfirmed, setStartConfirmed] = useState(false);

  const videoRef = useRef(null);
  const answersRef = useRef({});
  const markedRef = useRef({});
  const autoSubmitRef = useRef(false);
  const startedRef = useRef(false);
  const submitRef = useRef(null);
  const stopProctoringRef = useRef(null);
  const lastAutosaveSignatureRef = useRef("");

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isTablet = viewportWidth <= 1024;
  const isMobile = viewportWidth <= 640;
  const proctoringEnabled = Boolean(exam?.proctoring_enabled ?? true);
  const isDemoExam = Boolean(exam?.is_demo_exam ?? false);
  const screenProtectionEnabled = Boolean(exam?.screen_capture_protection ?? false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    markedRef.current = markedQuestions;
  }, [markedQuestions]);

  const pushAutosave = useCallback(async ({ force = false } = {}) => {
    if (!proctorStarted || !attemptId || forceQuit || sessionConflict || !questions.length) return;

    const answersArr = Object.entries(answersRef.current).map(([qid, ans]) => {
      const value = String(ans ?? "");
      const num = Number(value);
      return value !== "" && Number.isFinite(num) && String(num) === value
        ? { question_id: parseInt(qid, 10), selected_option_id: num }
        : { question_id: parseInt(qid, 10), text_answer: value };
    });

    const signature = JSON.stringify(
      answersArr
        .slice()
        .sort((a, b) => Number(a.question_id) - Number(b.question_id))
    );

    if (!force && signature === lastAutosaveSignatureRef.current) return;

    try {
      setAutosaveStatus(t("Saving your answers...", ar.autosaving));
      await API.post(`/student/exam/${code}/autosave`, {
        attempt_id: attemptId,
        answers: answersArr,
        session_key: sessionKey,
      });
      lastAutosaveSignatureRef.current = signature;
      setAutosaveStatus(t("Answers saved just now.", ar.autosavedNow));
      window.setTimeout(() => setAutosaveStatus(""), 1500);
    } catch (err) {
      const message = err?.response?.data?.message || "";
      if (message === "This exam is already active in another window or device") {
        setSessionConflict(t("This exam is already active in another window or device.", ar.sessionLocked));
        setForceReason(t("This exam is already active in another window or device.", ar.sessionLocked));
        setForceQuit(true);
        return;
      }
      setAutosaveStatus("");
    }
  }, [attemptId, code, forceQuit, proctorStarted, questions.length, sessionConflict, sessionKey, t]);

  const normalizeQuestion = useCallback((q, idx) => {
    const rawType = String(q?.type ?? q?.question_type ?? q?.questionType ?? "").toLowerCase();
    const type = rawType === "mcq" ? "mcq" : (rawType === "truefalse" || rawType === "true_false" || rawType === "true-false" ? "true_false" : "essay");
    const rawOptions = Array.isArray(q?.options) ? q.options : Array.isArray(q?.choices) ? q.choices : [];
    return {
      question_id: q?.question_id ?? q?.id ?? q?.questionId ?? idx,
      question_text: q?.question_text ?? q?.text ?? q?.question ?? q?.questionText ?? "",
      type,
      options: rawOptions.map((opt, i) => ({
        option_id: opt?.option_id ?? opt?.id ?? opt?.optionId ?? i,
        option_text: opt?.option_text ?? opt?.text ?? opt?.option ?? opt?.optionText ?? "",
      })).filter((opt) => opt.option_text !== ""),
    };
  }, []);

  const hydrateExamPayload = useCallback((payload, overrides = {}) => {
    const rawExamPayload = payload?.exam || payload || {};
    const normalized = extractQuestions(payload, rawExamPayload).map(normalizeQuestion);
    const examPayload = {
      ...rawExamPayload,
      ...overrides
    };

    setExam(examPayload || null);
    setQuestions(normalized);

    try {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      const allowedIds = new Set(normalized.map((q) => String(q.question_id)));
      const serverAnswers = Array.isArray(examPayload?.saved_answers)
        ? examPayload.saved_answers.reduce((acc, answer) => {
            const key = String(answer.question_id);
            if (!allowedIds.has(key)) return acc;
            if (answer.selected_option_id !== null && answer.selected_option_id !== undefined) {
              acc[key] = String(answer.selected_option_id);
            } else if (answer.text_answer) {
              acc[key] = answer.text_answer;
            }
            return acc;
          }, {})
        : {};
      const draftAnswers = savedDraft?.answers && typeof savedDraft.answers === "object" ? savedDraft.answers : savedDraft;
      const draftMarked = savedDraft?.markedQuestions && typeof savedDraft.markedQuestions === "object" ? savedDraft.markedQuestions : {};
      const filteredDraftAnswers = Object.fromEntries(Object.entries(draftAnswers || {}).filter(([qid]) => allowedIds.has(String(qid))));
      setAnswers({ ...serverAnswers, ...filteredDraftAnswers });
      setMarkedQuestions(Object.fromEntries(Object.entries(draftMarked || {}).filter(([qid, flagged]) => allowedIds.has(String(qid)) && Boolean(flagged))));
    } catch (_) {}

    return { examPayload, normalized };
  }, [draftKey, normalizeQuestion]);

  const handleForceSubmit = useCallback((reason, counts) => {
    setViolations(counts || null);
    setForceReason(reason || (isAr ? ar.examEnded : "Exam ended"));
    setForceQuit(true);
    if (!autoSubmitRef.current) {
      autoSubmitRef.current = true;
      setTimeout(() => submitRef.current?.(true), 0);
    }
  }, [isAr]);

  const handleProctorViolation = useCallback((type, message) => {
    if (type === "CAMERA_DENIED") setCameraOK(false);
    if (type === "FULLSCREENEXIT" && proctoringEnabled) setNeedsFullscreenRecovery(true);
    if (type !== "FORCE_SUBMIT" && message) {
      setWarningMessage(message);
      window.clearTimeout(window.__examWarningTimer);
      window.__examWarningTimer = window.setTimeout(() => setWarningMessage(""), 3500);
    }
  }, [proctoringEnabled]);

  const proctorLimits = useMemo(() => ({
    tabSwitch: 2,
    fullscreenExit: 2,
    copy: 999,
    paste: 999,
    screenshot: 2,
    cameraDenied: isDemoExam ? 3 : 1,
    cameraOff: isDemoExam ? 3 : 1,
  }), [isDemoExam]);

  const proctorOptions = useMemo(() => ({
    enableCamera: proctoringEnabled,
    requireFullscreen: proctoringEnabled,
    monitorFocus: proctoringEnabled,
    blockInteractions: screenProtectionEnabled || proctoringEnabled,
    screenCaptureProtection: screenProtectionEnabled || proctoringEnabled,
    allowCameraFailure: isDemoExam,
    allowFullscreenFailure: false,
  }), [isDemoExam, proctoringEnabled, screenProtectionEnabled]);

  const { startProctoring, stopProctoring, requestCamera, getViolations } = useProctoring({
    videoRef,
    onViolation: handleProctorViolation,
    onForceSubmit: handleForceSubmit,
    options: proctorOptions,
    limits: proctorLimits,
  });

  const submitExam = useCallback(async (forced = false) => {
    if (submitting) return;
    if (!forced) {
      const v = violations || getViolations?.() || {};
      const warnCount = [
        v.tabSwitch,
        v.fullscreenExit,
        v.screenshot,
        v.cameraDenied,
        v.cameraOff,
      ].filter((n) => Number(n) > 0).length;
      const summary = warnCount > 0
        ? `\n${t("Warnings recorded:", "تم تسجيل مخالفات:")} ` +
          `${t("Tab", "تبويب")}:${v.tabSwitch || 0} ` +
          `${t("Fullscreen", "ملء الشاشة")}:${v.fullscreenExit || 0} ` +
          `${t("Screenshot", "تصوير شاشة")}:${v.screenshot || 0} ` +
          `${t("Camera denied", "رفض كاميرا")}:${v.cameraDenied || 0} ` +
          `${t("Camera off", "إيقاف كاميرا")}:${v.cameraOff || 0}`
        : '';
      const ok = window.confirm(`${t("Submit the exam now?", "هل تريد تسليم الامتحان الآن؟")}${summary}`);
      if (!ok) return;
    }
    setSubmitting(true);
    stopProctoring();
    try {
      let ensuredAttemptId = attemptId;
      if (!ensuredAttemptId) {
        const startRes = await API.post(`/student/exam/${code}/start`, { session_key: sessionKey });
        ensuredAttemptId = startRes.data?.attempt_id || null;
        if (ensuredAttemptId) setAttemptId(ensuredAttemptId);
      }
      if (!ensuredAttemptId) throw new Error("NO_ATTEMPT_ID");

      const answersArr = Object.entries(answersRef.current).map(([qid, ans]) => {
        const s = String(ans ?? "");
        const num = Number(s);
        return s !== "" && Number.isFinite(num) && String(num) === s
          ? { question_id: parseInt(qid, 10), selected_option_id: num }
          : { question_id: parseInt(qid, 10), text_answer: s };
      });

      await API.post(`/student/exam/${code}/submit`, {
        attempt_id: ensuredAttemptId,
        answers: answersArr,
        forced,
        violations: violations || getViolations?.() || undefined,
        session_key: sessionKey,
      });

      localStorage.removeItem(draftKey);
      navigate("/student/results");
    } catch (err) {
        const message = err?.response?.data?.message || "";
        if (message === "This exam is already active in another window or device") {
          setSessionConflict(t("This exam is already active in another window or device.", ar.sessionLocked));
          setSubmitting(false);
          return;
        }
        if (message === "Attempt not found or already submitted") {
          localStorage.removeItem(draftKey);
          navigate("/student/results");
        return;
      }
      setError(t("Submission failed.", ar.submitError));
      setSubmitting(false);
    }
  }, [attemptId, code, draftKey, getViolations, navigate, sessionKey, stopProctoring, submitting, t, violations]);

  useEffect(() => {
    submitRef.current = submitExam;
  }, [submitExam]);

  useEffect(() => {
    stopProctoringRef.current = stopProctoring;
  }, [stopProctoring]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/student/exam/${code}`);
        const payload = res.data?.data || res.data || {};
        const { examPayload } = hydrateExamPayload(payload);
        setAttemptId(examPayload?.current_attempt_id || null);
      } catch (err) {
        const message = err?.response?.data?.message || "";
        if (message === "This exam is already active in another window or device") {
          setSessionConflict(t("This exam is already active in another window or device.", ar.sessionLocked));
          return;
        }
        if (message === "You have already submitted this exam") {
          setError(t("You have already submitted this exam.", ar.examSubmitted));
        } else if (message === "Exam has not started yet") {
          setError(t("This exam has not started yet.", ar.notStarted));
        } else {
          setError(t("Exam not found or expired.", ar.notFound));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code, hydrateExamPayload, t]);

  useEffect(() => () => stopProctoringRef.current?.(), []);

  useEffect(() => {
    const handleFullscreenBack = () => {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        setNeedsFullscreenRecovery(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenBack);
    document.addEventListener("webkitfullscreenchange", handleFullscreenBack);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenBack);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenBack);
    };
  }, []);

  useEffect(() => {
    if (!proctorStarted || forceQuit) return undefined;

    const beforeUnloadHandler = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    const popStateHandler = () => {
      window.history.pushState({ examLocked: true, code }, "", window.location.href);
      setWarningMessage(
        t(
          "Leaving the exam page is blocked during the exam.",
          "لا يمكن مغادرة صفحة الامتحان أثناء سير الامتحان."
        )
      );
      window.clearTimeout(window.__examWarningTimer);
      window.__examWarningTimer = window.setTimeout(() => setWarningMessage(""), 3500);
    };

    window.history.pushState({ examLocked: true, code }, "", window.location.href);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    window.addEventListener("popstate", popStateHandler);

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.removeEventListener("popstate", popStateHandler);
    };
  }, [code, forceQuit, proctorStarted, t]);

  useEffect(() => {
    if (!questions.length) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({ answers, markedQuestions }));
    } catch (_) {}
  }, [answers, draftKey, markedQuestions, questions.length]);

  useEffect(() => {
    if (!proctorStarted || !attemptId || forceQuit || sessionConflict || !questions.length) return undefined;
    const timeoutId = window.setTimeout(() => {
      pushAutosave();
    }, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [answers, attemptId, forceQuit, proctorStarted, pushAutosave, questions.length, sessionConflict]);

  useEffect(() => {
    if (!proctorStarted || !attemptId || forceQuit || sessionConflict || !questions.length) return undefined;

    const intervalId = window.setInterval(() => {
      pushAutosave({ force: true });
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [attemptId, forceQuit, proctorStarted, pushAutosave, questions.length, sessionConflict]);

  useEffect(() => {
    if (!proctorStarted || !attemptId || forceQuit || sessionConflict) return undefined;

    const heartbeat = async () => {
      try {
        await API.post(`/student/exam/${code}/heartbeat`, {
          attempt_id: attemptId,
          session_key: sessionKey,
        });
      } catch (err) {
        const message = err?.response?.data?.message || "";
        if (message === "This exam is already active in another window or device") {
          setSessionConflict(t("This exam is already active in another window or device.", ar.sessionLocked));
          setForceReason(t("This exam is already active in another window or device.", ar.sessionLocked));
          setForceQuit(true);
        }
      }
    };

    heartbeat();
    const intervalId = window.setInterval(heartbeat, 5000);
    return () => window.clearInterval(intervalId);
  }, [attemptId, code, forceQuit, proctorStarted, sessionConflict, sessionKey, t]);

  const currentQuestion = questions[current];
  const looksLatin = useCallback((value) => /[A-Za-z]/.test(String(value || "")), []);
  const answeredIds = useMemo(() => new Set(Object.entries(answers).filter(([, value]) => value !== "").map(([qid]) => String(qid))), [answers]);
  const markedIds = useMemo(() => new Set(Object.entries(markedQuestions).filter(([, flagged]) => Boolean(flagged)).map(([qid]) => String(qid))), [markedQuestions]);
  const answered = answeredIds.size;
  const total = questions.length;
  const remaining = Math.max(0, total - answered);
  const reviewCount = markedIds.size;
  const remainingSeconds = useMemo(() => {
    const examDuration = Number(exam?.duration) || 0;
    const currentAttemptStartTime = exam?.current_attempt_start_time
      ? new Date(exam.current_attempt_start_time).getTime()
      : null;

    if (!examDuration || !currentAttemptStartTime) {
      return examDuration * 60;
    }

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - currentAttemptStartTime) / 1000));
    return Math.max(0, examDuration * 60 - elapsedSeconds);
  }, [exam?.current_attempt_start_time, exam?.duration]);
  const firstUnansweredIndex = useMemo(() => questions.findIndex((q) => !answeredIds.has(String(q.question_id))), [answeredIds, questions]);
  const getQuestionState = useCallback((question, index) => {
    const qid = String(question.question_id);
    if (index === current) return "current";
    if (markedIds.has(qid)) return "review";
    if (answeredIds.has(qid)) return "answered";
    return "unanswered";
  }, [answeredIds, current, markedIds]);
  const toggleMarkedQuestion = useCallback((questionId) => {
    setMarkedQuestions((prev) => {
      const key = String(questionId);
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: true };
    });
  }, []);
  const openSubmitReview = useCallback(() => {
    setShowSubmitModal(true);
  }, []);

  if (loading) {
    return (
      <ExamorShell>
        <ExamorTopbar compact lockExamMode />
        <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: colors.appBg }}>
          <div style={{ width: "min(520px, 92vw)", background: colors.cardBg, borderRadius: 18, padding: 22, border: `1px solid ${colors.border}`, boxShadow: colors.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: `3px solid ${colors.border}`, borderTopColor: colors.btnPrimary, animation: "examSpin 0.9s linear infinite" }} />
              <div>
                <div style={{ color: colors.text, fontWeight: "bold", fontSize: 16 }}>{t("Loading your exam...", ar.loading)}</div>
                <div style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{t("Preparing questions and security checks.", "جاري تجهيز الأسئلة وإعدادات الأمان.")}</div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
              {[1, 2, 3].map((row) => (
                <div key={row} style={{ height: 10, borderRadius: 8, background: colors.cardBg2, overflow: "hidden" }}>
                  <div style={{ width: row === 1 ? "65%" : row === 2 ? "48%" : "78%", height: "100%", background: colors.border, opacity: 0.6 }} />
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes examSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </ExamorShell>
    );
  }

  if (error) {
    return (
      <ExamorShell>
        <ExamorTopbar compact lockExamMode />
        <div style={{ padding: 24 }}>
          <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24, color: "#c0392b" }}>
            <div style={{ marginBottom: 14 }}>{error}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => navigate("/student/results")}
                style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: colors.btnPrimary, color: colors.btnPrimaryTxt, cursor: "pointer", fontWeight: "bold" }}
              >
                {t("View Results", ar.viewResults)}
              </button>
              <button
                type="button"
                onClick={() => navigate("/student")}
                style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.cardBg2, color: colors.text, cursor: "pointer", fontWeight: "bold" }}
              >
                {t("Back to dashboard", ar.backToDashboard)}
              </button>
            </div>
          </div>
        </div>
      </ExamorShell>
    );
  }

  if (sessionConflict) {
    return (
      <ExamorShell>
        <ExamorTopbar compact lockExamMode />
        <div style={{ padding: 24 }}>
          <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24, color: "#c0392b" }}>
            {sessionConflict}
          </div>
        </div>
      </ExamorShell>
    );
  }

  return (
    <ExamorShell style={{ display: "flex", flexDirection: "column" }}>
      <ExamorTopbar compact lockExamMode />

      {forceQuit && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#1a0a0a", border: "2px solid #c0392b", borderRadius: 20, padding: 30, maxWidth: 520, width: "100%", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>{t("Exam Ended", ar.examEnded)}</div>
            <div style={{ marginBottom: 16, whiteSpace: "pre-line" }}>{forceReason}</div>
            <button onClick={() => submitExam(true)} style={{ padding: "12px 18px", width: "100%", background: "#c0392b", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
              {t("Submit & Exit", ar.submitExit)}
            </button>
          </div>
        </div>
      )}

      {!!warningMessage && !forceQuit && (
        <div style={{ position: "fixed", top: 74, left: "50%", transform: "translateX(-50%)", zIndex: 9999, width: "min(680px, calc(100vw - 32px))" }}>
          <div style={{ background: "rgba(230,126,34,.14)", border: "1px solid rgba(230,126,34,.45)", color: "#8B4A00", borderRadius: 14, padding: "12px 16px", boxShadow: "0 10px 30px rgba(0,0,0,.12)" }}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>{t("Security warning", ar.securityWarning)}</div>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>{warningMessage}</div>
          </div>
        </div>
      )}

      {proctoringEnabled && needsFullscreenRecovery && !forceQuit && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10002, background: "rgba(0,0,0,.82)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: colors.cardBg, borderRadius: 18, padding: 24, width: "min(520px, 96vw)", border: `1px solid ${colors.border}`, textAlign: "center" }}>
            <div style={{ color: colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>{t("Return to fullscreen", ar.returnFullscreen)}</div>
            <div style={{ color: colors.textMuted, lineHeight: 1.9, marginBottom: 18 }}>{t("You must return to fullscreen to continue the exam.", ar.fullscreenRequired)}</div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const el = document.documentElement;
                  if (el.requestFullscreen) await el.requestFullscreen();
                  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                } catch (_) {}
              }}
              style={{ padding: "12px 18px", background: colors.btnPrimary, color: colors.btnPrimaryTxt, border: "none", borderRadius: 12, cursor: "pointer", width: "100%" }}
            >
              {t("Return to fullscreen", ar.returnFullscreen)}
            </button>
          </div>
        </div>
      )}

      {proctoringEnabled && (
        <div style={{ position: "fixed", bottom: isMobile ? 12 : 20, left: isAr ? "auto" : (isMobile ? 12 : 20), right: isAr ? (isMobile ? 12 : 20) : "auto", zIndex: 999, width: isMobile ? 110 : 150, background: "#0a0a0a", borderRadius: 12, overflow: "hidden", border: `2px solid ${cameraOK ? "#2C3E6B" : "#c0392b"}` }}>
          <div style={{ background: "#0F1D35", padding: "5px 10px", color: "#8B9DC0", fontSize: 10, fontWeight: "bold" }}>{cameraOK ? t("Proctoring active", ar.proctoring) : t("Camera denied", ar.cameraDenied)}</div>
          {cameraOK ? <video ref={videoRef} muted playsInline autoPlay style={{ width: "100%", display: "block", transform: "scaleX(-1)" }} /> : (
            <div style={{ padding: 10, color: "#e74c3c", textAlign: "center", fontSize: 11 }}>
              <div style={{ marginBottom: 6 }}>{t("No camera", ar.noCamera)}</div>
              <button
                type="button"
                onClick={async () => {
                  const ok = await requestCamera?.();
                  if (ok) setCameraOK(true);
                }}
                style={{ padding: "6px 8px", fontSize: 10, borderRadius: 8, border: "1px solid #c0392b", background: "transparent", color: "#e74c3c", cursor: "pointer", width: "100%" }}
              >
                {isAr ? "إعادة تشغيل الكاميرا" : "Retry camera"}
              </button>
            </div>
          )}
        </div>
      )}

      {!proctorStarted && questions.length > 0 && !error && !sessionConflict && !forceQuit && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: colors.cardBg, borderRadius: 16, padding: 24, width: "min(560px, 96vw)", border: `1px solid ${colors.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 8 }}>{t("Start Exam", ar.startExam)}</div>
            <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.9, marginBottom: 14, whiteSpace: "pre-line" }}>
              {proctoringEnabled
                ? t("Fullscreen mode and camera proctoring will start.", ar.startHint)
                : screenProtectionEnabled
                  ? (isAr ? "سيتم تفعيل حماية التفاعل (نسخ/لصق) أثناء الامتحان." : "Interaction protection (copy/paste restrictions) will be enabled during the exam.")
                  : (isAr ? "يمكنك بدء الامتحان الآن." : "You can start the exam now.")}
            </div>
            <div style={{ textAlign: isAr ? "right" : "left", marginBottom: 16 }}>
              <div style={{ color: colors.text, fontWeight: "bold", marginBottom: 8 }}>{t("Security checklist", ar.securityChecklist)}</div>
              <div style={{ display: "grid", gap: 8, color: colors.textMuted, fontSize: 13, lineHeight: 1.8 }}>
                {proctoringEnabled && <div>{`\u2022 ${t("Make sure your camera is available and you are in a quiet place.", ar.checklistCamera)}`}</div>}
                {proctoringEnabled && <div>{`\u2022 ${t("The exam will stay in fullscreen mode throughout the attempt.", ar.checklistFullscreen)}`}</div>}
                {proctoringEnabled && <div>{`\u2022 ${t("Exiting fullscreen or attempting a screenshot gives one warning; the second time will end the exam.", ar.checklistWarnings)}`}</div>}
                {screenProtectionEnabled && <div>{`\u2022 ${isAr ? "سيتم منع النسخ واللصق وبعض اختصارات لوحة المفاتيح أثناء الامتحان." : "Copy/paste and key interaction restrictions are enabled during the exam."}`}</div>}
                <div>{`\u2022 ${t("Your answers are autosaved, but final submission is still your responsibility.", ar.checklistAutosave)}`}</div>
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, color: colors.text, fontSize: 13, marginBottom: 16 }}>
              <input type="checkbox" checked={startConfirmed} onChange={(e) => setStartConfirmed(e.target.checked)} />
              <span>{t("I understand the instructions and I am ready to start the exam.", ar.readyConfirm)}</span>
            </label>
            <button
              onClick={async () => {
                if (startedRef.current) return;
                startedRef.current = true;
                try {
                  await startProctoring();
                  if (proctoringEnabled) {
                    const inFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                    if (!inFs) setNeedsFullscreenRecovery(true);
                  }
                  const startRes = await API.post(`/student/exam/${code}/start`, { session_key: sessionKey });
                  const startedAttemptId = startRes.data?.attempt_id || null;
                  if (!startedAttemptId) throw new Error("NO_ATTEMPT_ID");

                  const refreshRes = await API.get(`/student/exam/${code}`);
                  const refreshPayload = refreshRes.data?.data || refreshRes.data || {};
                  const refreshedExam = refreshPayload?.exam || refreshPayload || {};
                  hydrateExamPayload(refreshPayload, {
                    current_attempt_id: startedAttemptId,
                    current_attempt_start_time: startRes.data?.started_at || refreshedExam?.current_attempt_start_time || null
                  });
                  setAttemptId(startedAttemptId);
                  setProctorStarted(true);
                  setError("");
                } catch (err) {
                  stopProctoringRef.current?.();
                  startedRef.current = false;
                  setProctorStarted(false);
                  const message = err?.response?.data?.message || "";
                  if (message === "This exam is already active in another window or device") {
                    setSessionConflict(t("This exam is already active in another window or device.", ar.sessionLocked));
                    return;
                  }
                  if (message === "Exam has not started yet") {
                    setError(t("This exam has not started yet.", ar.notStarted));
                    return;
                  }
                  if (message === "Exam has already ended") {
                    setError(t("Exam not found or expired.", ar.notFound));
                    return;
                  }
                  setError(t("Unable to start the exam.", ar.startError));
                }
              }}
              disabled={!startConfirmed}
              style={{ padding: "12px 18px", background: colors.btnPrimary, color: colors.btnPrimaryTxt, border: "none", borderRadius: 12, cursor: startConfirmed ? "pointer" : "not-allowed", width: "100%", opacity: startConfirmed ? 1 : 0.6 }}
            >
              {t("Start now", ar.startNow)}
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, padding: "18px 18px 36px", direction: isAr ? "rtl" : "ltr" }}>
        <div style={{ maxWidth: isTablet ? "100%" : 920, margin: "0 auto" }}>
          <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <div>
              <div style={{ color: colors.text, fontWeight: "bold" }}>{exam?.title || t("Exam", ar.exam)}</div>
              <div style={{ color: colors.textMuted, fontSize: 12 }}>
                {proctoringEnabled ? t("Proctoring active", ar.proctoring) : (screenProtectionEnabled ? (isAr ? "حماية تفاعل مفعلة" : "Interaction protection active") : (isAr ? "وضع عادي" : "Standard mode"))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {!!autosaveStatus && (
                <div style={{ padding: "8px 14px", borderRadius: 12, background: colors.cardBg2, border: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: 12, fontWeight: "bold" }}>
                  {autosaveStatus}
                </div>
              )}
              {exam?.duration && exam?.current_attempt_start_time ? (
                <ExamTimer
                  initialSeconds={remainingSeconds}
                  onTimeUp={() => {
                    if (autoSubmitRef.current) return;
                    autoSubmitRef.current = true;
                    setForceReason(t("Time is up — auto-submitted.", ar.timeUp));
                    setForceQuit(true);
                    submitExam(true);
                  }}
                />
              ) : exam?.duration ? (
                <div style={{ padding: "8px 14px", borderRadius: 12, background: "#2C3E6B", color: "#fff", fontWeight: "bold" }}>
                  {formatSeconds((Number(exam?.duration) || 0) * 60)}
                </div>
              ) : null}
              <div style={{ padding: "8px 14px", borderRadius: 12, background: colors.cardBg2, border: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: 12, fontWeight: "bold" }}>
                {total ? Math.round((answered / total) * 100) : 0}%
              </div>
            </div>
          </div>

          <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <div style={{ color: colors.text, fontWeight: "bold" }}>{t("Question palette", ar.questionPalette)}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ padding: "6px 10px", borderRadius: 999, background: colors.cardBg2, color: colors.textMuted, fontSize: 12 }}>{`${t("Answered", ar.answeredCount)}: ${answered}`}</div>
                <div style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(230,126,34,.12)", color: isDark ? "#f5c08a" : "#8B4A00", fontSize: 12 }}>{`${t("Unanswered", ar.unansweredCount)}: ${remaining}`}</div>
                <div style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(52,152,219,.12)", color: isDark ? "#9fd3ff" : "#1f618d", fontSize: 12 }}>{`${t("Review", ar.reviewCount)}: ${reviewCount}`}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => currentQuestion && toggleMarkedQuestion(currentQuestion.question_id)}
                style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${colors.border}`, background: markedIds.has(String(currentQuestion?.question_id)) ? "rgba(52,152,219,.14)" : colors.cardBg2, color: colors.text, cursor: "pointer", fontWeight: "bold", width: isMobile ? "100%" : "auto" }}
              >
                {markedIds.has(String(currentQuestion?.question_id)) ? t("Unmark review", ar.unmarkReview) : t("Mark for review", ar.markForReview)}
              </button>
              <button
                type="button"
                onClick={() => { if (firstUnansweredIndex >= 0) setCurrent(firstUnansweredIndex); }}
                disabled={firstUnansweredIndex < 0}
                style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.cardBg2, color: colors.text, cursor: firstUnansweredIndex < 0 ? "not-allowed" : "pointer", opacity: firstUnansweredIndex < 0 ? 0.6 : 1, fontWeight: "bold", width: isMobile ? "100%" : "auto" }}
              >
                {t("Go to first unanswered", ar.jumpToFirstUnanswered)}
              </button>
              <button
                type="button"
                onClick={openSubmitReview}
                style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: colors.btnPrimary, color: colors.btnPrimaryTxt, cursor: "pointer", fontWeight: "bold", width: isMobile ? "100%" : "auto" }}
              >
                {t("Review & Submit", ar.reviewAndSubmit)}
              </button>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {questions.map((q, index) => {
                const state = getQuestionState(q, index);
                const stylesByState = {
                  current: { background: colors.btnPrimary, color: colors.btnPrimaryTxt, border: colors.btnPrimary },
                  answered: { background: "#1A4A25", color: "#fff", border: "#1A4A25" },
                  review: { background: "#1f618d", color: "#fff", border: "#1f618d" },
                  unanswered: { background: colors.cardBg2, color: colors.textMuted, border: colors.border },
                };
                const stateStyle = stylesByState[state];
                return (
                  <button
                    key={q.question_id ?? index}
                    type="button"
                    onClick={() => setCurrent(index)}
                    style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${stateStyle.border}`, background: stateStyle.background, color: stateStyle.color, cursor: "pointer", fontWeight: "bold" }}
                    title={`${t("Question", ar.question)} ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12, color: colors.textMuted, fontSize: 12 }}>
              <span>{t("Current question", ar.legendCurrent)}</span>
              <span>{t("Answered", ar.legendAnswered)}</span>
              <span>{t("Unanswered", ar.legendUnanswered)}</span>
              <span>{t("Review", ar.legendReview)}</span>
            </div>
          </div>

            {currentQuestion && (
              <div style={{ background: colors.cardBg, borderRadius: 14, padding: 22, border: `1px solid ${colors.border}`, boxShadow: colors.shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: colors.textMuted, fontSize: 12 }}>{t(`Question ${current + 1} of ${total}`, `${ar.question} ${current + 1} ${ar.of} ${total}`)}</span>
                  <span style={{ color: colors.accent, fontSize: 12, fontWeight: "bold" }}>{currentQuestion.type}</span>
                </div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: colors.text,
                    lineHeight: 1.7,
                    direction: isAr && looksLatin(currentQuestion.question_text) ? "ltr" : "rtl",
                    textAlign: isAr && looksLatin(currentQuestion.question_text) ? "left" : "right",
                    unicodeBidi: "plaintext",
                  }}
                >
                  {currentQuestion.question_text}
                </p>

                {currentQuestion.type === "mcq" && currentQuestion.options.map((opt) => (
                  <label
                    key={opt.option_id}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: `1.5px solid ${answers[currentQuestion.question_id] === String(opt.option_id) ? colors.accent : colors.border}`,
                      marginBottom: 8,
                      direction: isAr && looksLatin(opt.option_text) ? "ltr" : "rtl",
                      textAlign: isAr && looksLatin(opt.option_text) ? "left" : "right",
                      unicodeBidi: "plaintext",
                    }}
                  >
                    <input type="radio" checked={answers[currentQuestion.question_id] === String(opt.option_id)} onChange={() => setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: String(opt.option_id) }))} />
                    <span style={{ color: colors.text }}>{opt.option_text}</span>
                  </label>
                ))}

              {currentQuestion.type === "true_false" && (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                  {["true", "false"].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: value }))}
                      style={{
                        flex: 1,
                        padding: 14,
                        borderRadius: 12,
                        border: `2px solid ${answers[currentQuestion.question_id] === value ? (colors.successBorder || "#1A4A25") : colors.border}`,
                        background: answers[currentQuestion.question_id] === value ? (isAr ? colors.successBg || "#eaf8ee" : colors.successBg || "#eaf8ee") : colors.cardBg,
                        color: answers[currentQuestion.question_id] === value ? colors.text : colors.textMuted,
                        cursor: "pointer",
                        fontWeight: "bold"
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === "essay" && (
                <textarea value={answers[currentQuestion.question_id] || ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: e.target.value }))} style={{ width: "100%", minHeight: 140, padding: 12, borderRadius: 12, border: `1px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.inputText }} />
              )}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", marginTop: 14, gap: 12 }}>
            <button type="button" onClick={() => setCurrent((value) => Math.max(0, value - 1))} disabled={current === 0} style={{ padding: "11px 18px", borderRadius: 12, border: `1px solid ${colors.border}`, cursor: current === 0 ? "not-allowed" : "pointer" }}>
              {t("Previous", ar.previous)}
            </button>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", flex: 1, order: isMobile ? 3 : 2 }}>
              {questions.map((q, index) => (
                <button key={q.question_id ?? index} type="button" onClick={() => setCurrent(index)} style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${colors.border}`, background: index === current ? colors.btnPrimary : answers[q.question_id] ? colors.accent : colors.cardBg2, color: index === current ? colors.btnPrimaryTxt : colors.textMuted, cursor: "pointer" }}>
                  {index + 1}
                </button>
              ))}
            </div>

            {current < total - 1 ? (
              <button type="button" onClick={() => setCurrent((value) => Math.min(total - 1, value + 1))} style={{ padding: "11px 18px", background: colors.btnPrimary, color: colors.btnPrimaryTxt, border: "none", borderRadius: 12, cursor: "pointer" }}>
                {t("Next", ar.next)}
              </button>
            ) : (
              <button type="button" onClick={openSubmitReview} disabled={submitting} style={{ padding: "11px 18px", background: submitting ? colors.textMuted : "linear-gradient(135deg,#1A4A25,#27ae60)", color: "#fff", border: "none", borderRadius: 12, cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "..." : t("Review & Submit", ar.reviewAndSubmit)}
              </button>
            )}
          </div>

          {current === total - 1 && answered < total && !forceQuit && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(230,126,34,.10)", border: "1px solid rgba(230,126,34,.28)", borderRadius: 12, fontSize: 13, color: isDark ? "#f5c08a" : "#8B4A00", textAlign: "center" }}>
              {t(`You still have ${remaining} unanswered question(s)`, `${ar.unanswered} ${remaining} ${ar.questions} \u0628\u0639\u062f`)}
            </div>
          )}
        </div>
      </div>

      {showSubmitModal && !forceQuit && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10003, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: colors.cardBg, borderRadius: 18, padding: 22, width: "min(760px, 96vw)", maxHeight: "88vh", overflow: "auto", border: `1px solid ${colors.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ color: colors.text, fontSize: 20, fontWeight: "bold" }}>{t("Submit confirmation", ar.submitConfirm)}</div>
                <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{t("Review question status before final submission.", ar.submitConfirmHint)}</div>
              </div>
              <button type="button" onClick={() => setShowSubmitModal(false)} style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.cardBg2, color: colors.text, cursor: "pointer" }}>
                {t("Continue exam", ar.continueExam)}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
              <div style={{ background: colors.cardBg2, borderRadius: 14, padding: 14, border: `1px solid ${colors.border}` }}>
                <div style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6 }}>{t("Answered", ar.answeredCount)}</div>
                <div style={{ color: colors.text, fontWeight: "bold", fontSize: 24 }}>{answered}</div>
              </div>
              <div style={{ background: "rgba(230,126,34,.10)", borderRadius: 14, padding: 14, border: "1px solid rgba(230,126,34,.28)" }}>
                <div style={{ color: isDark ? "#f5c08a" : "#8B4A00", fontSize: 12, marginBottom: 6 }}>{t("Unanswered", ar.unansweredCount)}</div>
                <div style={{ color: isDark ? "#f5c08a" : "#8B4A00", fontWeight: "bold", fontSize: 24 }}>{remaining}</div>
              </div>
              <div style={{ background: "rgba(52,152,219,.10)", borderRadius: 14, padding: 14, border: "1px solid rgba(52,152,219,.24)" }}>
                <div style={{ color: isDark ? "#9fd3ff" : "#1f618d", fontSize: 12, marginBottom: 6 }}>{t("Review", ar.reviewCount)}</div>
                <div style={{ color: isDark ? "#9fd3ff" : "#1f618d", fontWeight: "bold", fontSize: 24 }}>{reviewCount}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {questions.map((q, index) => {
                const state = getQuestionState(q, index);
                const stateStyle = state === "answered"
                  ? { background: "#1A4A25", color: "#fff", border: "#1A4A25" }
                  : state === "review"
                    ? { background: "#1f618d", color: "#fff", border: "#1f618d" }
                    : state === "current"
                      ? { background: colors.btnPrimary, color: colors.btnPrimaryTxt, border: colors.btnPrimary }
                      : { background: colors.cardBg2, color: colors.textMuted, border: colors.border };
                return (
                  <button
                    key={q.question_id ?? index}
                    type="button"
                    onClick={() => {
                      setCurrent(index);
                      setShowSubmitModal(false);
                    }}
                    style={{ width: 42, height: 42, borderRadius: 12, border: `1px solid ${stateStyle.border}`, background: stateStyle.background, color: stateStyle.color, cursor: "pointer", fontWeight: "bold" }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => { if (firstUnansweredIndex >= 0) { setCurrent(firstUnansweredIndex); setShowSubmitModal(false); } }}
                disabled={firstUnansweredIndex < 0}
                style={{ padding: "11px 16px", borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.cardBg2, color: colors.text, cursor: firstUnansweredIndex < 0 ? "not-allowed" : "pointer", opacity: firstUnansweredIndex < 0 ? 0.6 : 1, width: isMobile ? "100%" : "auto" }}
              >
                {t("Go to first unanswered", ar.jumpToFirstUnanswered)}
              </button>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
                <button type="button" onClick={() => setShowSubmitModal(false)} style={{ padding: "11px 16px", borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.cardBg2, color: colors.text, cursor: "pointer", width: isMobile ? "100%" : "auto" }}>
                  {t("Continue exam", ar.continueExam)}
                </button>
                <button type="button" onClick={() => submitExam(false)} disabled={submitting} style={{ padding: "11px 16px", borderRadius: 12, border: "none", background: submitting ? colors.textMuted : "linear-gradient(135deg,#1A4A25,#27ae60)", color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontWeight: "bold", width: isMobile ? "100%" : "auto" }}>
                  {submitting ? "..." : t("Submit now", ar.submitNow)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ExamorShell>
  );
}

export default ExamPage;
