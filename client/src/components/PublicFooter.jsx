import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';
import api from '../api/axios';

// Direct SVG path components for brands
const GithubIcon = ({ size = 16, className = "" }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const XIcon = ({ size = 16, className = "" }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.98 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
  </svg>
);

export default function PublicFooter() {
  const [email, setEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const subscribe = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/newsletter/subscribe', { email });
      setNewsletterMessage(data.message);
      setEmail('');
    } catch (error) {
      setNewsletterMessage(error.response?.data?.message || 'Subscription failed. Please check the email address.');
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="h-9 w-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                AQ<span className="text-blue-600">Desk</span>
              </span>
            </Link>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm">
              AQDesk is an all-in-one collaborative learning platform unifying technical Q&A, workspace management, mentorship, and career placements for modern software developers.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" aria-label="AQDesk on GitHub" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center justify-center">
                <GithubIcon size={16} />
              </a>
              <a href="https://twitter.com" aria-label="AQDesk on X" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center justify-center">
                <XIcon size={16} />
              </a>
              <a href="https://linkedin.com" aria-label="AQDesk on LinkedIn" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center justify-center">
                <LinkedinIcon size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Platform Hub</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/questions" className="hover:text-blue-600 transition">Community Q&A</Link></li>
              <li><Link to="/opportunities" className="hover:text-blue-600 transition">Job Opportunities</Link></li>
              <li><Link to="/events" className="hover:text-blue-600 transition">Live Tech Events</Link></li>
              <li><Link to="/podcasts" className="hover:text-blue-600 transition">Audio Podcasts</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/about" className="hover:text-blue-600 transition">About Us</Link></li>
              <li><Link to="/login" className="hover:text-blue-600 transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-blue-600 transition">Create Account</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Stay Updated</h4>
            <p className="text-slate-500 text-xs">Subscribe to our developer broadcast newsletter for weekly tech updates.</p>
            <form onSubmit={subscribe} className="flex flex-col gap-2">
              <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter</label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition shadow-xs">
                Subscribe
              </button>
              {newsletterMessage && <p role="status" className="text-xs text-slate-600">{newsletterMessage}</p>}
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AQDesk Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for Software Engineers
          </p>
        </div>
      </div>
    </footer>
  );
}
