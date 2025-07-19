import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const { user, updateUser } = useAuth(); // ✅ Use updateUser instead of setUser
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const updateUserPaymentStatus = async () => {
      if (!user?.email || !sessionId) {
        setError('Missing user information or session ID');
        setLoading(false);
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
          throw new Error('Failed to update payment status');
        }

        const data = await response.json();
        
        if (data.user) {
          // ✅ Use updateUser to merge the updated user data
          updateUser({ paid: true }); // Or updateUser(data.user) if you want to replace all data
          
          // Redirect to dashboard after successful payment
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
        setError('Error updating payment status. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    updateUserPaymentStatus();
  }, [user?.email, sessionId, updateUser, navigate]);

  if (loading) {
    return (
      <section style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="product Box-root">
          <div className="description Box-root">
            <h3>Processing your payment...</h3>
            <p>Please wait while we confirm your subscription.</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="product Box-root">
          <div className="description Box-root">
            <h3 style={{ color: '#dc2626' }}>Payment Error</h3>
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
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ textAlign: 'center', padding: '2rem' }}>
      <div className="product Box-root">
        <div className="description Box-root">
          <h3 style={{ color: '#059669', marginBottom: '1rem' }}>
            🎉 Subscription Successful!
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Your seller account has been activated. You now have access to all seller features.
          </p>
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <p><strong>Session ID:</strong> {sessionId}</p>
            <p><strong>Plan:</strong> Seller Subscription ($5.00/month)</p>
            <p><strong>Status:</strong> {user?.paid ? 'Paid ✅' : 'Processing...'}</p>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Redirecting to dashboard in a few seconds...
          </p>
        </div>
      </div>
    </section>
  );
};

export default SuccessPage;