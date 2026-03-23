import './i18n/index.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import * as Sentry from '@sentry/react';

const sentryDsn = process.env.REACT_APP_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: Number(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || 0.1),
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
const appContent = (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

root.render(
  <React.StrictMode>
    {sentryDsn ? (
      <Sentry.ErrorBoundary fallback={<div style={{ padding: 24 }}>Something went wrong.</div>}>
        {appContent}
      </Sentry.ErrorBoundary>
    ) : appContent}
  </React.StrictMode>
);
