import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import { Loader2, AlertCircle } from "lucide-react";

export default function JoinProject() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [joining, setJoining] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    handleJoin();
  }, [token]);

  const handleJoin = async () => {
    // 1. Check if user is authenticated
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      localStorage.setItem("pendingInviteToken", token);
      addToast("Please sign in or sign up to join this workspace.", "info");
      navigate("/login");
      return;
    }

    // 2. Clear stored pending token immediately so it cannot re-trigger
    localStorage.removeItem("pendingInviteToken");

    // 3. Attempt joining workspace
    try {
      setJoining(true);
      const res = await api.post(`/projects/join/${token}`);
      addToast(res.data.message || "Successfully joined project!", "success");

      // Redirect to project detail view
      navigate(`/projects/${res.data.project_id}`);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to join project invitation.";

      setError(errorMsg);
      addToast(errorMsg, "error");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
        {joining ? (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <h2 className="text-xl font-bold">Joining Project Workspace...</h2>
            <p className="text-sm text-slate-400 mt-2">
              Validating invitation token and setting up member access.
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-4">
            <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mb-4 ring-1 ring-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Invitation Error
            </h2>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => navigate("/projects")}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-xl text-sm transition"
            >
              Return to Projects
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}