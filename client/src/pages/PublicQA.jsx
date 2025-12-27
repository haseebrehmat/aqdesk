import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowUp, Tag, Search, Sparkles } from 'lucide-react';
import api from '../api/axios';
import { echo } from '../utils/echo';

export default function PublicQA() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuestions();

    const channel = echo.channel('public-qa');
    channel.listen('.QuestionCreated', (e) => {
      setQuestions((prev) => [e.question, ...prev]);
    });
    channel.listen('.VoteUpdated', (e) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === e.questionId ? { ...q, votes_count: e.votes_count } : q))
      );
    });

    return () => {
      echo.leaveChannel('public-qa');
    };
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions');
      setQuestions(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = questions.filter(q =>
    q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" /> Community Discussions
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">Developer Knowledge Feed</h1>
            <p className="text-slate-600 text-sm">Ask technical questions, share code snippets, and solve bugs together.</p>
          </div>

        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search discussions by keyword, error log, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs transition"
          />
        </div>

        {/* Feed List */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm font-medium">Loading community feed...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 text-sm">
            No discussions found matching your search.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((q) => (
              <div
                key={q.id || q.slug}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 transition shadow-xs flex flex-col sm:flex-row gap-6 items-start"
              >
                {/* Vote Counter Badge */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-1 bg-slate-50 border border-slate-200 rounded-2xl p-3 w-full sm:w-16 shrink-0 text-center">
                  <ArrowUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-black text-slate-900">{q.votes_count || 0}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Votes</span>
                </div>

                {/* Content Body */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                      {(q.user?.name || 'D').charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900">{q.user?.name || 'Anonymous Peer'}</span>
                    <span>•</span>
                    <span>{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>

                  <Link
                    to={`/questions/${q.slug}`}
                    className="text-lg font-bold text-slate-900 hover:text-blue-600 transition block leading-snug"
                  >
                    {q.title}
                  </Link>

                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {q.body}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {(q.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 text-slate-400" /> {tag.tag_name || tag}
                      </span>
                    ))}
                    <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                      <MessageSquare className="w-3.5 h-3.5" /> {q.answers_count || q.answers?.length || 0} Answers
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
