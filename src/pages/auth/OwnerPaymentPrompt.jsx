import React, { useEffect, useState } from 'react';
import './OwnerPaymentPrompt.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="14px"
    height="16px"
    viewBox="0 0 14 16"
    version="1.1"
  >
    <defs />
    <g id="Flow" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        id="0-Default"
        transform="translate(-121.000000, -40.000000)"
        fill="#E184DF"
      >
        <path
          d="M127,50 L126,50 C123.238576,50 121,47.7614237 121,45 C121,42.2385763 123,43.3431458 123,45 C123,46.6568542 124.343146,48 126,48 L127,48 Z"
          id="Pilcrow"
        />
      </g>
    </g>
  </svg>
);

export default function OwnerPaymentPrompt() {
  const { user, setUser, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [hasCheckedPayment, setHasCheckedPayment] = useState(false);

  useEffect(() => {
    // Don't redirect during auth loading
    if (isLoading) return;
    
    // Don't check multiple times
    if (hasCheckedPayment) return;
    
    // Mark as checked
    setHasCheckedPayment(true);
    
    // If user is paid or not a seller, redirect to home
    if (user && (user.paid || user.role !== 'seller')) {
      console.log('User is paid or not a seller, redirecting to home');
      navigate('/home', { replace: true });
    }
  }, [user, isLoading, navigate, hasCheckedPayment]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    if (!user){
      setLoading(false);
      setError('user is not exist');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId: 'price_1RmZ5F2XYUV5klvcqmbi27VF',
          email: user?.email
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Payment response:', data);
      
      if (data && typeof data === 'string' && data.startsWith('https://checkout.stripe.com')) {
        // Show loading state briefly before redirect
        setTimeout(() => {
          window.location.href = data;
        }, 500);
      } else {
        setError('Invalid payment session URL received.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Error starting payment session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading during auth check
  if (isLoading || !hasCheckedPayment) {
    return (
      <section>
        <div className="product Box-root" style={{ maxWidth: 420, width: '100%', margin: '2rem auto', textAlign: 'center' }}>
          <div style={{ marginTop: 24 }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A37F41] mx-auto mb-4"></div>
            <p style={{ color: '#6b7280' }}>Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="product Box-root" style={{ maxWidth: 420, width: '100%', margin: '2rem auto', textAlign: 'center' }}>
        <Logo />
        <div className="description Box-root" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: '2rem', color: '#2d3748', marginBottom: 8 }}>
            Activate Your Seller Account
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: 24 }}>
            To access all seller features, you must complete your account activation by paying the subscription fee.
          </p>
          <div style={{ 
            background: '#f9fafb', 
            borderRadius: 12, 
            padding: 20, 
            marginBottom: 24, 
            border: '1px solid #e5e7eb' 
          }}>
            <h3 style={{ fontSize: '1.3rem', color: '#4f46e5', margin: 0 }}>
              Seller Subscription
            </h3>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', margin: '8px 0 0 0' }}>
              $5.00 / month
            </div>
          </div>
          <button
            id="checkout-and-portal-button"
            type="button"
            onClick={handlePayment}
            disabled={loading}
            style={{ 
              minWidth: 200,
              padding: '12px 24px',
              backgroundColor: loading ? '#9ca3af' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? 'Processing...' : 'Pay & Activate Account'}
          </button>
          
          {error && (
            <div style={{ 
              color: '#dc2626', 
              marginTop: 16, 
              padding: 12, 
              backgroundColor: '#fef2f2', 
              borderRadius: 8,
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => navigate('/home')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Continue browsing (limited access)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}