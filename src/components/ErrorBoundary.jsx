import React from 'react';
import { Button } from './ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ غير متوقع</h2>
              <p className="text-gray-600 mb-6">
                عذراً، حدث خطأ أثناء عرض هذه الصفحة. يرجى المحاولة مرة أخرى.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                    تفاصيل الخطأ (للمطورين)
                  </summary>
                  <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                    <p className="font-bold text-red-600">{this.state.error.toString()}</p>
                    <pre className="mt-2 text-gray-700">{this.state.errorInfo.componentStack}</pre>
                  </div>
                </details>
              )}
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  العودة للرئيسية
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-red-500 hover:bg-red-600"
                >
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
