import { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import { Loader2, Save } from "lucide-react";

export default function Profile() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    skills_tags: "",
    avatar_url: "",
    role: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile");
      const user = response.data;
      setProfile({
        name: user.name || "",
        email: user.email || "",
        bio: user.profile?.bio || "",
        skills_tags: user.profile?.skills_tags || "",
        avatar_url: user.profile?.avatar_url || "",
        role: user.role || {},
      });
    } catch {
      addToast("Failed to load profile details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put("/profile", {
        name: profile.name,
        bio: profile.bio,
        skills_tags: profile.skills_tags,
        avatar_url: profile.avatar_url,
      });
      addToast("Profile details updated successfully.", "success");
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-10">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">User Profile</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your identity and metadata
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {profile.role?.name || "Member"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email (Read Only)
            </label>
            <input
              type="email"
              disabled
              value={profile.email}
              className="w-full bg-slate-950/50 border border-slate-800/50 text-slate-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Bio / Overview
            </label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell the community about your technical background..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Skill Tags (Comma separated)
            </label>
            <input
              type="text"
              value={profile.skills_tags}
              onChange={(e) =>
                setProfile({ ...profile, skills_tags: e.target.value })
              }
              placeholder="React, Laravel, MySQL, Tailwind"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
