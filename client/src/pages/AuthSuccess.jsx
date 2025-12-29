import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, Text, View } from 'reshaped';
import api from '../api/axios';

export default function AuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing secure sign in...');
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const code = params.get('code');
    if (!code) {
      navigate('/login?error=Social+login+failed', { replace: true });
      return;
    }

    api.post('/auth/exchange', { code }).then(({ data }) => {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const destination = data.user.role?.role_name?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(destination, { replace: true });
    }).catch(() => {
      setMessage('The social sign-in link expired. Please try again.');
      window.setTimeout(() => navigate('/login', { replace: true }), 1500);
    });
  }, [navigate, params]);

  return (
    <View as="main" minHeight="100vh" align="center" justify="center" gap={3} backgroundColor="page">
      <Loader />
      <Text attributes={{ role: 'status' }}>{message}</Text>
    </View>
  );
}
