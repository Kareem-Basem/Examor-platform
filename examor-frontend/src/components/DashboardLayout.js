import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ExamorShell from './ExamorShell';
import ExamorTopbar from './ExamorTopbar';

export default function DashboardLayout({ navItems, children, interactiveNav = false }) {
  const { isDark, colors } = useTheme();
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = viewportWidth <= 1024;
  const isMobile = viewportWidth <= 768;
  const isNarrowMobile = viewportWidth <= 480;

  return (
    <ExamorShell>
      <ExamorTopbar compact />
      <div
        style={{
          display: 'flex',
          flexDirection: isTablet ? 'column' : 'row',
          minHeight: 'calc(100vh - 60px)',
        }}
      >
        <aside
          style={{
            width: isTablet ? '100%' : 270,
            padding: isNarrowMobile ? '10px 8px' : isMobile ? '12px 10px' : isTablet ? '16px 16px' : '22px 18px',
            background: isDark ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.55)',
            borderInlineEnd: isTablet ? 'none' : `1px solid ${colors.border}`,
            borderBottom: isTablet ? `1px solid ${colors.border}` : 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isTablet ? 'row' : 'column',
              gap: 8,
              overflowX: isTablet ? 'auto' : 'visible',
              paddingBottom: isTablet ? 2 : 0,
              scrollbarWidth: 'none',
            }}
          >
            {navItems?.map((item) => (
              <button
                key={item.key}
                onClick={item.onClick}
                onMouseEnter={(e) => {
                  if (!interactiveNav || item.active) return;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(201,168,130,.30)' : 'rgba(139,107,74,.30)';
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.045)' : 'rgba(139,107,74,.06)';
                  e.currentTarget.style.boxShadow = isDark ? '0 10px 22px rgba(0,0,0,.20)' : '0 10px 22px rgba(139,107,74,.10)';
                  e.currentTarget.style.color = colors.text;
                }}
                onMouseLeave={(e) => {
                  if (!interactiveNav || item.active) return;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.color = colors.textMuted;
                }}
                style={{
                  width: isTablet ? 'auto' : '100%',
                  minWidth: isNarrowMobile ? 88 : isMobile ? 104 : isTablet ? 132 : '100%',
                  flex: isTablet ? '0 0 auto' : 'initial',
                  textAlign: 'start',
                  padding: isNarrowMobile ? '8px 8px' : isMobile ? '9px 10px' : '12px 12px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: `1px solid ${item.active ? (isDark ? 'rgba(201,168,130,.28)' : 'rgba(139,107,74,.28)') : colors.border}`,
                  background: item.active
                    ? isDark
                      ? 'rgba(201,168,130,.12)'
                      : 'rgba(139,107,74,.10)'
                    : 'transparent',
                  color: item.active ? colors.text : colors.textMuted,
                  fontWeight: item.active ? 'bold' : '600',
                  fontSize: isNarrowMobile ? 9.5 : isMobile ? 10.5 : 13,
                  transition: 'all .2s ease',
                  transform: 'translateY(0)',
                  boxShadow: item.active
                    ? isDark
                      ? '0 12px 24px rgba(0,0,0,.18)'
                      : '0 12px 24px rgba(139,107,74,.08)'
                    : 'none',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: isNarrowMobile ? '12px 8px 22px' : isMobile ? '14px 10px 26px' : isTablet ? '20px 16px 32px' : '26px 26px 40px',
          }}
        >
          {children}
        </main>
      </div>
    </ExamorShell>
  );
}
