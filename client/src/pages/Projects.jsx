import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import {
  FolderPlus,
  Folder,
  Lock,
  Globe,
  FileText,
  MessageSquare,
  Users,
  Loader2,
  X,
  Trash2,
} from "lucide-react";

export default function Projects() {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Project Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "Public",
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      addToast("Failed to fetch projects.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/projects", formData);
      setProjects([res.data, ...projects]);
      setFormData({ title: "", description: "", visibility: "Public" });
      setIsModalOpen(false);
      addToast("Project created successfully!", "success");
    } catch (err) {
      addToast("Failed to create project.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter((p) => p.id !== projectId));
      addToast("Project deleted.", "success");
    } catch (err) {
      addToast("Failed to delete project.", "error");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-white">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Project Workspaces</h1>
          <p className="text-slate-400 text-sm mt-1">
            Collaborate on open projects, upload assets, and share technical feedback.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition"
        >
          <FolderPlus className="w-4 h-4" /> Create Workspace
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="p-10 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
          No projects created yet. Start a workspace above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between space-y-4 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                    {project.visibility === "Public" ? (
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    {project.visibility}
                  </span>

                  {currentUser?.id === project.owner_id && (
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Link to={`/projects/${project.id}`} className="block space-y-1">
                  <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition flex items-center gap-2">
                    <Folder className="w-5 h-5 text-blue-500 shrink-0" />
                    <span className="truncate">{project.title}</span>
                  </h2>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                </Link>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>By {project.owner?.name || "Anonymous"}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1" title="Files">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {project.files_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1" title="Feedback">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    {project.feedback_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1" title="Members">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {project.members?.length ?? 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Create Workspace Project</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered Code Reviewer"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your workspace goals and requirements..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Visibility
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData({ ...formData, visibility: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Public">Public (Visible to community)</option>
                  <option value="Private">Private (Members only)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2 rounded-xl text-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Workspace"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}