import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';

function Navbar() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const user = JSON.parse(localStorage.getItem('user'));

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
        document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    };

    const handleLogout = async () => {
        const confirmMessage = isRTL
            ? 'هل تريد تسجيل الخروج الآن؟'
            : 'Do you want to logout now?';

        if (!window.confirm(confirmMessage)) return;

        try {
            await API.post('/auth/logout');
        } catch (_) {
            // Ignore backend failures and clear local session anyway.
        }

        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    const isRTL = i18n.language === 'ar';

    return (
        <div style={styles.navbar}>
            <h2 style={styles.logo} onClick={() => navigate('/')}>
                Examor
            </h2>

            <div style={styles.right}>
                <span style={styles.userName}>👤 {user.name}</span>
                <span style={{
                    ...styles.roleBadge,
                    backgroundColor:
                        user.role === 'admin'   ? '#ea4335' :
                        user.role === 'teacher' ? '#1a73e8' : '#34a853'
                }}>
                    {user.role}
                </span>

                {/* زرار تغيير اللغة */}
                <button style={styles.langBtn} onClick={toggleLanguage}>
                    {isRTL ? 'EN' : 'عر'}
                </button>

                <button style={styles.logoutBtn} onClick={handleLogout}>
                    {t('nav.logout')}
                </button>
            </div>
        </div>
    );
}

const styles = {
    navbar: {
        backgroundColor: '#2c3e50',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    },
    logo: {
        color: '#1a73e8',
        margin: 0,
        cursor: 'pointer',
        fontSize: '24px'
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    userName: {
        color: '#fff',
        fontSize: '14px'
    },
    roleBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    langBtn: {
        padding: '8px 14px',
        backgroundColor: '#1a73e8',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold'
    },
    logoutBtn: {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        color: '#aaa',
        border: '1px solid #aaa',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px'
    }
};

export default Navbar;
