import { render, screen } from '@testing-library/react';
import DashboardLayout from './components/DashboardLayout';

jest.mock('./context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      border: '#E8DDD0',
      text: '#2A211A',
      textMuted: '#8B6B4A',
    },
  }),
}));

jest.mock('./components/ExamorTopbar', () => () => <div data-testid="topbar">Topbar</div>);
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key) => key,
  }),
}));

test('renders dashboard layout navigation and content', () => {
  render(
    <DashboardLayout
      navItems={[
        { key: 'overview', label: 'Overview', onClick: jest.fn(), active: true },
        { key: 'results', label: 'Results', onClick: jest.fn(), active: false },
      ]}
    >
      <div>Dashboard Content</div>
    </DashboardLayout>
  );

  expect(screen.getByTestId('topbar')).toBeInTheDocument();
  expect(screen.getByText('Overview')).toBeInTheDocument();
  expect(screen.getByText('Results')).toBeInTheDocument();
  expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
});
