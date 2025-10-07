import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import {
  MessageSquare,
  Tag,
  Search,
  PlusCircle,
  X,
  Loader2,
  Trash2,
  Edit,
} from "lucide-react";

export default function QAIndex() {
  const { addToast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: [],
    custom_tags: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestionsAndTags();
  }, []);

  const fetchQuestionsAndTags = async () => {
    try {
      const [qRes, tRes] = await Promise.all([
        api.get("/questions"),
        api.get("/tags"),
      ]);

      // Handle direct array or Laravel pagination wrapper
      const questionsData = Array.isArray(qRes.data)
        ? qRes.data
        : qRes.data?.data || [];

      const tagsData = Array.isArray(tRes.data)
        ? tRes.data
        : tRes.data?.data || [];

      setQuestions(questionsData);
      setTags(tagsData);
    } catch (err) {
      console.error("Failed to load Q&A data", err);
      addToast("Failed to load questions and tags.", "error");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (q = null) => {
    if (q) {
      setEditingSlug(q.slug);
      setFormData({
        title: q.title,
        body: q.body,
        tags: q.tags ? q.tags.map((t) => t.id) : [],
        custom_tags: "",
      });
    } else {
      setEditingSlug(null);
      setFormData({ title: "", body: "", tags: [], custom_tags: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingSlug) {
        const res = await api.put(`/questions/${editingSlug}`, formData);
        const updatedQuestion = res.data.question || res.data;
        setQuestions((prev) =>
          (Array.isArray(prev) ? prev : []).map((q) =>
            q.slug === editingSlug ? updatedQuestion : q
          )
        );
        addToast("Question updated successfully!", "success");
      } else {
        const res = await api.post("/questions", formData);
        const newQuestion = res.data.question || res.data;
        setQuestions((prev) => [
          newQuestion,
          ...(Array.isArray(prev) ? prev : []),
        ]);
        addToast("Question posted successfully!", "success");
      }
      setIsModalOpen(false);
      fetchQuestionsAndTags();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        "Failed to save question.";
      addToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      await api.delete(`/questions/${slug}`);
      setQuestions((prev) =>
        (Array.isArray(prev) ? prev : []).filter((q) => q.slug !== slug)
      );
      addToast("Question deleted successfully.", "success");
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to delete question.",
        "error"
      );
    }
  };

  const filteredQuestions = (Array.isArray(questions) ? questions : []).filter(
    (q) => {
      const matchesSearch =
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.body?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag
        ? q.tags?.some((t) => t.id === parseInt(selectedTag))
        : true;
      return matchesSearch && matchesTag;
    }
  );

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-blue-500" /> Community Q&A
          </h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center space-x-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ask Question</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        {tags.length > 0 && (
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.tag_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-sm">Loading questions...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-base font-medium text-slate-300">No questions found</p>
          <p className="text-xs text-slate-400 mt-1">Be the first one to ask a question!</p>
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="space-y-3 flex-1">
                <Link
                  to={`/questions/${q.slug}`}
                  className="text-lg font-semibold text-white hover:text-blue-400 transition block"
                >
                  {q.title}
                </Link>
                <p className="text-slate-300 text-sm line-clamp-2">{q.body}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {q.tags?.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-medium flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-blue-400" /> {tag.tag_name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 shrink-0 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <span>{q.user?.name || "Anonymous"}</span>
                  {currentUser?.id === q.user_id && (
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => handleOpenModal(q)}
                        className="p-1 hover:text-blue-400 transition"
                        title="Edit Question"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.slug)}
                        className="p-1 hover:text-red-400 transition"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <Link
                  to={`/questions/${q.slug}`}
                  className="mt-2 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20 font-medium hover:bg-blue-500/20 transition"
                >
                  {q.answers_count ?? q.answers?.length ?? 0} answers
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white">
              {editingSlug ? "Edit Question" : "Ask Question"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to implement custom middleware in Laravel?"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Explanation Body
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Provide detail on your technical problem..."
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Custom Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inertia, Docker, GraphQL"
                  value={formData.custom_tags}
                  onChange={(e) =>
                    setFormData({ ...formData, custom_tags: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span>{editingSlug ? "Update Question" : "Submit Question"}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}