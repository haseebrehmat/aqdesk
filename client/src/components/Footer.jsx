import { useState } from 'react';
import api from '../api/axios';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      await api.post('/newsletters', { email });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error('Subscription error', err);
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-400 font-sans mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Subscribe to AQDesk Insights</h3>
          <p className="text-sm text-slate-400 mt-1">
            Get weekly updates on emerging technologies, community Q&A highlights, and career openings.
          </p>
        </div>

        <div>
          {subscribed ? (
            <div className="flex items-center space-x-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
              <span>Thank you for subscribing to our community newsletter!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-grow">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </footer>
  );
}