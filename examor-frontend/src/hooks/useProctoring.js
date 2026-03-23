import { useEffect, useRef, useCallback } from 'react';

const useProctoring = ({
    onViolation,
    onForceSubmit,
    videoRef,
    options = {
        enableCamera: true,
        requireFullscreen: true,
        monitorFocus: true,
        blockInteractions: true,
        screenCaptureProtection: false,
        allowCameraFailure: false,
        allowFullscreenFailure: false,
    },
    limits = {
        tabSwitch: 2,
        fullscreenExit: 2,
        copy: 3,
        paste: 3,
        screenshot: 2,
        cameraDenied: 1,
        cameraOff: 1,
    },
}) => {
    const active = useRef(false);
    const streamRef = useRef(null);
    const limitsRef = useRef(limits);
    const optionsRef = useRef(options);
    const watchdogTimerRef = useRef(null);
    const cameraOffStreakRef = useRef(0);
    const lastTabViolationRef = useRef(0);
    const fullscreenRecoveryPendingRef = useRef(false);
    const countsRef = useRef({
        tabSwitch: 0,
        fullscreenExit: 0,
        copy: 0,
        paste: 0,
        screenshot: 0,
        cameraDenied: 0,
        cameraOff: 0,
    });

    const getCounts = useCallback(() => ({ ...countsRef.current }), []);

    useEffect(() => {
        limitsRef.current = limits;
    }, [limits]);

    useEffect(() => {
        optionsRef.current = {
            enableCamera: options?.enableCamera !== false,
            requireFullscreen: options?.requireFullscreen !== false,
            monitorFocus: options?.monitorFocus !== false,
            blockInteractions: options?.blockInteractions !== false,
            screenCaptureProtection: options?.screenCaptureProtection === true,
            allowCameraFailure: options?.allowCameraFailure === true,
            allowFullscreenFailure: options?.allowFullscreenFailure === true,
        };
    }, [options]);

    const bump = useCallback((key) => {
        countsRef.current[key] = (countsRef.current[key] || 0) + 1;
        return countsRef.current[key];
    }, []);

    const forceSubmit = useCallback((reason) => {
        if (!active.current) return;
        active.current = false;

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (videoRef?.current) {
            videoRef.current.srcObject = null;
        }

        try {
            if (document.fullscreenElement) document.exitFullscreen();
        } catch (_) {}

        onViolation?.('FORCE_SUBMIT', reason);
        onForceSubmit?.(reason, getCounts());
    }, [getCounts, onForceSubmit, onViolation, videoRef]);

    const warnOrForce = useCallback((key, warningMsg, forceMsg) => {
        const n = bump(key);
        const limit = limitsRef.current?.[key] ?? 3;

        if (n >= limit) {
            forceSubmit(forceMsg);
            return;
        }

        const warnMax = Math.max(1, limit - 1);
        const warnNum = Math.min(n, warnMax);
        onViolation?.(key.toUpperCase(), `${warningMsg} (إنذار ${warnNum} من ${warnMax})`);
    }, [bump, forceSubmit, onViolation]);

    const registerTabViolation = useCallback((warningMsg, forceMsg) => {
        const now = Date.now();
        if (now - lastTabViolationRef.current < 1200) return;
        lastTabViolationRef.current = now;
        warnOrForce('tabSwitch', warningMsg, forceMsg);
    }, [warnOrForce]);

    const handleVisibility = useCallback(() => {
        if (!active.current) return;
        if (!optionsRef.current.monitorFocus) return;
        if (document.hidden) {
            registerTabViolation(
                'تم الخروج من تبويب الامتحان',
                'تكرار الخروج من تبويب الامتحان - تم إنهاء الامتحان'
            );
        }
    }, [registerTabViolation]);

    const handleBlur = useCallback(() => {
        if (!active.current) return;
        if (!optionsRef.current.monitorFocus) return;

        setTimeout(() => {
            if (!document.hasFocus() && active.current) {
                registerTabViolation(
                    'تم الخروج من نافذة الامتحان',
                    'تكرار الخروج من نافذة الامتحان - تم إنهاء الامتحان'
                );
            }
        }, 500);
    }, [registerTabViolation]);

    const handleFsChange = useCallback(() => {
        if (!active.current) return;
        if (!optionsRef.current.requireFullscreen) return;

        const inFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (inFs) {
            fullscreenRecoveryPendingRef.current = false;
            return;
        }

        if (!fullscreenRecoveryPendingRef.current) {
            fullscreenRecoveryPendingRef.current = true;
            if (optionsRef.current.allowFullscreenFailure) {
                onViolation?.('FULLSCREENEXIT', 'تم الخروج من وضع ملء الشاشة');
                return;
            }
            warnOrForce(
                'fullscreenExit',
                'تم الخروج من وضع ملء الشاشة',
                'تكرار الخروج من وضع ملء الشاشة - تم إنهاء الامتحان'
            );
            setTimeout(async () => {
                if (!active.current) return;
                if (document.fullscreenElement || document.webkitFullscreenElement) return;
                try {
                    const el = document.documentElement;
                    if (el.requestFullscreen) await el.requestFullscreen();
                    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                } catch (_) {}
            }, 150);
        }
    }, [warnOrForce]);

    const blockCopy = useCallback((e) => {
        if (!active.current) return;
        if (!optionsRef.current.blockInteractions) return;

        e.preventDefault();
        warnOrForce(
            'copy',
            'محاولة نسخ ممنوعة أثناء الامتحان',
            'تكرار محاولة النسخ - تم إنهاء الامتحان'
        );
    }, [warnOrForce]);

    const blockPaste = useCallback((e) => {
        if (!active.current) return;
        if (!optionsRef.current.blockInteractions) return;

        e.preventDefault();
        warnOrForce(
            'paste',
            'محاولة لصق ممنوعة أثناء الامتحان',
            'تكرار محاولة اللصق - تم إنهاء الامتحان'
        );
    }, [warnOrForce]);

    const blockMenu = useCallback((e) => {
        if (active.current && optionsRef.current.blockInteractions) e.preventDefault();
    }, []);

    const blockKeys = useCallback((e) => {
        if (!active.current) return;
        if (!optionsRef.current.blockInteractions) return;

        const key = String(e.key || '').toLowerCase();
        const screenshotAttempt =
            optionsRef.current.screenCaptureProtection &&
            (
                e.key === 'PrintScreen' ||
                (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(key)) ||
                (e.ctrlKey && e.shiftKey && (key === 's' || key === '4'))
            );

        if (screenshotAttempt) {
            e.preventDefault();
            e.stopPropagation();
            warnOrForce(
                'screenshot',
                'محاولة تصوير الشاشة غير مسموحة أثناء الامتحان',
                'تكرار محاولة تصوير الشاشة - تم إنهاء الامتحان'
            );
            return;
        }

        const bad =
            ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 'a', 'p', 'f', 's', 'u', 'r'].includes(key)) ||
            ['F12', 'F5', 'BrowserBack', 'BrowserForward'].includes(e.key) ||
            (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
            (e.altKey && (e.key === 'Tab' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) ||
            (e.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName));

        if (bad) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, [warnOrForce]);

    const blockSelect = useCallback((e) => {
        if (active.current && optionsRef.current.blockInteractions) e.preventDefault();
    }, []);

    const startCamera = useCallback(async () => {
        if (!optionsRef.current.enableCamera) {
            return true;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, facingMode: 'user' },
                audio: false,
            });

            streamRef.current = stream;

            try {
                const [track] = stream.getVideoTracks();
                if (track) {
                    track.onended = () => {
                        if (!active.current) return;

                        warnOrForce(
                            'cameraOff',
                            'تم إيقاف الكاميرا أثناء الامتحان',
                            'تم إيقاف الكاميرا أثناء الامتحان - تم إنهاء الامتحان'
                        );
                    };
                }
            } catch (_) {}

            if (videoRef?.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {});
            }

            return true;
        } catch (err) {
            const n = bump('cameraDenied');
            const limit = limitsRef.current?.cameraDenied ?? 1;
            const isInUse =
                err?.name === 'NotReadableError' ||
                err?.name === 'TrackStartError' ||
                /in use|Could not start|NotReadableError/i.test(String(err?.message || ''));

            onViolation?.(
                'CAMERA_DENIED',
                isInUse
                    ? 'الكاميرا مستخدمة في تبويب أو تطبيق آخر - أغلقه ثم أعد المحاولة'
                    : 'تم رفض الكاميرا - المراقبة المرئية غير متاحة'
            );

            if (n >= limit && !optionsRef.current.allowCameraFailure) {
                forceSubmit(
                    isInUse
                        ? 'الكاميرا مستخدمة في مكان آخر - لا يمكن إكمال الامتحان'
                        : 'تم رفض الكاميرا - لا يمكن إكمال الامتحان'
                );
            }

            return false;
        }
    }, [bump, forceSubmit, onViolation, videoRef, warnOrForce]);

    const startProctoring = useCallback(async () => {
        active.current = true;
        lastTabViolationRef.current = 0;
        fullscreenRecoveryPendingRef.current = false;
        countsRef.current = {
            tabSwitch: 0,
            fullscreenExit: 0,
            copy: 0,
            paste: 0,
            screenshot: 0,
            cameraDenied: 0,
            cameraOff: 0,
        };

        if (optionsRef.current.requireFullscreen) {
            try {
                const el = document.documentElement;
                if (el.requestFullscreen) await el.requestFullscreen();
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            } catch (_) {}
        }

        await startCamera();

        if (watchdogTimerRef.current) clearInterval(watchdogTimerRef.current);
        watchdogTimerRef.current = setInterval(() => {
            if (!active.current) return;

            const stream = streamRef.current;
            const tracks = stream?.getVideoTracks?.() || [];
            const track = tracks[0];
            const ok = !!track && track.readyState === 'live';

            if (ok) {
                cameraOffStreakRef.current = 0;
                return;
            }

            cameraOffStreakRef.current += 1;
            if (cameraOffStreakRef.current >= 3) {
                cameraOffStreakRef.current = 0;
                warnOrForce(
                    'cameraOff',
                    'الكاميرا توقفت أثناء الامتحان',
                    'الكاميرا توقفت أثناء الامتحان - تم إنهاء الامتحان'
                );
            }
        }, 2000);

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
        document.addEventListener('copy', blockCopy);
        document.addEventListener('cut', blockCopy);
        document.addEventListener('paste', blockPaste);
        document.addEventListener('contextmenu', blockMenu);
        document.addEventListener('keydown', blockKeys);
        document.addEventListener('selectstart', blockSelect);

        if (optionsRef.current.blockInteractions) {
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
        }
    }, [
        blockCopy,
        blockKeys,
        blockMenu,
        blockPaste,
        blockSelect,
        handleBlur,
        handleFsChange,
        handleVisibility,
        startCamera,
        warnOrForce,
    ]);

    const requestCamera = useCallback(async () => {
        const ok = await startCamera();
        return ok;
    }, [startCamera]);

    const stopProctoring = useCallback(() => {
        active.current = false;
        cameraOffStreakRef.current = 0;

        if (watchdogTimerRef.current) {
            clearInterval(watchdogTimerRef.current);
            watchdogTimerRef.current = null;
        }

        document.removeEventListener('visibilitychange', handleVisibility);
        window.removeEventListener('blur', handleBlur);
        document.removeEventListener('fullscreenchange', handleFsChange);
        document.removeEventListener('webkitfullscreenchange', handleFsChange);
        document.removeEventListener('copy', blockCopy);
        document.removeEventListener('cut', blockCopy);
        document.removeEventListener('paste', blockPaste);
        document.removeEventListener('contextmenu', blockMenu);
        document.removeEventListener('keydown', blockKeys);
        document.removeEventListener('selectstart', blockSelect);

        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (videoRef?.current) {
            videoRef.current.srcObject = null;
        }

        try {
            if (optionsRef.current.requireFullscreen && (document.fullscreenElement || document.webkitFullscreenElement)) {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            }
        } catch (_) {}
    }, [
        blockCopy,
        blockKeys,
        blockMenu,
        blockPaste,
        blockSelect,
        handleBlur,
        handleFsChange,
        handleVisibility,
        videoRef,
    ]);

    useEffect(() => () => {
        if (active.current) stopProctoring();
    }, [stopProctoring]);

    return { startProctoring, stopProctoring, requestCamera, getViolations: getCounts };
};

export default useProctoring;
