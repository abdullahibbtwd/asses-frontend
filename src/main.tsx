import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import ErrorBoundary from './components/shared/ErrorBoundary.tsx';
import { AppRouter } from './routes/AppRouter';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 8,
          fontFamily:
            "'Inter', system-ui, -apple-system, sans-serif",
        },
      }}
    >
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </ConfigProvider>
  </StrictMode>,
);
