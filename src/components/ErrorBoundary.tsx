import React, { Component, ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Fallback UI مع دعم الترجمة
function ErrorFallback({ error, onReset }: { error?: Error; onReset: () => void }) {
  // نحاول استخدام الترجمة إن أمكن، وإلا نعود للعربية
  let t = (ar: string) => ar;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const lang = useLanguage();
    t = lang.t;
  } catch {
    // خارج LanguageProvider — نستخدم النص العربي مباشرة
  }

  return (
    <div
      style={{ minHeight: '100vh', background: '#1a1a1a', color: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '4rem', height: '4rem', margin: '0 auto 1.5rem', background: 'rgba(239,68,68,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ width: '2rem', height: '2rem', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {t("حدث خطأ غير متوقع")}
        </h1>
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
          {t("عذراً، حدث خطأ في التطبيق. يرجى إعادة تحميل الصفحة.")}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => window.location.reload()}
            style={{ width: '100%', background: '#b8960c', color: '#1a1a1a', border: 'none', height: '2.5rem', padding: '0 1rem', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}
          >
            {t("إعادة تحميل الصفحة")}
          </button>
          <button
            onClick={onReset}
            style={{ width: '100%', background: '#2a2a2a', color: '#f0f0f0', border: '1px solid #444', height: '2.5rem', padding: '0 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}
          >
            {t("المحاولة مرة أخرى")}
          </button>
        </div>
        {error && (
          <details style={{ marginTop: '1rem', fontSize: '0.75rem', textAlign: 'left', background: '#222', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #444' }}>
            <summary style={{ cursor: 'pointer' }}>{t("تفاصيل الخطأ")}</summary>
            <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
