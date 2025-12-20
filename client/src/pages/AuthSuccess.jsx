import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function AuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing secure sign in...');

  useEffect(() => {
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

  return <main className="min-h-screen bg-slate-950 text-white grid place-items-center"><p role="status">{message}</p></main>;
}
