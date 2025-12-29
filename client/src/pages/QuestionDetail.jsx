import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Eye,
  Send,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";

export default function QuestionDetail() {
  const { slug } = useParams();
  const { addToast } = useToast();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchQuestion();
  }, [slug]);

  const fetchQuestion = async () => {
    try {
      const res = await api.get(`/questions/${slug}`);
      setQuestion(res.data);
    } catch (err) {
      console.error("Failed to load details", err);
      addToast("Failed to load question details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteQuestion = async (type) => {
    try {
      const res = await api.post(`/questions/${slug}/vote`, { type });
      setQuestion({
        ...question,
        net_votes: res.data.net_votes,
        user_vote: res.data.user_vote,
      });
    } catch {
      addToast("Please sign in to vote.", "error");
    }
  };

  const handleVoteAnswer = async (answerId, type) => {
    try {
      const res = await api.post(`/answers/${answerId}/vote`, { type });
      setQuestion({
        ...question,
        answers: question.answers.map((ans) =>
          ans.id === answerId
            ? { ...ans, net_votes: res.data.net_votes, user_vote: res.data.user_vote }
            : ans
        ),
      });
    } catch {
      addToast("Please sign in to vote.", "error");
    }
  };

  const handleAcceptAnswer = async (answerId) => {
  try {
    const res = await api.patch(`/answers/${answerId}/accept`);
    const updatedIsAccepted = res.data.is_accepted;

    setQuestion((prev) => ({
      ...prev,
      answers: prev.answers.map((ans) => ({
        ...ans,
        is_accepted: ans.id === answerId ? updatedIsAccepted : false,
      })),
    }));

    addToast(
      updatedIsAccepted ? "Marked as solution!" : "Solution unmarked.",
      "success"
    );
  } catch (err) {
    addToast(
      err.response?.data?.message || "Failed to update solution status.",
      "error"
    );
  }
};

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(`/questions/${slug}/answers`, { body: answerBody });
      setQuestion({
        ...question,
        answers: [...(question.answers || []), res.data.answer],
      });
      setAnswerBody("");
      addToast("Answer posted successfully!", "success");
    } catch {
      addToast("Failed to post answer.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-white">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
      </div>
    );
  if (!question)
    return <div className="p-10 text-center text-white">Question not found.</div>;

  const isQuestionOwner = currentUser?.id === question.user_id;

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8 font-sans">
      <Link
        to="/questions"
        className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Q&A
      </Link>

      {/* Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">{question.title}</h1>
        <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
          {question.body}
        </p>

        {/* Footer Metadata & Voting Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-4 border-t border-slate-800">
          <span>
            Asked by{" "}
            <strong className="text-slate-200">
              {question.user?.name || "Anonymous"}
            </strong>
          </span>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-xl px-2 py-1 space-x-1">
              <button
                onClick={() => handleVoteQuestion(1)}
                className={`p-1.5 rounded-lg transition ${
                  question.user_vote === 1
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Upvote"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <span className="font-semibold text-sm text-white px-1">
                {question.net_votes ?? 0}
              </span>
              <button
                onClick={() => handleVoteQuestion(-1)}
                className={`p-1.5 rounded-lg transition ${
                  question.user_vote === -1
                    ? "bg-red-600/20 text-red-400"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Downvote"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>

            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-slate-400" /> {question.views} views
            </span>
            <span>{new Date(question.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Answers List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">
          {question.answers?.length || 0} Answers
        </h2>
        {question.answers?.map((ans) => (
          <div
            key={ans.id}
            className={`p-6 rounded-2xl border space-y-4 transition ${
              ans.is_accepted
                ? "bg-emerald-950/20 border-emerald-500/40"
                : "bg-slate-900 border-slate-800"
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <p className="text-slate-200 text-sm whitespace-pre-line flex-1 leading-relaxed">
                {ans.body}
              </p>

              {/* Solution Badge or Accept Button */}
              <div className="shrink-0 flex items-center space-x-2">
                {ans.is_accepted && (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Solution
                  </span>
                )}

                {/* Question Author Action Button */}
                {isQuestionOwner && (
                  <button
                    onClick={() => handleAcceptAnswer(ans.id)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition ${
                      ans.is_accepted
                        ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                        : "bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{ans.is_accepted ? "Unmark" : "Accept Solution"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Answer Footer & Voting Controls */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
              <span>
                Answered by{" "}
                <strong className="text-slate-300">
                  {ans.user?.name || "Anonymous"}
                </strong>
              </span>

              <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-xl px-2 py-1 space-x-1">
                <button
                  onClick={() => handleVoteAnswer(ans.id, 1)}
                  className={`p-1 rounded-lg transition ${
                    ans.user_vote === 1
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Upvote Answer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold text-xs text-white px-1">
                  {ans.net_votes ?? 0}
                </span>
                <button
                  onClick={() => handleVoteAnswer(ans.id, -1)}
                  className={`p-1 rounded-lg transition ${
                    ans.user_vote === -1
                      ? "bg-red-600/20 text-red-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Downvote Answer"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Answer Form */}
      <form
        onSubmit={handlePostAnswer}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-white">Your Answer</h3>
        <textarea
          rows={4}
          required
          placeholder="Write your solution..."
          value={answerBody}
          onChange={(e) => setAnswerBody(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" /> Post Answer
            </>
          )}
        </button>
      </form>
    </div>
  );
}
