import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(
        localStorage.getItem('theme') === 'dark'
    );

    useEffect(() => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.body.style.background = isDark ? '#0F1D35' : '#FAF8F4';
        document.body.style.transition = 'background .3s ease';
    }, [isDark]);

    const toggle = () => setIsDark(prev => !prev);

    const theme = {
        isDark,
        toggle,
        colors: isDark ? {
            // ── DARK ──
            pageBg:       '#0F1D35',
            cardBg:       '#162238',
            cardBg2:      '#1a2d4e',
            border:       'rgba(255,255,255,.08)',
            borderHover:  'rgba(201,168,130,.3)',
            text:         '#F0E6D0',
            textMuted:    '#6B7FA0',
            textLight:    '#2C3E6B',
            accent:       '#C9A882',
            accentDark:   '#8B6B4A',
            inputBg:      'rgba(255,255,255,.05)',
            inputBorder:  'rgba(255,255,255,.1)',
            inputText:    '#F0E6D0',
            btnPrimary:   '#C9A882',
            btnPrimaryTxt:'#0F1D35',
            btnSecondary: '#1a2d4e',
            btnSecTxt:    '#C9A882',
            logoDot:      '#C9A882',
            logoText:     '#F0E6D0',
            shadow:       '0 4px 24px rgba(0,0,0,.3)',
            errorBg:      'rgba(192,57,43,.15)',
            errorBorder:  'rgba(192,57,43,.3)',
            successBg:    'rgba(30,107,62,.15)',
            successBorder:'rgba(30,107,62,.3)',
        } : {
            // ── LIGHT ──
            pageBg:       '#FAF8F4',
            cardBg:       '#FFFFFF',
            cardBg2:      '#F0EBE1',
            border:       '#E8DDD0',
            borderHover:  '#8B6B4A',
            text:         '#4A2E1A',
            textMuted:    '#8B6B4A',
            textLight:    '#C9A882',
            accent:       '#8B6B4A',
            accentDark:   '#4A2E1A',
            inputBg:      '#F5F0E8',
            inputBorder:  '#C9B89A',
            inputText:    '#2C1810',
            btnPrimary:   '#3D2B1F',
            btnPrimaryTxt:'#E8D5B0',
            btnSecondary: '#F5F0E8',
            btnSecTxt:    '#3D2B1F',
            logoDot:      '#C9995A',
            logoText:     '#3D2B1F',
            shadow:       '0 4px 24px rgba(61,43,31,0.08)',
            errorBg:      '#fdf0f0',
            errorBorder:  '#f5c6c6',
            successBg:    '#f0fdf4',
            successBorder:'#bbf7d0',
        }
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
