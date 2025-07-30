import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const { user, updateUser , reloadUser} = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {

    const updateUserPaymentStatus = async () => {
      if (!user?.email || !sessionId) {
        setLoading(true);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/seller-paid-update`, {
          method: "POST",
          headers: {
            'Content-Type': "application/json"
          },
          body: JSON.stringify({ email: user.email })
        });

        if (!response.ok) {
          throw new Error('فشل تحديث حالة الدفع');
        }

        const data = await response.json();
        
        if (data.user) {
          updateUser({ paid: true });
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (error) {
        console.error('خطأ في تحديث حالة الدفع:', error);
        setError('حدث خطأ في تحديث حالة الدفع. يرجى الاتصال بالدعم الفني.');
      } finally {
        setLoading(false);
      }
    };

    updateUserPaymentStatus();
  }, [user?.email, sessionId, updateUser, navigate]);

  if (loading) {
    return (
      <section style={{ textAlign: 'center', padding: '2rem', marginTop: '80px' }} className="font-cairo">
        <div className="product Box-root">
          <div className="description Box-root">
            <h3>جارِ معالجة الدفع...</h3>
            <p>يرجى الانتظار بينما نؤكد اشتراكك.</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ textAlign: 'center', padding: '2rem', marginTop: '80px' }} className="font-cairo">
        <div className="product Box-root">
          <div className="description Box-root">
            <h3 style={{ color: '#dc2626' }}>خطأ في الدفع</h3>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/owner-payment')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
              className="font-cairo"
            >
              حاول مرة أخرى
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ textAlign: 'center', padding: '2rem', marginTop: '80px' }} className="font-cairo">
      <div className="product Box-root">
        <div className="description Box-root">
          <h3 style={{ color: '#059669', marginBottom: '1rem' }}>
            تم الاشتراك بنجاح!
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            تم تفعيل حساب البائع الخاص بك. يمكنك الآن الوصول إلى جميع ميزات البائع.
          </p>
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            {/* <p><strong>رقم الجلسة:</strong> {sessionId}</p> */}
            <p><strong>الخطة:</strong> اشتراك البائع (30.00$ شهرياً)</p>
            <p><strong>الحالة:</strong> {user?.paid ? 'تم الدفع ' : 'جارٍ المعالجة...'}</p>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            جارٍ التحويل إلى لوحة التحكم خلال ثوانٍ...
          </p>
        </div>
      </div>
    </section>
  );
};

export default SuccessPage;