import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';

// ── CSS Animations ───────────────────────────────────────────
const injectStyles = () => {
    if (document.getElementById('examor-styles')) return;
    const s = document.createElement('style');
    s.id = 'examor-styles';
    s.textContent = `
        @keyframes navIn    { from{opacity:0;transform:translateY(-100%)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(32px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes rotateCW { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes rotateCCW{ from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes dotPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.8)} }
        @keyframes btnPulse { 0%,100%{box-shadow:0 0 0 0 rgba(139,107,74,.3)} 50%{box-shadow:0 0 0 12px rgba(139,107,74,0)} }
        @keyframes shine    { 0%{left:-100%} 100%{left:200%} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
        @keyframes slideR   { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideL   { from{opacity:0;transform:translateX(14px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes drawSVG  { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }
        @keyframes lineGrow { from{width:0} to{width:52px} }
        @keyframes barFill  { from{width:0} to{width:var(--w)} }
        @keyframes overlayIn{ from{opacity:0} to{opacity:1} }
        @keyframes modalIn  { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatY   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-18px)} }

        .el-navIn     { animation: navIn .5s ease both }
        .el-fadeUp-1  { animation: fadeUp .7s ease .3s both }
        .el-fadeUp-2  { animation: fadeUp .7s ease .45s both }
        .el-fadeUp-3  { animation: fadeUp .7s ease .6s both }
        .el-fadeUp-4  { animation: fadeUp .7s ease .75s both }
        .el-float     { animation: float 4.5s ease-in-out infinite }
        .el-rotateCW  { animation: rotateCW  30s linear infinite }
        .el-rotateCCW { animation: rotateCCW 25s linear infinite }

        .deco-wrap    { position:absolute; border-radius:50%; pointer-events:all; cursor:default }
        .deco-wrap-1  { animation: floatY 7s ease-in-out infinite }
        .deco-wrap-2  { animation: floatY 9s ease-in-out 1.5s infinite }
        .deco-wrap-3  { animation: floatY 11s ease-in-out 3s infinite }

        .deco-ring    { width:100%; height:100%; border-radius:50%; position:relative; transition:border-color .5s ease, box-shadow .5s ease }
        .deco-ring::before { content:''; position:absolute; border-radius:50%; border-style:dashed; border-width:1px }

        .deco-ring-1  { animation: rotateCW  30s linear infinite }
        .deco-ring-1::before { inset:18px; animation: rotateCCW 20s linear infinite; border-color:rgba(201,168,130,.45) }
        .deco-ring-2  { animation: rotateCCW 25s linear infinite }
        .deco-ring-2::before { inset:16px; animation: rotateCW  16s linear infinite; border-color:rgba(74,111,165,.42) }
        .deco-ring-3  { animation: rotateCW  38s linear infinite }
        .deco-ring-3::before { inset:14px; animation: rotateCCW 24s linear infinite; border-color:rgba(74,128,80,.42) }

        .deco-wrap:hover .deco-ring-1 { animation-duration:6s }
        .deco-wrap:hover .deco-ring-1::before { animation-duration:4s }
        .deco-wrap:hover .deco-ring-2 { animation-duration:5s }
        .deco-wrap:hover .deco-ring-2::before { animation-duration:3s }
        .deco-wrap:hover .deco-ring-3 { animation-duration:7s }
        .deco-wrap:hover .deco-ring-3::before { animation-duration:4s }
        .el-dotPulse  { animation: dotPulse 2.2s infinite }
        .el-btnPulse  { animation: btnPulse 3s infinite }
        .el-shine     { position:relative; overflow:hidden }
        .el-shine::after { content:''; position:absolute; top:0; left:-100%; width:50%; height:100%; background:rgba(255,255,255,.12); transform:skewX(-20deg); animation:shine 3.5s infinite }
        .el-drawSVG   { stroke-dasharray:300; stroke-dashoffset:300; animation:drawSVG 1.8s ease forwards }
        .el-drawSVG-2 { stroke-dasharray:300; stroke-dashoffset:300; animation:drawSVG 1.5s ease .8s forwards }
        .el-drawSVG-3 { stroke-dasharray:300; stroke-dashoffset:300; animation:drawSVG 1.5s ease 1s forwards }
        .el-drawSVG-4 { stroke-dasharray:300; stroke-dashoffset:300; animation:drawSVG 1.5s ease 1.2s forwards }
        .el-check     { animation:scaleIn .5s ease 1.4s both }
        .el-lineGrow  { width:0; animation:lineGrow .6s ease .3s both }
        .el-barFill   { animation:barFill 1.8s ease both }
        .el-slideR    { animation:slideR .25s ease both }
        .el-slideL    { animation:slideL .25s ease .05s both }
        .el-dotIn     { animation:scaleIn .2s ease both }

        .scroll-rv   { opacity:0; transform:translateY(36px); transition:opacity .7s ease, transform .7s ease }
        .scroll-rv.visible { opacity:1; transform:translateY(0) }

        .role-card   { transition: all .4s }
        .role-card:hover { transform: translateY(-10px) }
        .role-card:hover .role-bar { transform: scaleX(1) !important }
        .role-card:hover .role-icon { transform: rotate(-8deg) scale(1.12) !important }

        .feat-cell   { transition: background .35s, box-shadow .35s }
        .feat-cell:hover .feat-icon { transform: translateY(-5px) scale(1.1) }
        .feat-icon   { transition: transform .35s }

        .how-card    { transition: all .35s }
        .how-card:hover { transform: translateY(-6px) !important }
        .how-card:hover::before { transform: scaleY(1) !important }
        .how-num     { transition: all .35s }
        .how-card:hover .how-num { transform: rotate(6deg) scale(1.12) }

        .faq-item    { transition: all .35s }
        .faq-q       { cursor: pointer; transition: color .2s }
        .faq-plus    { transition: transform .35s; display: inline-block }

        .contact-overlay { display:none; position:fixed; inset:0; z-index:1000; align-items:center; justify-content:center; animation:overlayIn .25s ease }
        .contact-overlay.open { display:flex }
        .contact-modal { animation:modalIn .35s ease }

        .mock-tab    { transition: all .25s }
        .mock-stat   { transition: transform .2s }
        .mock-stat:hover { transform: scale(1.06) }
        .mock-bar-fill { animation: barFill 1.8s ease both }
    `;
    document.head.appendChild(s);
};

// ── useScrollReveal ──────────────────────────────────────────
const useScrollReveal = () => {
    useEffect(() => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.12 });
        document.querySelectorAll('.scroll-rv').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);
};

const useViewport = () => {
    const [viewportWidth, setViewportWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1280
    );

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        viewportWidth,
        isTablet: viewportWidth <= 980,
        isMobile: viewportWidth <= 640,
        isNarrowMobile: viewportWidth <= 430,
    };
};

// ── SplitButton ──────────────────────────────────────────────
function SplitButton({ navigate, size = 'sm' }) {
    const [open, setOpen] = useState(false);
    const { isDark } = useTheme();
    const ref = useRef();
    const { i18n } = useTranslation();
    const { isNarrowMobile } = useViewport();
    const ar = i18n.language === 'ar';

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const isLg  = size === 'lg';
    const btnBg = open
        ? (isDark ? '#E8D5B0' : '#8B6B4A')
        : (isDark ? '#C9A882' : '#4A2E1A');
    const btnColor = open
        ? (isDark ? '#0F1D35' : '#FAF8F4')
        : (isDark ? '#0F1D35' : '#FAF8F4');
    const borderR = open ? (isLg ? '14px 14px 0 0' : '9px 9px 0 0') : (isLg ? 14 : 9);
    const optBorderColor = isDark ? '#E8D5B0' : '#8B6B4A';

    return (
        <div ref={ref} style={{ position:'relative', display:'inline-flex', flexDirection:'column', alignItems:'flex-start', zIndex:100, maxWidth:'100%' }}>
            <button className="el-btnPulse el-shine"
                onClick={() => setOpen(p => !p)}
                style={{ display:'flex', alignItems:'center', gap:isNarrowMobile ? 6 : 8, padding: isLg ? (isNarrowMobile ? '13px 22px' : '14px 40px') : (isNarrowMobile ? '8px 14px' : '9px 20px'), background: btnBg, color: btnColor, border:'none', borderRadius: borderR, fontSize: isLg ? (isNarrowMobile ? 14 : 16) : (isNarrowMobile ? 12 : 13), fontWeight:'bold', cursor:'pointer', transition:'all .25s', position:'relative', overflow:'hidden', minWidth:isLg ? (isNarrowMobile ? 220 : undefined) : (isNarrowMobile ? 162 : undefined), maxWidth:'100%', justifyContent:'center' }}
            >
                <svg width={isLg?15:12} height={isLg?15:12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {ar ? (isLg ? 'جرّب الآن مجاناً' : 'جرّب الآن') : (isLg ? 'Try Now Free' : 'Try Now')}
                <span style={{ display:'flex', alignItems:'center', transition:'transform .3s', transform: open ? 'rotate(180deg)' : 'none' }}>
                    <svg width={isLg?13:11} height={isLg?13:11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
            </button>

            {open && (
                <div style={{ display:'flex', gap:4, justifyContent:'center', padding:'3px 0' }}>
                    {[0,1,2].map(i => <div key={i} className="el-dotIn" style={{ width:5, height:5, borderRadius:'50%', background: isDark ? '#E8D5B0' : '#8B6B4A', animationDelay:`${i*.06}s` }} />)}
                </div>
            )}

            {open && (
                <div style={{ display:'flex', border:`${isLg?2:1.5}px solid ${optBorderColor}`, borderTop:'none', borderRadius:`0 0 ${isLg?14:9}px ${isLg?14:9}px`, overflow:'hidden', minWidth: isLg ? (isNarrowMobile ? 220 : 280) : (isNarrowMobile ? 162 : 200), maxWidth:'100%', boxShadow:'0 8px 24px rgba(0,0,0,.15)' }}>
                    <button className="el-slideR"
                        onClick={() => { setOpen(false); navigate('/login'); }}
                        style={{ flex:1, padding: isLg?'14px 16px':'11px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'pointer', border:'none', background: isDark ? '#1a2d4e' : '#F0EBE1', transition:'background .2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? '#243d65' : '#E8DDD0'}
                        onMouseLeave={e => e.currentTarget.style.background = isDark ? '#1a2d4e' : '#F0EBE1'}
                    >
                        <svg width={isLg?17:15} height={isLg?17:15} viewBox="0 0 24 24" fill="none" stroke={isDark?'#E8D5B0':'#4A2E1A'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                        <span style={{ fontSize: isLg?12:11, fontWeight:'bold', color: isDark?'#E8D5B0':'#4A2E1A' }}>{ar ? 'تسجيل الدخول' : 'Login'}</span>
                        <span style={{ fontSize: isLg?10:9, color: isDark?'#6B7FA0':'#8B6B4A' }}>{ar ? 'عندي حساب' : 'I have account'}</span>
                    </button>
                    <button className="el-slideL"
                        onClick={() => { setOpen(false); navigate('/register'); }}
                        style={{ flex:1, padding: isLg?'14px 16px':'11px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'pointer', border:'none', background: isDark ? '#C9A882' : '#4A2E1A', transition:'background .2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? '#b8956f' : '#3A1E0A'}
                        onMouseLeave={e => e.currentTarget.style.background = isDark ? '#C9A882' : '#4A2E1A'}
                    >
                        <svg width={isLg?17:15} height={isLg?17:15} viewBox="0 0 24 24" fill="none" stroke={isDark?'#0F1D35':'#FAF8F4'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="8" r="4"/><path d="M2 20c0-4 3.6-7 8-7s8 3 8 7"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                        <span style={{ fontSize: isLg?12:11, fontWeight:'bold', color: isDark?'#0F1D35':'#FAF8F4' }}>{ar ? 'ابدأ مجاناً' : 'Start Free'}</span>
                        <span style={{ fontSize: isLg?10:9, color: isDark?'#4A2E1A':'#C9A882' }}>{ar ? 'حساب جديد' : 'New account'}</span>
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Navbar ───────────────────────────────────────────────────
function Navbar({ navigate }) {
    const { isDark, toggle } = useTheme();
    const { i18n } = useTranslation();
    const [scrolled, setScrolled] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth : 1280
    );
    const ar = i18n.language === 'ar';
    const isTablet = viewportWidth <= 980;
    const isMobile = viewportWidth <= 640;
    const isNarrowMobile = viewportWidth <= 430;
    const hideNavCta = isMobile;

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleLang = () => {
        const n = ar ? 'en' : 'ar';
        i18n.changeLanguage(n);
        localStorage.setItem('language', n);
        document.dir = n === 'ar' ? 'rtl' : 'ltr';
    };

    return (
        <nav className="el-navIn" style={{
            background: isDark ? 'rgba(15,29,53,.97)' : 'rgba(250,248,244,.97)',
            backdropFilter: 'blur(12px)',
            padding: isMobile ? (isNarrowMobile ? '10px 10px' : '10px 14px') : isTablet ? '12px 22px' : '0 52px',
            minHeight: isMobile ? (isNarrowMobile ? 76 : 80) : 66,
            display:'flex',
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'space-between',
            flexWrap:'wrap',
            gap: isMobile ? (isNarrowMobile ? 7 : 10) : 14,
            position:'sticky', top:0, zIndex:200,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : '#E8DDD0'}`,
            boxShadow: scrolled ? (isDark ? '0 4px 24px rgba(0,0,0,.3)' : '0 4px 24px rgba(74,46,26,.08)') : 'none',
            transition: 'all .3s',
        }}>
            {/* Logo — always LTR */}
            <div style={{ display:'flex', alignItems:'center', gap:isNarrowMobile ? 8 : 10, direction:'ltr', minWidth:'auto', justifyContent:'flex-start', flex:'0 1 auto', width:'auto' }}>
                <div style={{ width:isMobile ? (isNarrowMobile ? 30 : 32) : 36, height:isMobile ? (isNarrowMobile ? 30 : 32) : 36, border:`1.5px solid ${isDark?'#C9A882':'#8B6B4A'}`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', transition:'all .3s', flexShrink:0 }}>
                    <svg width={isMobile ? (isNarrowMobile ? "15" : "16") : "18"} height={isMobile ? (isNarrowMobile ? "15" : "16") : "18"} viewBox="0 0 24 24" fill="none" stroke={isDark?'#C9A882':'#8B6B4A'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="9" y1="13" x2="15" y2="13"/>
                        <line x1="9" y1="17" x2="12" y2="17"/>
                    </svg>
                </div>
                <span style={{ color: isDark?'#E8D5B0':'#4A2E1A', fontSize:isMobile ? (isNarrowMobile ? 15 : 17) : 19, fontWeight:'bold', letterSpacing:isMobile ? (isNarrowMobile ? 1.2 : 1.8) : 2.5 }}>EXAMOR</span>
            </div>

            {/* Right buttons */}
            <div style={{
                display:'flex',
                gap:isMobile ? (isNarrowMobile ? 6 : 10) : 10,
                alignItems:'center',
                flexWrap:'wrap',
                justifyContent:isMobile ? 'flex-start' : 'flex-end',
                width:'auto',
                flex:'0 1 auto'
            }}>
                <button onClick={toggleLang} style={{ order:isMobile ? 2 : 2, width:'auto', padding:isMobile ? (isNarrowMobile ? '7px 10px' : '7px 12px') : '7px 14px', background: isDark?'rgba(255,255,255,.06)':'#F0EBE1', color: isDark?'#8B9DC0':'#8B6B4A', border:`1px solid ${isDark?'rgba(255,255,255,.08)':'#E8DDD0'}`, borderRadius:8, fontSize:isMobile ? (isNarrowMobile ? 10 : 11) : 12, fontWeight:'bold', cursor:'pointer', transition:'all .25s' }}>
                    {ar ? 'EN' : 'AR'}
                </button>

                <button onClick={toggle} style={{ order:isMobile ? 1 : 1, width:'auto', display:'flex', alignItems:'center', justifyContent:'center', gap:isNarrowMobile ? 5 : 7, padding:isMobile ? (isNarrowMobile ? '7px 10px' : '7px 12px') : '7px 16px', background: isDark?'rgba(255,255,255,.06)':'#F0EBE1', color: isDark?'#E8D5B0':'#4A2E1A', border:`1px solid ${isDark?'rgba(255,255,255,.08)':'#E8DDD0'}`, borderRadius:8, fontSize:isMobile ? (isNarrowMobile ? 10 : 11) : 12, fontWeight:'bold', cursor:'pointer', transition:'all .25s' }}>
                    {isDark
                        ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Light</>
                        : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> Dark</>
                    }
                </button>

                {!hideNavCta && (
                    <div style={{ minWidth:0, order:isMobile ? 3 : 3, marginInlineStart:0 }}>
                        <SplitButton navigate={navigate} size="sm" />
                    </div>
                )}
            </div>
        </nav>
    );
}

// ── HeroLogo ─────────────────────────────────────────────────
function HeroLogo() {
    const { isDark } = useTheme();
    return (
        <div className="el-float" style={{ marginBottom:28 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <rect className="el-drawSVG"   x="18" y="8" width="52" height="66" rx="6" stroke={isDark?'#C9A882':'#8B6B4A'} strokeWidth="2.5"/>
                <line className="el-drawSVG-2" x1="28" y1="30" x2="58" y2="30" stroke={isDark?'#C9A882':'#8B6B4A'} strokeWidth="2" strokeLinecap="round"/>
                <line className="el-drawSVG-3" x1="28" y1="40" x2="58" y2="40" stroke={isDark?'#C9A882':'#8B6B4A'} strokeWidth="2" strokeLinecap="round"/>
                <line className="el-drawSVG-4" x1="28" y1="50" x2="44" y2="50" stroke={isDark?'#C9A882':'#8B6B4A'} strokeWidth="2" strokeLinecap="round"/>
                <circle className="el-check" cx="68" cy="72" r="16" fill={isDark?'#1a2d4e':'#F0EBE1'} stroke="#4A8050" strokeWidth="2.5"/>
                <path className="el-check" d="M60 72l6 6 10-10" stroke="#4A8050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay:'1.6s' }}/>
            </svg>
        </div>
    );
}

// ── MockDashboard ────────────────────────────────────────────
function MockDashboard() {
    const [tab, setTab] = useState('doctor');
    const { isDark } = useTheme();

    const data = {
        stats: {
            doctor:  [['200','طالب'],['8','امتحان'],['174','محاولة']],
            student: [['5','امتحانات'],['87%','متوسط'],['150','أعلى']],
            admin:   [['634','مستخدم'],['3','جامعة'],['30','امتحان']],
        },
        bars: {
            doctor: [['Database Systems',85,'linear-gradient(to left,#1B3A6B,#4A6FA5)'],['Systems Analysis',72,'linear-gradient(to left,#1B3A6B,#4A6FA5)'],['Management',91,'linear-gradient(to left,#1B3A6B,#4A6FA5)']],
            admin:  [['Sadat Academy',45,'linear-gradient(to left,#4A2E1A,#8B6B4A)'],['Tebah Academy',33,'linear-gradient(to left,#1A4A25,#4A8050)'],['AIC',22,'linear-gradient(to left,#1B3A6B,#4A6FA5)']],
        },
        rows: {
            doctor:  [['SADAT-DB-FIN','150/150','green'],['SADAT-SA-MID','87/100','amber'],['SADAT-MGT-Q1','جارٍ','blue']],
            student: [['Database – Final','150/150','green'],['Algorithms – Mid','87/100','amber'],['Networks – Final','متاح','blue']],
            admin:   [['طلاب نشطون','502+','green'],['امتحانات جارية','3','blue'],['محاولات اليوم','47','olive']],
        },
    };

    const badge = {
        green: { background: isDark?'rgba(26,74,37,.3)':'#E8F2E8', color: isDark?'#6BCF7F':'#1A4A25' },
        amber: { background: isDark?'rgba(139,74,0,.3)':'#FFF3E0',  color: isDark?'#FFB74D':'#8B4A00' },
        blue:  { background: isDark?'rgba(27,58,107,.3)':'#E8EEF8', color: isDark?'#90CAF9':'#1B3A6B' },
        olive: { background: isDark?'rgba(74,46,26,.3)':'#F0EBE1',  color: isDark?'#C9A882':'#4A2E1A' },
    };

    const mockBg   = isDark ? '#1a2d4e' : '#fff';
    const tabBg    = isDark ? '#0F1D35' : '#F0EBE1';
    const tabOnBg  = isDark ? '#162238' : '#fff';
    const statBg   = isDark ? '#243d65' : '#F8F5F0';
    const barBg    = isDark ? '#0F1D35' : '#EDE6D8';
    const rowBorder= isDark ? 'rgba(255,255,255,.06)' : '#F5F0E8';
    const textMain = isDark ? '#E8D5B0' : '#4A2E1A';
    const textMuted= isDark ? '#6B7FA0' : '#8B6B4A';

    return (
        <div className="el-float" style={{ background: mockBg, borderRadius:20, overflow:'hidden', boxShadow: isDark?'0 24px 80px rgba(0,0,0,.5)':'0 24px 80px rgba(74,46,26,.15)', direction:'ltr', border:`1px solid ${isDark?'rgba(255,255,255,.08)':'#E8DDD0'}` }}>
            <div style={{ background: isDark?'#0a1628':'#4A2E1A', padding:'10px 16px', display:'flex', gap:6, alignItems:'center' }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width:8, height:8, borderRadius:'50%', background:c }} />)}
                <span style={{ color: isDark?'#2C3E6B':'#8B6B4A', fontSize:10, marginRight:'auto', background:'rgba(255,255,255,.06)', padding:'2px 12px', borderRadius:10 }}>examor.app</span>
            </div>
            <div style={{ display:'flex', background: tabBg, borderBottom:`1px solid ${isDark?'rgba(255,255,255,.06)':'#E8DDD0'}` }}>
                {[{key:'doctor',label:'📊 الدكتور'},{key:'student',label:'🎓 الطالب'},{key:'admin',label:'⚙️ الأدمن'}].map(t => (
                    <button key={t.key} className="mock-tab"
                        onClick={() => setTab(t.key)}
                        style={{ flex:1, padding:'9px 0', fontSize:11, fontWeight:'bold', border:'none', cursor:'pointer', color: tab===t.key ? textMain : textMuted, background: tab===t.key ? tabOnBg : 'transparent', borderBottom: tab===t.key ? '2px solid #8B6B4A' : '2px solid transparent' }}
                    >{t.label}</button>
                ))}
            </div>
            <div style={{ padding:18 }}>
                <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                    {data.stats[tab].map(([n,l],i) => (
                        <div key={i} className="mock-stat" style={{ flex:1, background: statBg, borderRadius:10, padding:'10px 5px', textAlign:'center', border:`1px solid ${isDark?'rgba(255,255,255,.06)':'#EDE6D8'}` }}>
                            <div style={{ fontSize:19, fontWeight:'bold', color: textMain }}>{n}</div>
                            <div style={{ fontSize:9, color: textMuted, marginTop:2 }}>{l}</div>
                        </div>
                    ))}
                </div>
                {data.bars[tab]?.map(([name,w,bg],i) => (
                    <div key={i} style={{ marginBottom:8 }}>
                        <div style={{ fontSize:9, color: textMuted, display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                            <span>{name}</span><span>{w}%</span>
                        </div>
                        <div style={{ background: barBg, borderRadius:4, height:5, overflow:'hidden' }}>
                            <div className="mock-bar-fill" style={{ '--w':`${w}%`, height:5, borderRadius:4, background:bg, width:`${w}%`, animationDelay:`${i*.3}s` }} />
                        </div>
                    </div>
                ))}
                <div style={{ marginTop:12 }}>
                    {data.rows[tab].map(([name,val,color],i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${rowBorder}` }}>
                            <span style={{ fontSize:10, color: textMain }}>{name}</span>
                            <span style={{ padding:'2px 8px', borderRadius:10, fontSize:9, fontWeight:'bold', ...badge[color] }}>{val}</span>
                        </div>
                    ))}
                </div>
                {tab==='student' && (
                    <div style={{ marginTop:10, background: isDark?'rgba(27,58,107,.2)':'#E8EEF8', borderRadius:10, padding:'10px 12px', textAlign:'right' }}>
                        <div style={{ fontSize:9, color: isDark?'#4A6FA5':'#1B3A6B', fontWeight:'bold', marginBottom:3 }}>امتحان قادم</div>
                        <div style={{ fontSize:11, color: textMain, fontWeight:'bold' }}>Networks – Final</div>
                        <div style={{ fontSize:10, color: isDark?'#C9A882':'#8B6B4A', marginTop:2 }}>THEB-NET-FIN · 90 دقيقة</div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Hero ─────────────────────────────────────────────────────
void MockDashboard;

function Hero({ navigate }) {
    const { isDark } = useTheme();
    const { i18n } = useTranslation();
    const { isTablet, isMobile } = useViewport();
    const ar = i18n.language === 'ar';

    const heroBg = isDark
        ? 'linear-gradient(160deg, #0a1628 0%, #0F1D35 50%, #0d2040 100%)'
        : '#FAF8F4';

    return (
        <section style={{ minHeight:'auto', background: heroBg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:isMobile ? '30px 16px 28px' : (isTablet ? '46px 24px 38px' : '52px 52px 50px'), position:'relative', overflow:'hidden', textAlign:'center', transition:'background .3s' }}>
            {/* Decorative glow blobs — opacity أقوى */}
            {[
                { w:520, h:520, top:-120, right:-120, bg: isDark?'radial-gradient(circle,rgba(201,168,130,.18) 0%,transparent 65%)':'radial-gradient(circle,rgba(201,168,130,.25) 0%,transparent 65%)' },
                { w:480, h:480, bottom:-100, left:-100, bg: isDark?'radial-gradient(circle,rgba(74,128,80,.14) 0%,transparent 65%)':'radial-gradient(circle,rgba(74,128,80,.20) 0%,transparent 65%)' },
            ].map((c,i) => <div key={i} style={{ position:'absolute', width:c.w, height:c.h, top:c.top, right:c.right, bottom:c.bottom, left:c.left, borderRadius:'50%', background:c.bg, pointerEvents:'none' }} />)}

            {/* Decorative rings — wrapper بيعمل float، ring جوّاه بيعمل rotate */}
            {/* Ring 1: ذهبي */}
            {!isMobile && <div className="deco-wrap deco-wrap-1" style={{ width:isTablet ? 260 : 360, height:isTablet ? 260 : 360, top:'30%', left:isTablet ? -40 : -80 }}>
                <div className="deco-ring deco-ring-1" style={{
                    border: `2px solid ${isDark?'rgba(201,168,130,.40)':'rgba(201,168,130,.32)'}`,
                    '--before-color': isDark?'rgba(201,168,130,.55)':'rgba(201,168,130,.45)',
                }} onMouseEnter={e=>{ const r=e.currentTarget; r.style.borderColor=isDark?'rgba(201,168,130,.75)':'rgba(201,168,130,.70)'; r.style.boxShadow='0 0 10px rgba(201,168,130,.12)'; }} onMouseLeave={e=>{ const r=e.currentTarget; r.style.borderColor=isDark?'rgba(201,168,130,.40)':'rgba(201,168,130,.32)'; r.style.boxShadow='none'; }} />
            </div>}
            {/* Ring 2: أزرق */}
            {!isMobile && <div className="deco-wrap deco-wrap-2" style={{ width:isTablet ? 220 : 280, height:isTablet ? 220 : 280, bottom:'10%', right:isTablet ? -35 : -60 }}>
                <div className="deco-ring deco-ring-2" style={{
                    border: `2px solid ${isDark?'rgba(74,111,165,.42)':'rgba(74,111,165,.30)'}`,
                }} onMouseEnter={e=>{ const r=e.currentTarget; r.style.borderColor=isDark?'rgba(74,111,165,.72)':'rgba(74,111,165,.68)'; r.style.boxShadow='0 0 10px rgba(74,111,165,.10)'; }} onMouseLeave={e=>{ const r=e.currentTarget; r.style.borderColor=isDark?'rgba(74,111,165,.42)':'rgba(74,111,165,.30)'; r.style.boxShadow='none'; }} />
            </div>}
            {/* Ring 3: أخضر */}
            {!isMobile && <div className="deco-wrap deco-wrap-3" style={{ width:isTablet ? 160 : 200, height:isTablet ? 160 : 200, top:'15%', right:isTablet ? '8%' : '15%' }}>
                <div className="deco-ring deco-ring-3" style={{
                    border: `1.5px solid ${isDark?'rgba(74,128,80,.40)':'rgba(74,128,80,.28)'}`,
                }} onMouseEnter={e=>{ const r=e.currentTarget; r.style.borderColor=isDark?'rgba(74,128,80,.72)':'rgba(74,128,80,.68)'; r.style.boxShadow='0 0 10px rgba(74,128,80,.10)'; }} onMouseLeave={e=>{ const r=e.currentTarget; r.style.borderColor=isDark?'rgba(74,128,80,.40)':'rgba(74,128,80,.28)'; r.style.boxShadow='none'; }} />
            </div>}

            <HeroLogo />

            <div className="el-fadeUp-1" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:isMobile ? '6px 14px' : '7px 20px', background: isDark?'rgba(201,168,130,.1)':'rgba(201,168,130,.15)', border:`1px solid ${isDark?'rgba(201,168,130,.2)':'rgba(139,107,74,.25)'}`, borderRadius:30, marginBottom:isMobile ? 16 : 22 }}>
                <div className="el-dotPulse" style={{ width:7, height:7, background:'#8B6B4A', borderRadius:'50%' }} />
                <span style={{ fontSize:isMobile ? 10 : 12, color: isDark?'#C9A882':'#8B6B4A', fontWeight:600, letterSpacing:.5 }}>
                    {ar ? 'منصة امتحانات إلكترونية متكاملة' : 'Complete Online Exam Platform'}
                </span>
            </div>

            <h1 className="el-fadeUp-2" style={{ fontSize:isMobile ? 34 : (isTablet ? 42 : 52), fontWeight:'bold', lineHeight:1.1, marginBottom:isMobile ? 14 : 20, color: isDark?'#E8D5B0':'#4A2E1A' }}>
                {ar ? <>
                    امتحانات{' '}
                    <span style={{ background:'linear-gradient(135deg,#8B6B4A,#C9A882)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>أكثر ذكاءً</span>
                    <br/>و<span style={{ background:'linear-gradient(135deg,#1A4A25,#4A8050)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>أكثر أماناً</span>
                </> : <>
                    Smarter{' '}
                    <span style={{ background:'linear-gradient(135deg,#8B6B4A,#C9A882)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>& Safer</span>
                    <br/><span style={{ background:'linear-gradient(135deg,#1B3A6B,#4A6FA5)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Online Exams</span>
                </>}
            </h1>

            <p className="el-fadeUp-3" style={{ fontSize:isMobile ? 13 : 15, color: isDark?'#6B7FA0':'#8B6B4A', lineHeight:1.9, maxWidth:isMobile ? 340 : 560, margin:`0 auto ${isMobile ? 24 : 36}px` }}>
                {ar ? 'منصة Examor تمكّن المؤسسات التعليمية من إنشاء وإدارة الامتحانات الإلكترونية بسهولة، مع تصحيح تلقائي فوري ونتائج دقيقة في الحال.'
                    : 'Examor empowers educational institutions to create and manage online exams with ease, instant auto-grading and accurate results.'}
            </p>

            <div className="el-fadeUp-4" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                <SplitButton navigate={navigate} size="lg" />
                <div style={{ display:'flex', gap:isMobile ? 10 : 20, justifyContent:'center', flexWrap:'wrap' }}>
                    {(ar ? ['بدون بطاقة ائتمانية','إعداد في دقائق','مجاني 100%'] : ['No credit card','Setup in minutes','100% Free']).map((t,i) => (
                        <span key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:isMobile ? 10 : 12, color: isDark?'#2C3E6B':'#C9A882' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4A8050" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── Stats ────────────────────────────────────────────────────
function Stats() {
    const { isDark } = useTheme();
    const { i18n } = useTranslation();
    const { isTablet, isMobile } = useViewport();
    const ar = i18n.language === 'ar';
    const ref = useRef();
    const [visible, setVisible] = useState(false);
    const [targets, setTargets] = useState([0, 0, 0, 0]);
    const [nums, setNums] = useState([0,0,0,0]);
    const labels  = ar
        ? ['محاولة مكتملة','امتحان منشور','مستخدم مسجل','مؤسسة تعليمية']
        : ['Completed Attempts','Published Exams','Registered Users','Institutions'];

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await API.get('/auth/stats');
                const stats = res.data?.data || {};
                if (!mounted) return;
                setTargets([
                    Number(stats.completed_attempts || 0),
                    Number(stats.published_exams || 0),
                    Number(stats.registered_users || 0),
                    Number(stats.institutions || 0)
                ]);
            } catch (_) {
                if (!mounted) return;
                setTargets([0, 0, 0, 0]);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const animateStats = useCallback(() => {
        setNums([0, 0, 0, 0]);
        targets.forEach((target, i) => {
            const safeTarget = Number(target) || 0;
            if (safeTarget <= 0) {
                setNums(prev => {
                    const next = [...prev];
                    next[i] = 0;
                    return next;
                });
                return;
            }
            setTimeout(() => {
                let n = 0;
                const step = Math.max(1, safeTarget / 60);
                const timer = setInterval(() => {
                    n = Math.min(n + step, safeTarget);
                    setNums(prev => {
                        const next = [...prev];
                        next[i] = Math.floor(n);
                        return next;
                    });
                    if (n >= safeTarget) clearInterval(timer);
                }, 1800 / 60);
            }, i * 100);
        });
    }, [targets]);

    useEffect(() => {
        const observer = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) setVisible(true);
        }, { threshold:0.2 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;
        animateStats();
    }, [animateStats, visible]);

    return (
        <div ref={ref} className="scroll-rv" style={{ background: isDark?'#0a1628':'#F0EBE1', padding:isMobile ? '26px 16px' : (isTablet ? '34px 24px' : '48px 52px'), display:'grid', gridTemplateColumns:isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap:isMobile ? 18 : 12, alignItems:'stretch', borderTop:`1px solid ${isDark?'rgba(255,255,255,.06)':'#E8DDD0'}`, borderBottom:`1px solid ${isDark?'rgba(255,255,255,.06)':'#E8DDD0'}`, transition:'background .3s' }}>
            {nums.map((n,i) => (
                <div key={i} style={{ textAlign:'center', padding:isMobile ? '8px 4px' : '4px 10px', borderLeft:!isMobile && i > 0 ? `1px solid ${isDark?'rgba(255,255,255,.06)':'#E8DDD0'}` : 'none' }}>
                    <div style={{ fontSize:isMobile ? 31 : (isTablet ? 36 : 42), fontWeight:'bold', color: isDark?'#C9A882':'#4A2E1A', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{n}+</div>
                    <div style={{ fontSize:isMobile ? 11 : 12, color: isDark?'#6B7FA0':'#8B6B4A', marginTop:7, lineHeight:1.6 }}>{labels[i]}</div>
                </div>
            ))}
        </div>
    );
}

// ── SectionHeader ────────────────────────────────────────────
function SectionHeader({ tag, tagColor, lineColor, title, sub }) {
    const { isDark } = useTheme();
    const { isTablet, isMobile } = useViewport();
    return (
        <div className="scroll-rv" style={{ marginBottom:isMobile ? 26 : (isTablet ? 34 : 44) }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:isMobile ? '6px 14px' : '6px 18px', background:`${tagColor}18`, border:`1px solid ${tagColor}30`, borderRadius:30, marginBottom:isMobile ? 12 : 14 }}>
                <span style={{ fontSize:11, fontWeight:'bold', color: tagColor }}>{tag}</span>
                <div className="el-lineGrow" style={{ height:2, borderRadius:2, background: lineColor }} />
            </div>
            <div style={{ fontSize:isMobile ? 22 : (isTablet ? 26 : 30), fontWeight:'bold', color: isDark?'#E8D5B0':'#4A2E1A', marginBottom:10, lineHeight:1.25 }}>{title}</div>
            <div style={{ fontSize:isMobile ? 13 : 14, color: isDark?'#6B7FA0':'#8B6B4A', lineHeight:1.8, maxWidth:isMobile ? '100%' : 540 }}>{sub}</div>
        </div>
    );
}

// ── RoleCard ─────────────────────────────────────────────────
function RoleCard({ r, i }) {
    const [hov, setHov] = useState(false);
    const { isDark } = useTheme();
    const { isMobile } = useViewport();
    const bg     = isDark ? (hov ? '#1a2d4e' : '#162238') : r.bg;
    const border = hov ? r.hBorder : (isDark ? 'rgba(255,255,255,.06)' : r.border);
    const shadow = hov ? (isDark ? `0 20px 50px rgba(0,0,0,.4)` : `0 20px 50px ${r.hShadow}`) : 'none';
    return (
        <div className="scroll-rv role-card"
            style={{ background: bg, border:`2px solid ${border}`, borderRadius:18, padding:isMobile ? '24px 18px' : '32px 26px', cursor:'default', position:'relative', overflow:'hidden', boxShadow: shadow, transitionDelay:`${i*.15}s`, transition:'all .35s' }}
            onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        >
            <div className="role-bar" style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background: r.barBg, transform: hov?'scaleX(1)':'scaleX(0)', transition:'transform .4s', transformOrigin:'left' }} />
            <div className="role-icon" style={{ width:isMobile ? 50 : 56, height:isMobile ? 50 : 56, borderRadius:isMobile ? 12 : 14, background: r.iconBg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:isMobile ? 14 : 18, transition:'transform .4s' }}>{r.icon}</div>
            <div style={{ fontSize:isMobile ? 16 : 17, fontWeight:'bold', color: isDark ? r.titleColorDark||'#E8D5B0' : r.titleColor, marginBottom:9 }}>{r.title}</div>
            <div style={{ fontSize:isMobile ? 12 : 13, color: isDark?'#6B7FA0':r.descColor, lineHeight:1.8, marginBottom:14 }}>{r.desc}</div>
            <span style={{ display:'inline-block', fontSize:10, fontWeight:'bold', padding:'5px 14px', borderRadius:14, background: r.tagBg, color: r.tagColor }}>{r.tag}</span>
        </div>
    );
}

// ── Roles ────────────────────────────────────────────────────
function Roles() {
    const { isDark } = useTheme();
    const { i18n } = useTranslation();
    const { isTablet, isMobile } = useViewport();
    const ar = i18n.language === 'ar';
    const roles = [
        { key:'admin',   bg:'#E8EEF8', border:'rgba(27,58,107,.1)',   hBorder:'#1B3A6B', hShadow:'rgba(27,58,107,.1)',  barBg:'#1B3A6B', iconBg:'#1B3A6B', titleColor:'#1B3A6B', titleColorDark:'#90CAF9', descColor:'#4A6FA5', tag: ar?'صلاحيات كاملة':'Full Access', tagBg:'#1B3A6B', tagColor:'#E8EEF8', title: ar?'الأدمن':'Admin', desc: ar?'يدير الجامعات والفروع والأقسام ويشاهد إحصائيات المنصة الكاملة':'Manages universities, branches, departments and full platform statistics', icon:<svg width="26" height="26" viewBox="0 0 52 52" fill="none" stroke="#E8EEF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="22" cy="17" r="8"/><path d="M6 44c0-8.8 7.2-16 16-16s16 7.2 16 16"/><circle cx="41" cy="13" r="6"/><path d="M38.5 13l2 2 3.5-3.5"/></svg> },
        { key:'doctor',  bg:'#F0EBE1', border:'rgba(139,107,74,.15)', hBorder:'#8B6B4A', hShadow:'rgba(139,107,74,.1)', barBg:'#8B6B4A', iconBg:'#4A2E1A', titleColor:'#4A2E1A', titleColorDark:'#C9A882', descColor:'#8B6B4A', tag: ar?'إدارة الامتحانات':'Exam Management', tagBg:'#8B6B4A', tagColor:'#FAF8F4', title: ar?'الدكتور':'Teacher', desc: ar?'يُنشئ الامتحانات ويشارك الأكواد ويتابع نتائج طلابه بتفصيل كامل':'Creates exams, shares codes and tracks student results in detail', icon:<svg width="26" height="26" viewBox="0 0 52 52" fill="none" stroke="#F0EBE1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="10" y="5" width="26" height="35" rx="3"/><line x1="16" y1="15" x2="30" y2="15"/><line x1="16" y1="21" x2="30" y2="21"/><circle cx="38" cy="38" r="8"/><path d="M34.5 38l2.5 2.5 4.5-4.5"/></svg> },
        { key:'student', bg:'#E8F2E8', border:'rgba(26,74,37,.1)',    hBorder:'#1A4A25', hShadow:'rgba(26,74,37,.08)',  barBg:'#1A4A25', iconBg:'#1A4A25', titleColor:'#1A4A25', titleColorDark:'#6BCF7F', descColor:'#4A8050', tag: ar?'لوحة شخصية':'Personal Dashboard', tagBg:'#1A4A25', tagColor:'#E8F2E8', title: ar?'الطالب':'Student', desc: ar?'يدخل بكود الامتحان ويحصل على نتيجته فوراً مع النسبة الكاملة':'Enters exam code and gets instant results with full percentage', icon:<svg width="26" height="26" viewBox="0 0 52 52" fill="none" stroke="#E8F2E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M26 5L48 17 26 29 4 17z"/><path d="M10 21v14c0 4 7 8 16 8s16-4 16-8V21"/><line x1="48" y1="17" x2="48" y2="31"/><circle cx="48" cy="34" r="2.5"/></svg> },
    ];
    return (
        <section style={{ background: isDark?'#0F1D35':'#FAF8F4', padding:isMobile ? '56px 16px' : (isTablet ? '68px 24px' : '80px 52px'), transition:'background .3s' }}>
            <SectionHeader tag={ar?'الأدوار':'Roles'} tagColor="#1B3A6B" lineColor="#1B3A6B" title={ar?'مصمم لكل دور في المنظومة':'Designed for every role'} sub={ar?'كل مستخدم يحصل على لوحة تحكم مخصصة لاحتياجاته بالكامل':'Every user gets a fully customized dashboard'} />
            <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : (isTablet ? 'repeat(2, minmax(0,1fr))' : 'repeat(3,1fr)'), gap:isMobile ? 16 : 24 }}>
                {roles.map((r,i) => <RoleCard key={r.key} r={r} i={i} />)}
            </div>
        </section>
    );
}

// ── Features ─────────────────────────────────────────────────
function Features() {
    const { isDark } = useTheme();
    const { i18n } = useTranslation();
    const { isTablet, isMobile } = useViewport();
    const ar = i18n.language === 'ar';
    const feats = [
        { stroke:'#8B6B4A', title: ar?'إنشاء امتحانات في دقائق':'Create exams in minutes', desc: ar?'أنشئ امتحاناتك مع دعم MCQ وصح/غلط والمقالي بكود فريد':'Create with MCQ, True/False and essay with unique codes', icon:<svg width="44" height="44" viewBox="0 0 56 56" fill="none" stroke="#8B6B4A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="10" y="6" width="28" height="38" rx="3"/><line x1="16" y1="17" x2="32" y2="17"/><line x1="16" y1="23" x2="32" y2="23"/><line x1="16" y1="29" x2="24" y2="29"/><circle cx="40" cy="40" r="9"/><line x1="37" y1="40" x2="43" y2="40"/><line x1="40" y1="37" x2="40" y2="43"/></svg> },
        { stroke:'#4A8050', title: ar?'تصحيح تلقائي فوري':'Instant auto-grading',     desc: ar?'النتائج والنسب المئوية فور التسليم بدون أي تدخل':'Results and percentages instantly upon submission', icon:<svg width="44" height="44" viewBox="0 0 56 56" fill="none" stroke="#4A8050" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="28" cy="28" r="19"/><path d="M19 28l7 7 11-11"/><path d="M28 9v4M28 43v4M9 28h4M43 28h4"/></svg> },
        { stroke:'#1B3A6B', title: ar?'توقيت دقيق':'Precise timing',               desc: ar?'مؤقت تنازلي مع تسليم تلقائي عند انتهاء الوقت':'Countdown timer with automatic submission', icon:<svg width="44" height="44" viewBox="0 0 56 56" fill="none" stroke="#1B3A6B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="28" cy="32" r="17"/><path d="M22 8h12M28 8v7"/><path d="M28 22v11l7 4"/><path d="M42 18l3-3"/></svg> },
        { stroke:'#8B6B4A', title: ar?'تقارير وإحصائيات':'Reports & analytics',     desc: ar?'إحصائيات تفصيلية لكل امتحان ومادة وطالب':'Detailed statistics per exam, course and student', icon:<svg width="44" height="44" viewBox="0 0 56 56" fill="none" stroke="#8B6B4A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="38" width="9" height="10" rx="1.5"/><rect x="23" y="28" width="9" height="20" rx="1.5"/><rect x="39" y="18" width="9" height="30" rx="1.5"/><path d="M8 36l16-12 16-9"/><circle cx="24" cy="24" r="2.5" fill="#8B6B4A"/><circle cx="40" cy="15" r="2.5" fill="#8B6B4A"/></svg> },
        { stroke:'#4A6FA5', title: ar?'عربي وإنجليزي':'Arabic & English',           desc: ar?'دعم كامل للغتين مع تبديل RTL/LTR تلقائي':'Full support for both languages with automatic RTL/LTR', icon:<svg width="44" height="44" viewBox="0 0 56 56" fill="none" stroke="#4A6FA5" strokeWidth="1.7" strokeLinecap="round"><circle cx="28" cy="28" r="19"/><path d="M28 9c-5 5-8 11-8 19s3 14 8 19"/><path d="M28 9c5 5 8 11 8 19s-3 14-8 19"/><line x1="9" y1="28" x2="47" y2="28"/><line x1="10" y1="20" x2="46" y2="20"/><line x1="10" y1="36" x2="46" y2="36"/></svg> },
        { stroke:'#4A8050', title: ar?'أمان وحماية كاملة':'Full security',           desc: ar?'JWT وتشفير bcrypt وصلاحيات محددة لكل دور':'JWT, bcrypt encryption and role-based permissions', icon:<svg width="44" height="44" viewBox="0 0 56 56" fill="none" stroke="#4A8050" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M28 6l19 7v14c0 11-8 20-19 23C9 47 9 38 9 27V13l19-7z"/><path d="M20 28l6 6 11-11"/></svg> },
    ];
    const cellBg    = isDark ? '#0F1D35' : '#FAF8F4';
    const cellHover = isDark ? '#162238' : '#F0EBE1';
    const gridBg    = isDark ? 'rgba(255,255,255,.04)' : '#E8DDD0';
    const gridBorder= isDark ? 'rgba(255,255,255,.04)' : '#E8DDD0';
    return (
        <section id="features" style={{ background: isDark?'#0a1628':'#F0EBE1', padding:isMobile ? '56px 16px' : (isTablet ? '68px 24px' : '80px 52px'), borderTop:`1px solid ${isDark?'rgba(255,255,255,.06)':'#E8DDD0'}`, transition:'background .3s' }}>
            <SectionHeader tag={ar?'المميزات':'Features'} tagColor="#8B6B4A" lineColor="#8B6B4A" title={ar?'كل ما تحتاجه في مكان واحد':'Everything you need in one place'} sub={ar?'نوفر الأدوات اللازمة لإدارة الامتحانات بكفاءة واحترافية تامة':'We provide the tools needed to manage exams efficiently'} />
            <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : (isTablet ? 'repeat(2, minmax(0,1fr))' : 'repeat(3,1fr)'), gap:'1px', background: gridBg, borderRadius:18, overflow:'hidden', border:`1px solid ${gridBorder}` }}>
                {feats.map((f,i) => (
                    <div key={i} className="scroll-rv feat-cell"
                        style={{ background: cellBg, padding:isMobile ? '24px 18px' : (isTablet ? '28px 22px' : '34px 28px'), cursor:'default', position:'relative', transitionDelay:`${(i%3)*.1}s` }}
                        onMouseEnter={e => e.currentTarget.style.background = cellHover}
                        onMouseLeave={e => e.currentTarget.style.background = cellBg}
                    >
                        <div style={{ position:'absolute', top:0, right:0, left:0, height:2, background:`linear-gradient(90deg,${f.stroke},transparent)`, transform:'scaleX(0)', transformOrigin:'right', transition:'transform .35s' }} />
                        <div className="feat-icon" style={{ marginBottom:isMobile ? 12 : 16, transform:isMobile ? 'scale(.88)' : 'none', transformOrigin:'top center' }}>{f.icon}</div>
                        <div style={{ fontSize:isMobile ? 13 : 14, fontWeight:'bold', color: isDark?'#E8D5B0':'#4A2E1A', marginBottom:8 }}>{f.title}</div>
                        <div style={{ fontSize:isMobile ? 11 : 12, color: isDark?'#6B7FA0':'#8B6B4A', lineHeight:1.8 }}>{f.desc}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ── HowItWorks ───────────────────────────────────────────────
function HowItWorks() {
    const { isDark } = useTheme();
    const { i18n } = useTranslation();
    const { isTablet, isMobile } = useViewport();
    const ar = i18n.language === 'ar';
    const steps = ar
        ? [{n:'1',bg:'#E8EEF8',color:'#1B3A6B',t:'سجّل مؤسستك',   d:'أنشئ حسابك وأضف جامعتك وفروعها وأقسامها في دقائق'},
           {n:'2',bg:'#F0EBE1',color:'#4A2E1A',t:'أضف المدرسين',  d:'سجّل أعضاء هيئة التدريس وامنحهم الصلاحيات'},
           {n:'3',bg:'#E8EEF8',color:'#1B3A6B',t:'أنشئ الامتحان',  d:'أضف الأسئلة وحدد الوقت وشارك الكود الفريد'},
           {n:'4',bg:'#E8F2E8',color:'#1A4A25',t:'شاهد النتائج فوراً',d:'التصحيح تلقائي والنتائج تظهر فور الانتهاء'}]
        : [{n:'1',bg:'#E8EEF8',color:'#1B3A6B',t:'Register Institution',d:'Create your account and add your university and departments'},
           {n:'2',bg:'#F0EBE1',color:'#4A2E1A',t:'Add Teachers',         d:'Register faculty and grant them exam creation permissions'},
           {n:'3',bg:'#E8EEF8',color:'#1B3A6B',t:'Create Exam',           d:'Add questions, set timing and share the unique code'},
           {n:'4',bg:'#E8F2E8',color:'#1A4A25',t:'See Results Instantly', d:'Auto-grading happens immediately after each exam'}];

    const numBgDark = { '#E8EEF8':'rgba(27,58,107,.25)', '#F0EBE1':'rgba(74,46,26,.25)', '#E8F2E8':'rgba(26,74,37,.25)' };
    const numColorDark = { '#1B3A6B':'#90CAF9', '#4A2E1A':'#C9A882', '#1A4A25':'#6BCF7F' };

    return (
        <section id="how-it-works" style={{ background: isDark?'#0F1D35':'#FAF8F4', padding:isMobile ? '56px 16px' : (isTablet ? '68px 24px' : '80px 52px'), transition:'background .3s' }}>
            <SectionHeader tag={ar?'كيف يعمل':'How it works'} tagColor="#1A4A25" lineColor="#1A4A25" title={ar?'ابدأ في 4 خطوات بسيطة':'Get started in 4 simple steps'} sub={ar?'لا تعقيد ولا وقت ضائع — كل شيء واضح ومنظم':'No complexity — everything is clear and organized'} />
            <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : 'repeat(2, minmax(0,1fr))', gap:isMobile ? 14 : 20 }}>
                {steps.map((s,i) => (
                    <div key={i} className="scroll-rv how-card"
                        style={{ background: isDark?'#162238':'#fff', borderRadius:16, padding:isMobile ? 20 : 28, border:`2px solid ${isDark?'rgba(255,255,255,.06)':'#E8DDD0'}`, display:'flex', flexDirection:isMobile ? 'column' : 'row', gap:isMobile ? 14 : 20, alignItems:isMobile ? 'stretch' : 'flex-start', cursor:'default', position:'relative', overflow:'hidden', transitionDelay:`${(i%2)*.1}s` }}
                    >
                        <div style={{ position:'absolute', top:0, right:0, width:4, height:'100%', background:'linear-gradient(180deg,#8B6B4A,#C9A882)', transform:'scaleY(0)', transition:'transform .35s', transformOrigin:'bottom' }} />
                        <div className="how-num"
                            style={{ width:isMobile ? 44 : 48, height:isMobile ? 44 : 48, borderRadius:isMobile ? 12 : 14, background: isDark?(numBgDark[s.bg]||'rgba(255,255,255,.1)'):s.bg, color: isDark?(numColorDark[s.color]||'#E8D5B0'):s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:isMobile ? 18 : 20, fontWeight:'bold', flexShrink:0 }}
                        >{s.n}</div>
                        <div>
                            <div style={{ fontSize:isMobile ? 14 : 15, fontWeight:'bold', color: isDark?'#E8D5B0':'#4A2E1A', marginBottom:8 }}>{s.t}</div>
                            <div style={{ fontSize:isMobile ? 12 : 13, color: isDark?'#6B7FA0':'#8B6B4A', lineHeight:1.8 }}>{s.d}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ── FAQ ──────────────────────────────────────────────────────
function FAQ() {
    const [open, setOpen] = useState(null);
    const { isDark } = useTheme();
    const { i18n } = useTranslation();
    const { isTablet, isMobile } = useViewport();
    const ar = i18n.language === 'ar';
    const faqs = ar
        ? [['هل المنصة مجانية؟','نعم، يمكنك البدء مجاناً والوصول لجميع المميزات الأساسية بدون أي رسوم.'],
           ['هل يدعم النظام اللغة العربية؟','بالتأكيد! المنصة تدعم العربية والإنجليزية مع تبديل RTL/LTR تلقائياً.'],
           ['كيف يتم التصحيح التلقائي؟','MCQ وصح/غلط تتصحح تلقائياً فور التسليم. المقال يحتاج مراجعة يدوية.'],
           ['هل البيانات آمنة؟','نعم، JWT وتشفير bcrypt وParameterized Queries لمنع SQL Injection.'],
           ['كم عدد الطلاب الممكن إضافتهم؟','لا يوجد حد أقصى — مصمم لخدمة أعداد كبيرة عبر مؤسسات متعددة.']]
        : [['Is the platform free?','Yes, you can start for free and access all basic features without any charges.'],
           ['Does it support Arabic?','Yes! Full support for Arabic and English with automatic RTL/LTR switching.'],
           ['How does auto-grading work?','MCQ and True/False are graded instantly. Essays require manual teacher review.'],
           ['Is the data secure?','Yes, JWT authentication, bcrypt encryption and Parameterized Queries.'],
           ['How many students?','No limit — designed to serve large numbers across multiple institutions.']];

    return (
        <section style={{ background: isDark?'#0a1628':'#F0EBE1', padding:isMobile ? '56px 16px' : (isTablet ? '68px 24px' : '80px 52px'), borderTop:`1px solid ${isDark?'rgba(255,255,255,.06)':'#E8DDD0'}`, transition:'background .3s' }}>
            <SectionHeader tag={ar?'الأسئلة الشائعة':'FAQ'} tagColor="#1B3A6B" lineColor="#1B3A6B" title={ar?'عندك سؤال؟':'Have a question?'} sub={ar?'إجابات على أكثر الأسئلة شيوعاً':'Answers to the most common questions'} />
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {faqs.map(([q,a],i) => (
                    <div key={i} className="scroll-rv faq-item"
                        style={{ background: isDark?'#162238':'#FAF8F4', borderRadius:14, border:`1.5px solid ${open===i?'#8B6B4A':(isDark?'rgba(255,255,255,.08)':'#E8DDD0')}`, overflow:'hidden', transitionDelay:`${i*.08}s` }}
                    >
                        <div className="faq-q"
                            style={{ padding:isMobile ? '16px 16px' : '18px 24px', fontSize:isMobile ? 12 : 13, fontWeight:'bold', color: isDark?'#E8D5B0':'#4A2E1A', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}
                            onClick={() => setOpen(open===i?null:i)}
                        >
                            <span>{q}</span>
                            <span className="faq-plus" style={{ color:'#8B6B4A', fontSize:isMobile ? 18 : 20, marginRight:isMobile ? 0 : 10, transform: open===i?'rotate(45deg)':'none', lineHeight:1 }}>＋</span>
                        </div>
                        {open===i && (
                            <div style={{ padding:isMobile ? '0 16px 16px' : '0 24px 18px', fontSize:isMobile ? 12 : 13, color: isDark?'#6B7FA0':'#8B6B4A', lineHeight:1.8, borderTop:`1px solid ${isDark?'rgba(255,255,255,.06)':'#F0EBE1'}` }}>
                                {a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

// ── CTA ──────────────────────────────────────────────────────
function CTA({ openContact, navigate }) {
    const { isDark } = useTheme();
    const { i18n } = useTranslation();
    const { isTablet, isMobile } = useViewport();
    const ar = i18n.language === 'ar';
    return (
        <section className="scroll-rv" style={{ padding:isMobile ? '60px 16px' : (isTablet ? '76px 24px' : '90px 52px'), textAlign:'center', background: isDark?'linear-gradient(160deg,#0a1628 0%,#0F1D35 50%,#0a1628 100%)':'#FAF8F4', position:'relative', overflow:'hidden', borderTop:`1px solid ${isDark?'rgba(255,255,255,.06)':'#E8DDD0'}`, transition:'background .3s' }}>
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:isMobile ? 320 : (isTablet ? 480 : 700), height:isMobile ? 320 : (isTablet ? 480 : 700), borderRadius:'50%', background:`radial-gradient(circle,${isDark?'rgba(201,168,130,.06)':'rgba(201,168,130,.1)'} 0%,transparent 65%)`, pointerEvents:'none' }} />
            <div style={{ fontSize:isMobile ? 28 : (isTablet ? 31 : 34), fontWeight:'bold', color: isDark?'#E8D5B0':'#4A2E1A', marginBottom:12, position:'relative', lineHeight:1.25 }}>{ar?'جاهز تبدأ مع Examor؟':'Ready to start with Examor?'}</div>
            <div style={{ fontSize:isMobile ? 13 : 14, color: isDark?'#6B7FA0':'#8B6B4A', marginBottom:isMobile ? 26 : 36, maxWidth:isMobile ? 320 : 500, margin:`0 auto ${isMobile ? 26 : 36}px`, lineHeight:1.8, position:'relative' }}>{ar?'انضم لمئات الطلاب والمدرسين اللي بيستخدموا المنصة دلوقتي':'Join hundreds of students and teachers already using the platform'}</div>
            <div style={{ display:'flex', justifyContent:'center' }}>
                <SplitButton navigate={navigate} size="lg" />
            </div>
        </section>
    );
}

// ── Footer ───────────────────────────────────────────────────
function Footer({ openContact, navigate }) {
    const { isDark } = useTheme();
    const { i18n } = useTranslation();
    const { isTablet, isMobile, isNarrowMobile } = useViewport();
    const ar = i18n.language === 'ar';
    const footerBg  = isDark ? '#080F1E' : '#4A2E1A';
    const textCol   = isDark ? '#B7C6E4' : '#8B6B4A';
    const textHover = isDark ? '#F4E6C5' : '#FAF8F4';
    const accentCol = isDark ? '#C9A882' : '#C9A882';
    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const cols = ar
        ? [
            { t:'روابط', l:[
                { label:'تسجيل الدخول', action: () => navigate('/login') },
                { label:'إنشاء حساب', action: () => navigate('/register') },
                { label:'المميزات', action: () => scrollToSection('features') },
                { label:'كيف يعمل', action: () => scrollToSection('how-it-works') }
            ]},
            { t:'للمؤسسات', l:[
                { label:'للجامعات', action: openContact },
                { label:'للمدارس', action: openContact },
                { label:'للمراكز', action: openContact }
            ]}
        ]
        : [
            { t:'Links', l:[
                { label:'Login', action: () => navigate('/login') },
                { label:'Register', action: () => navigate('/register') },
                { label:'Features', action: () => scrollToSection('features') },
                { label:'How it works', action: () => scrollToSection('how-it-works') }
            ]},
            { t:'For Institutions', l:[
                { label:'Universities', action: openContact },
                { label:'Schools', action: openContact },
                { label:'Training Centers', action: openContact }
            ]}
        ];
    return (
        <footer style={{ background: footerBg, padding:isMobile ? (isNarrowMobile ? '24px 12px calc(18px + env(safe-area-inset-bottom))' : '34px 16px calc(22px + env(safe-area-inset-bottom))') : (isTablet ? '42px 24px 28px' : '52px 52px 22px'), transition:'background .3s' }}>
            <div style={{ display:'flex', flexDirection:isMobile ? 'column' : 'row', gap:isMobile ? (isNarrowMobile ? 12 : 14) : 20, marginBottom:isMobile ? (isNarrowMobile ? 18 : 24) : 32, flexWrap:'wrap' }}>
                <div style={{ flex:'1 1 280px', background:isDark?'rgba(255,255,255,.03)':'rgba(255,255,255,.05)', border:`1px solid ${isDark?'rgba(255,255,255,.06)':'rgba(255,255,255,.08)'}`, borderRadius:18, padding:isMobile ? '16px 16px' : '18px 20px', transition:'transform .25s, border-color .25s, box-shadow .25s' }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='rgba(201,168,130,.35)';e.currentTarget.style.boxShadow=isDark?'0 18px 34px rgba(0,0,0,.22)':'0 18px 34px rgba(74,46,26,.12)'}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,.06)':'rgba(255,255,255,.08)';e.currentTarget.style.boxShadow='none'}}>
                    <div style={{ display:'flex', alignItems:'center', gap:9, direction:'ltr', marginBottom:14 }}>
                        <div style={{ width:30, height:30, border:'1.5px solid #C9A882', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A882" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>
                        </div>
                        <span style={{ color:'#FAF8F4', fontSize:isMobile ? 16 : 18, fontWeight:'bold', letterSpacing:isMobile ? 2 : 2.5 }}>EXAMOR</span>
                    </div>
                    <p style={{ fontSize:isMobile ? 11 : 12, color: accentCol, lineHeight:1.85, maxWidth:isMobile ? '100%' : 220 }}>{ar?'منصة امتحانات إلكترونية متكاملة تخدم المؤسسات التعليمية بكفاءة واحترافية.':'A complete online exam platform serving educational institutions efficiently.'}</p>
                </div>
                {cols.map(col => (
                    <div key={col.t} style={{ flex:'1 1 180px', display:'flex', flexDirection:'column', background:isDark?'rgba(255,255,255,.03)':'rgba(255,255,255,.05)', border:`1px solid ${isDark?'rgba(255,255,255,.06)':'rgba(255,255,255,.08)'}`, borderRadius:18, padding:isMobile ? '16px 16px' : '18px 20px', transition:'transform .25s, border-color .25s, box-shadow .25s' }}
                        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='rgba(201,168,130,.35)';e.currentTarget.style.boxShadow=isDark?'0 18px 34px rgba(0,0,0,.22)':'0 18px 34px rgba(74,46,26,.12)'}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,.06)':'rgba(255,255,255,.08)';e.currentTarget.style.boxShadow='none'}}>
                        <div style={{ color: accentCol, fontSize:11, fontWeight:'bold', marginBottom:14, letterSpacing:1, textTransform:'uppercase' }}>{col.t}</div>
                        {col.l.map((item) => <button key={item.label} type="button" onClick={item.action} style={{ color: textCol, fontSize:isMobile ? 11 : 12, fontWeight:500, marginBottom:9, cursor:'pointer', transition:'color .25s, transform .25s', textDecoration:'none', display:'block', background:'transparent', border:'none', padding:0, textAlign:'inherit' }} onMouseEnter={e=>{e.currentTarget.style.color=textHover;e.currentTarget.style.transform='translateX(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.color=textCol;e.currentTarget.style.transform='none'}}>{item.label}</button>)}
                    </div>
                ))}
                <div style={{ flex:'1 1 220px', display:'flex', flexDirection:'column', background:isDark?'rgba(255,255,255,.03)':'rgba(255,255,255,.05)', border:`1px solid ${isDark?'rgba(255,255,255,.06)':'rgba(255,255,255,.08)'}`, borderRadius:18, padding:isMobile ? '16px 16px' : '18px 20px', transition:'transform .25s, border-color .25s, box-shadow .25s' }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='rgba(201,168,130,.35)';e.currentTarget.style.boxShadow=isDark?'0 18px 34px rgba(0,0,0,.22)':'0 18px 34px rgba(74,46,26,.12)'}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,.06)':'rgba(255,255,255,.08)';e.currentTarget.style.boxShadow='none'}}>
                    <div style={{ color: accentCol, fontSize:11, fontWeight:'bold', marginBottom:14, letterSpacing:1, textTransform:'uppercase' }}>{ar?'تواصل':'Contact'}</div>
                    {[
                        {
                            icon: (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <path d="M3 7l9 6 9-6" />
                                </svg>
                            ),
                            text: 'karemalwy1@gmail.com',
                            href: 'mailto:karemalwy1@gmail.com'
                        },
                        {
                            icon: (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 18l6-6-6-6" />
                                    <path d="M8 6l-6 6 6 6" />
                                </svg>
                            ),
                            text: 'Kareem Basem Fathi',
                            href: 'https://kareem-basem.vercel.app/'
                        }
                    ].map((item,i) => (
                        item.href
                            ? <a key={i} href={item.href} target="_blank" rel="noreferrer" style={{ color: textCol, fontSize:isMobile ? 11 : 12, fontWeight:500, marginBottom:9, cursor:'pointer', transition:'color .25s, transform .25s', textDecoration:'none', display:'flex', alignItems:'center', gap:6 }} onMouseEnter={e=>{e.currentTarget.style.color=textHover;e.currentTarget.style.transform='translateX(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.color=textCol;e.currentTarget.style.transform='none'}}>
                                <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', color:textCol }}>{item.icon}</span>
                                {item.text}
                            </a>
                            : <div key={i} style={{ color: textCol, fontSize:isMobile ? 11 : 12, fontWeight:500, marginBottom:9, display:'flex', alignItems:'center', gap:6 }}>
                                <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', color:textCol }}>{item.icon}</span>
                                {item.text}
                            </div>
                    ))}
                    <button onClick={openContact} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:14, padding:isMobile ? '10px 16px' : '10px 20px', background:'#C9A882', color:'#4A2E1A', border:'none', borderRadius:10, fontSize:isMobile ? 11 : 12, fontWeight:'bold', cursor:'pointer', transition:'all .25s', width:isMobile ? '100%' : 'auto' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='#E8DDD0';e.currentTarget.style.transform='translateY(-2px)'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='#C9A882';e.currentTarget.style.transform='none'}}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        {ar?'ارسل رسالة':'Send Message'}
                    </button>
                </div>
            </div>
            <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:18, display:'flex', flexDirection:isMobile ? 'column-reverse' : 'row', justifyContent:'space-between', alignItems:isMobile ? 'flex-start' : 'center', gap:isMobile ? 10 : 16 }}>
                <span style={{ color: isDark ? '#E8D5B0' : '#D4A56A', fontSize:isMobile ? 11 : 13, fontWeight:'bold', fontFamily:'"Segoe Script","Lucida Handwriting","Brush Script MT",cursive', letterSpacing:.2, textShadow: isDark ? '0 1px 8px rgba(201,168,130,.14)' : '0 1px 8px rgba(74,46,26,.06)' }}>Designed by KeMoO</span>
                <span style={{ fontSize:isMobile ? 10 : 11, color: textCol }}>© 2026 Examor - Kareem Basem Fathi</span>
            </div>
        </footer>
    );
}

// ── ContactModal ─────────────────────────────────────────────
function ContactModal({ open, onClose }) {
    const { isDark } = useTheme();
    const { isMobile, isNarrowMobile } = useViewport();
    const [form, setForm] = useState({ name:'', email:'', subject:'', msg:'' });
    const [success, setSuccess] = useState(false);
    const { i18n } = useTranslation();
    const ar = i18n.language === 'ar';

    const send = () => {
        if (!form.name||!form.email||!form.msg) { alert(ar?'من فضلك اكمل جميع الحقول':'Please fill all required fields'); return; }
        setSuccess(true);
    };
    const close = () => { onClose(); setTimeout(()=>setSuccess(false), 300); };
    if (!open) return null;

    const modalBg   = isDark ? '#162238' : '#FAF8F4';
    const modalBdr  = isDark ? 'rgba(255,255,255,.08)' : '#E8DDD0';
    const titleCol  = isDark ? '#E8D5B0' : '#4A2E1A';
    const subCol    = isDark ? '#6B7FA0' : '#8B6B4A';
    const cardBg    = isDark ? '#1a2d4e' : '#F0EBE1';
    const inputBg   = isDark ? 'rgba(255,255,255,.05)' : '#fff';
    const inputBdr  = isDark ? 'rgba(255,255,255,.08)' : '#E8DDD0';
    const inputCol  = isDark ? '#E8D5B0' : '#4A2E1A';
    const btnBg     = isDark ? '#C9A882' : '#4A2E1A';
    const btnCol    = isDark ? '#0F1D35' : '#FAF8F4';

    return (
        <div className="contact-overlay open" style={{ background: isDark?'rgba(8,14,28,.88)':'rgba(74,46,26,.7)', backdropFilter:'blur(10px)', alignItems:isMobile ? 'flex-start' : 'center', overflowY:'auto', padding:isMobile ? '12px' : undefined }} onClick={e=>e.target===e.currentTarget&&close()}>
            <div className="contact-modal" style={{ background: modalBg, borderRadius:isMobile ? 18 : 22, border:`1px solid ${modalBdr}`, width:'100%', maxWidth:500, overflow:isMobile ? 'auto' : 'hidden', maxHeight:isMobile ? 'calc(100dvh - 24px)' : 'none', boxShadow:`0 40px 100px ${isDark?'rgba(0,0,0,.6)':'rgba(74,46,26,.2)'}`, margin:isMobile ? '0 auto' : 16 }}>
                <div style={{ padding:isMobile ? '20px 18px 0' : '28px 30px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                    <div>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(139,107,74,.1)', color:'#8B6B4A', fontSize:isMobile ? 10 : 11, fontWeight:'bold', padding:isMobile ? '5px 12px' : '5px 14px', borderRadius:20, border:'1px solid rgba(139,107,74,.2)', marginBottom:12 }}>
                            <div className="el-dotPulse" style={{ width:6, height:6, background:'#8B6B4A', borderRadius:'50%' }} />
                            Contact Us
                        </div>
                        <div style={{ fontSize:22, fontWeight:'bold', color: titleCol, marginBottom:4 }}>{ar?'تواصل معنا':'Contact Us'}</div>
                        <div style={{ fontSize:12, color: subCol }}>{ar?'سنرد عليك في أقرب وقت ممكن':'We will reply as soon as possible'}</div>
                    </div>
                    <button onClick={close} style={{ width:34, height:34, borderRadius:'50%', background: isDark?'rgba(255,255,255,.06)':'#F0EBE1', border:'none', color: subCol, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, transition:'all .25s', flexShrink:0 }}
                        onMouseEnter={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,.12)':'#E8DDD0';e.currentTarget.style.color=titleCol}}
                        onMouseLeave={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,.06)':'#F0EBE1';e.currentTarget.style.color=subCol}}
                    >✕</button>
                </div>

                {!success ? (
                    <>
                        <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1fr 1fr', gap:10, padding:isMobile ? '16px 18px 0' : '16px 30px 0' }}>
                            {[{icon:'✉',label:ar?'البريد':'Email',val:'karemalwy1@gmail.com',bg:'rgba(139,107,74,.1)',c:'#8B6B4A'},{icon:(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 18l6-6-6-6" /><path d="M8 6l-6 6 6 6" /></svg>),label:ar?'المطوّر':'Developer',val:'Kareem Basem Fathi',bg:'rgba(74,128,80,.1)',c:'#4A8050'}].map((c,i) => (
                                  <div key={i} style={{ background: cardBg, border:`1px solid ${modalBdr}`, borderRadius:12, padding:isMobile ? '11px 12px' : '12px 14px', display:'flex', alignItems:'center', gap:10 }}>
                                      <div style={{ width:34, height:34, borderRadius:9, background: c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, color: c.c }}>{c.icon}</div>
                                      <div><div style={{ fontSize:10, color: subCol, marginBottom:3 }}>{c.label}</div><div style={{ fontSize:isNarrowMobile ? 10 : 11, color: c.c, fontWeight:500, wordBreak:'break-word' }}>{c.val}</div></div>
                                  </div>
                              ))}
                        </div>
                        <div style={{ padding:isMobile ? '18px 18px 20px' : '18px 30px 30px', display:'flex', flexDirection:'column', gap:13 }}>
                            <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1fr 1fr', gap:10 }}>
                                {[['name',ar?'الاسم':'Name',ar?'اسمك الكامل':'Full name'],['email',ar?'البريد':'Email','example@email.com']].map(([k,l,p])=>(
                                    <div key={k}>
                                        <label style={{ fontSize:11, fontWeight:'bold', color: subCol, display:'block', marginBottom:5 }}>{l}</label>
                                        <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={p} type={k==='email'?'email':'text'}
                                            style={{ width:'100%', padding:'11px 14px', background: inputBg, border:`1.5px solid ${inputBdr}`, borderRadius:10, color: inputCol, fontSize:13, outline:'none', direction:'rtl', boxSizing:'border-box', transition:'border-color .25s' }}
                                            onFocus={e=>e.target.style.borderColor='#8B6B4A'} onBlur={e=>e.target.style.borderColor=inputBdr}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label style={{ fontSize:11, fontWeight:'bold', color: subCol, display:'block', marginBottom:5 }}>{ar?'الموضوع':'Subject'}</label>
                                <input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder={ar?'موضوع رسالتك':'Message subject'}
                                    style={{ width:'100%', padding:'11px 14px', background: inputBg, border:`1.5px solid ${inputBdr}`, borderRadius:10, color: inputCol, fontSize:13, outline:'none', direction:'rtl', boxSizing:'border-box', transition:'border-color .25s' }}
                                    onFocus={e=>e.target.style.borderColor='#8B6B4A'} onBlur={e=>e.target.style.borderColor=inputBdr}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize:11, fontWeight:'bold', color: subCol, display:'block', marginBottom:5 }}>{ar?'الرسالة':'Message'}</label>
                                <textarea value={form.msg} onChange={e=>setForm(f=>({...f,msg:e.target.value}))} placeholder={ar?'اكتب رسالتك هنا...':'Write your message here...'} rows={4}
                                    style={{ width:'100%', padding:'11px 14px', background: inputBg, border:`1.5px solid ${inputBdr}`, borderRadius:10, color: inputCol, fontSize:13, outline:'none', direction:'rtl', boxSizing:'border-box', resize:'none', transition:'border-color .25s' }}
                                    onFocus={e=>e.target.style.borderColor='#8B6B4A'} onBlur={e=>e.target.style.borderColor=inputBdr}
                                />
                            </div>
                            <button onClick={send} style={{ padding:12, background: btnBg, color: btnCol, border:'none', borderRadius:10, fontSize:13, fontWeight:'bold', cursor:'pointer', transition:'all .25s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4 }}
                                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(74,46,26,.25)'}}
                                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                {ar?'إرسال الرسالة':'Send Message'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'48px 30px', textAlign:'center' }}>
                        <div style={{ width:76, height:76, borderRadius:'50%', background:'rgba(74,128,80,.15)', border:'2px solid #4A8050', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4A8050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div style={{ fontSize:20, fontWeight:'bold', color: titleCol, marginBottom:8 }}>{ar?'تم الإرسال بنجاح ✓':'Sent Successfully ✓'}</div>
                        <div style={{ fontSize:13, color: subCol, lineHeight:1.75, marginBottom:24 }}>{ar?'شكراً على تواصلك\nسيرد عليك Kareem Basem Fathi قريباً':'Thank you for reaching out\nKareem Basem Fathi will reply soon'}</div>
                        <button onClick={close} style={{ padding:'10px 24px', background: isDark?'rgba(255,255,255,.06)':'#F0EBE1', color: subCol, border:`1px solid ${modalBdr}`, borderRadius:10, fontSize:12, cursor:'pointer', transition:'all .25s' }}
                            onMouseEnter={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,.1)':'#E8DDD0';e.currentTarget.style.color=titleCol}}
                            onMouseLeave={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,.06)':'#F0EBE1';e.currentTarget.style.color=subCol}}
                        >{ar?'إغلاق':'Close'}</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main LandingPage ─────────────────────────────────────────
function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { i18n } = useTranslation();
    const { isDark } = useTheme();
    const [contactOpen, setContactOpen] = useState(false);

    useEffect(() => {
        injectStyles();
        document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role  = localStorage.getItem('role');
        const params = new URLSearchParams(location.search);
        const allowLanding = params.get('landing') === '1';
        if (token && role && !allowLanding) {
            if (role === 'admin')   navigate('/admin');
            if (role === 'teacher') navigate('/doctor');
            if (role === 'student') navigate('/student');
        }
    }, [location.search, navigate]);

    useScrollReveal();

    return (
        <div style={{ fontFamily:'Arial, sans-serif', direction: i18n.language==='ar'?'rtl':'ltr', background: isDark?'#0F1D35':'#FAF8F4', transition:'background .3s', minHeight:'100dvh', width:'100%', overflowX:'hidden' }}>
            <Navbar navigate={navigate} />
            <Hero navigate={navigate} />
            <Stats />
            <Roles />
            <Features />
            <HowItWorks />
            <FAQ />
            <CTA openContact={() => setContactOpen(true)} navigate={navigate} />
            <Footer openContact={() => setContactOpen(true)} navigate={navigate} />
            <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
        </div>
    );
}

export default LandingPage;
