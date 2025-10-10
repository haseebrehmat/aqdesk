import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import {
  ArrowLeft,
  Upload,
  FileText,
  Trash2,
  Send,
  Loader2,
  Users,
  Globe,
  Lock,
  Download,
  UserPlus,
  Copy,
  UserX,
  Shield,
  Check,
} from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // File & Feedback state
  const [uploading, setUploading] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [postingFeedback, setPostingFeedback] = useState(false);

  // Invite & Member state
  const [inviteRole, setInviteRole] = useState("Collaborator");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      addToast("Failed to load project workspace.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Derive Role & Permissions
  const isOwner = currentUser?.id === project?.owner_id;
  const currentMember = project?.members?.find((m) => m.id === currentUser?.id);
  const userRole = isOwner ? "Owner" : currentMember?.pivot?.role_in_project || null;

  // Management rights: Owner & Maintainer
  const canManage = isOwner || userRole === "Maintainer";
  // Upload rights: Owner, Maintainer, & Collaborator (Reviewers excluded)
  const canUpload = isOwner || ["Maintainer", "Collaborator"].includes(userRole);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post(`/projects/${id}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProject((prev) => ({
        ...prev,
        files: [res.data, ...prev.files],
      }));
      addToast("File uploaded successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to upload file.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await api.delete(`/files/${fileId}`);
      setProject((prev) => ({
        ...prev,
        files: prev.files.filter((f) => f.id !== fileId),
      }));
      addToast("File deleted.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete file.", "error");
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setPostingFeedback(true);
    try {
      const res = await api.post(`/projects/${id}/feedback`, {
        comments: feedbackText,
      });
      setProject((prev) => ({
        ...prev,
        feedback: [...prev.feedback, res.data],
      }));
      setFeedbackText("");
      addToast("Feedback submitted!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to submit feedback.", "error");
    } finally {
      setPostingFeedback(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await api.delete(`/feedback/${feedbackId}`);
      setProject((prev) => ({
        ...prev,
        feedback: prev.feedback.filter((fb) => fb.id !== feedbackId),
      }));
      addToast("Feedback removed.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to remove feedback.", "error");
    }
  };

  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const res = await api.post(`/projects/${id}/invitations`, { role: inviteRole });
      setInviteUrl(res.data.invite_url);
      addToast("Invite link generated!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to generate invite link.", "error");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    addToast("Invite URL copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoleChange = async (memberId, newRole) => {
    setUpdatingRoleId(memberId);
    try {
      await api.put(`/projects/${id}/members/${memberId}`, { role: newRole });
      setProject((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.id === memberId
            ? { ...m, pivot: { ...m.pivot, role_in_project: newRole } }
            : m
        ),
      }));
      addToast("Member role updated!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update member role.", "error");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from project?")) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      setProject((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== memberId),
      }));
      addToast("Member removed from workspace.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to remove member.", "error");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-white">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
      </div>
    );
  }

  if (!project) {
    return <div className="p-10 text-center text-white">Workspace not found.</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8 font-sans">
      <Link
        to="/projects"
        className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Workspaces
      </Link>

      {/* Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
            {project.visibility === "Public" ? (
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            {project.visibility}
          </span>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          {project.description || "No description provided."}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-400 pt-4 border-t border-slate-800">
          <span>
            Owner: <strong className="text-slate-200">{project.owner?.name}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {project.members?.length || 1} Members
          </span>
        </div>
      </div>

      {/* Project Team & Invitations (Owner & Maintainer Controls) */}
      {canManage && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" /> Invite Collaborator
          </h2>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 shrink-0"
            >
              <option value="Collaborator">Collaborator</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Maintainer">Maintainer</option>
            </select>

            <button
              onClick={handleGenerateInvite}
              disabled={generatingInvite}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50 shrink-0"
            >
              {generatingInvite ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Generate Invite Link"
              )}
            </button>

            {inviteUrl && (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 w-full focus:outline-none"
                />
                <button
                  onClick={handleCopyInvite}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
                  title="Copy Link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shared Assets & Files */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Shared Assets & Files
              </h2>

              {/* Hide Upload button for Reviewers */}
              {canUpload && (
                <label className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer">
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  Upload File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/60">
              {project.files?.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">
                  No files uploaded yet.
                </p>
              ) : (
                project.files?.map((file) => (
                  <div
                    key={file.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="truncate space-y-0.5">
                      <p className="text-sm text-slate-200 font-medium truncate">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Uploaded by {file.uploader?.name || "Member"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`http://localhost:8000/storage/${file.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      {/* Delete file if User is Uploader, Owner, or Maintainer */}
                      {(canManage || currentUser?.id === file.uploaded_by) && (
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1.5 bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Feedback & Discussions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Feedback & Community Discussion
            </h2>

            <div className="space-y-3">
              {project.feedback?.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-500 text-xs text-center">
                  No discussions yet. Be the first to leave feedback!
                </div>
              ) : (
                project.feedback?.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <strong className="text-slate-200">
                        {fb.user?.name || "Anonymous"}
                      </strong>
                      {/* Delete feedback if Author, Owner, or Maintainer */}
                      {(canManage || currentUser?.id === fb.user_id) && (
                        <button
                          onClick={() => handleDeleteFeedback(fb.id)}
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {fb.comments}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddFeedback} className="space-y-3 pt-2">
              <textarea
                rows={3}
                required
                placeholder="Leave technical feedback or ask a project question..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={postingFeedback}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                {postingFeedback ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Post Comment
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Members Sidepanel */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Workspace Team
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            {project.members?.map((member) => {
              const isProjectOwner = member.id === project.owner_id;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between pb-3 border-b border-slate-800/80 last:pb-0 last:border-b-0 gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200 flex items-center gap-1.5 truncate">
                      <span className="truncate">{member.name}</span>
                      {isProjectOwner && (
                        <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Project Owner" />
                      )}
                    </p>

                    {/* Dynamic Role Dropdown for Managers, Static Badge for Others */}
                    {canManage && !isProjectOwner ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <select
                          value={member.pivot?.role_in_project || "Collaborator"}
                          disabled={updatingRoleId === member.id}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-md px-2 py-0.5 focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                        >
                          <option value="Maintainer">Maintainer</option>
                          <option value="Collaborator">Collaborator</option>
                          <option value="Reviewer">Reviewer</option>
                        </select>
                        {updatingRoleId === member.id && (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-400 shrink-0" />
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        {isProjectOwner ? "Owner" : member.pivot?.role_in_project || "Collaborator"}
                      </p>
                    )}
                  </div>

                  {/* Remove Button for Managers (Owner cannot be removed) */}
                  {canManage && !isProjectOwner && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition shrink-0"
                      title="Remove Member"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}