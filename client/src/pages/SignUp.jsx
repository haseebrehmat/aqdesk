import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: 3,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/register", formData);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const user = response.data.user;

      // Check localStorage for pending invitation
      const pendingInvite = localStorage.getItem("pendingInviteToken");

      if (pendingInvite) {
        navigate(`/projects/join/${pendingInvite}`);
      } else {
        // Role-based redirection after sign up
        if (user.role_id === 1 || user.role?.role_name === "Administrator") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your details and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row font-sans overflow-x-hidden">
      {/* Left Hero Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 sm:p-10 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto w-full">
          {/* Logo Header */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              AQ<span className="text-blue-500">Desk</span>
            </span>
          </div>

          {/* Hero Content */}
          <div className="mt-8 lg:mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              Unified Learning & Collaboration Ecosystem
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
              Connect with workspaces, engage in peer Q&A discussions, and
              unlock academic opportunities.
            </p>
          </div>

          {/* Feature List */}
          <div className="mt-8 lg:mt-10 space-y-3.5">
            {[
              "Real-time Collaborative Workspaces",
              "Peer-to-Peer Technical Q&A",
              "Verified Career Opportunities",
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 text-sm text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="max-w-md mx-auto w-full mt-10 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enterprise Grade</span>
          </span>
          <span className="font-mono text-slate-400">v2.4 Pro</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:w-1/2 p-6 sm:p-10 lg:p-16 flex flex-col justify-center bg-slate-950 relative">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-slate-300 mt-2 mb-8">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition"
            >
              Sign In
            </Link>
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-xs sm:text-sm mb-6 flex items-start space-x-2">
              <span className="font-semibold shrink-0">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition duration-150"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@vu.edu.pk"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition duration-150"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition duration-150"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl text-sm transition duration-150 shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 group mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
