import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export default function ExamorShell({ children, style }) {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    document.dir = isAr ? 'rtl' : 'ltr';
  }, [isAr]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.pageBg,
        color: colors.text,
        fontFamily: 'Arial, sans-serif',
        direction: isAr ? 'rtl' : 'ltr',
        transition: 'background .3s ease, color .3s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

