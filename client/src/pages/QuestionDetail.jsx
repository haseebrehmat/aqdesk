import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Badge, Button, Card, Divider, Loader, Text, TextArea, View } from "reshaped";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import MarkdownContent from "../components/MarkdownContent";
import { VoteUp, VoteDown, CheckCircle2, Eye, Send, ArrowLeft, Check, Flag } from "../components/icons";
import { Page, EmptyState } from "../components/ui"
import { formatDate } from "../utils/format";
import { routerLink } from "../components/RouterLink";

function voteErrorMessage(error) {
  if (error.response?.status === 401) return "Please sign in to vote.";
  return error.response?.data?.message || "Unable to record your vote.";
}

function VoteControl({ votes, current, onUp, onDown, label }) {
  return (
    <View direction="row" align="center" gap={1} borderRadius="medium" border paddingInline={1}>
      <Button variant={current === 1 ? "faded" : "ghost"} color={current === 1 ? "primary" : "neutral"} size="large" icon={<VoteUp size={28} filled={current === 1} />} onClick={onUp} attributes={{ "aria-label": `Upvote ${label}`, title: `Upvote ${label}` }} />
      <Text variant="body-2" weight="bold">{votes ?? 0}</Text>
      <Button variant={current === -1 ? "faded" : "ghost"} color={current === -1 ? "critical" : "neutral"} size="large" icon={<VoteDown size={28} filled={current === -1} />} onClick={onDown} attributes={{ "aria-label": `Downvote ${label}`, title: `Downvote ${label}` }} />
    </View>
  );
}

export default function QuestionDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const { addToast } = useToast();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchQuestion();
  }, [slug]);

  useEffect(() => {
    if (!loading && question && location.hash === "#answers") {
      document.getElementById("answers")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, question, location.hash]);

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
    } catch (error) {
      addToast(voteErrorMessage(error), "error");
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
    } catch (error) {
      addToast(voteErrorMessage(error), "error");
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
      setQuestion((prev) => ({
        ...prev,
        answers: [...(prev.answers || []), { ...res.data.answer, net_votes: 0, user_vote: 0 }],
      }));
      setAnswerBody("");
      addToast("Answer posted successfully!", "success");
    } catch (error) {
      addToast(error.response?.data?.message || (error.response?.status === 401 ? "Please sign in to post an answer." : "Failed to post answer."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const reportContent = async (type, id) => {
    const reason = window.prompt("Explain why this content should be reviewed");
    if (!reason) return;
    try {
      const { data } = await api.post("/content-reports", {
        reportable_type: type,
        reportable_id: id,
        reason,
      });
      addToast(data.message, "success");
    } catch (error) {
      addToast(error.response?.data?.message || "Unable to submit the report.", "error");
    }
  };

  if (loading) return <View align="center" padding={12}><Loader /></View>;
  if (!question) return <Page width="900px"><EmptyState title="Question not found." /></Page>;

  const isSignedIn = Boolean(localStorage.getItem("token"));
  const isQuestionOwner = Number(currentUser?.id) === Number(question.user_id);
  const backTo = location.pathname.startsWith("/dashboard/") ? "/dashboard/questions" : "/questions";

  return (
    <Page width="1000px">
      <View direction="row"><Button variant="ghost" icon={ArrowLeft} {...routerLink(backTo)}>Back to Q&amp;A</Button></View>

      <Card padding={6}>
        <View gap={4}>
          <Text as="h1" variant="featured-2" weight="bold">{question.title}</Text>
          <MarkdownContent>{question.body}</MarkdownContent>
          <Divider />
          <View direction="row" justify="space-between" align="center" wrap gap={3}>
            <Text variant="caption-1" color="neutral-faded">Asked by <strong>{question.user?.name || "Anonymous"}</strong></Text>
            <View direction="row" align="center" gap={4} wrap>
              {currentUser.id && !isQuestionOwner && (
                <Button variant="ghost" color="warning" size="small" icon={Flag} onClick={() => reportContent("question", question.id)}>Report</Button>
              )}
              <VoteControl
                votes={question.net_votes}
                current={question.user_vote}
                onUp={() => handleVoteQuestion(1)}
                onDown={() => handleVoteQuestion(-1)}
                label="question"
              />
              <View direction="row" align="center" gap={1}><Eye size={14} aria-hidden="true" /><Text variant="caption-1" color="neutral-faded">{question.views} views</Text></View>
              <Text variant="caption-1" color="neutral-faded">{formatDate(question.created_at)}</Text>
            </View>
          </View>
        </View>
      </Card>

      <View gap={4} attributes={{ id: "answers" }}>
        <Text as="h2" variant="featured-5" weight="bold">{question.answers?.length || 0} Answers</Text>
        {question.answers?.map((ans) => (
          <Card key={ans.id} padding={5} attributes={ans.is_accepted ? { style: { borderColor: "var(--rs-color-border-positive)" } } : undefined}>
            <View gap={4}>
              <View direction={{ s: "column", m: "row" }} justify="space-between" gap={4}>
                <View grow attributes={{ style: { minWidth: 0 } }}><MarkdownContent>{ans.body}</MarkdownContent></View>
                <View direction="row" align="start" gap={2} shrink={false}>
                  {ans.is_accepted && <Badge color="positive" variant="faded" icon={CheckCircle2}>Solution</Badge>}
                  {isQuestionOwner && (
                    <Button size="small" variant="outline" color={ans.is_accepted ? "neutral" : "positive"} icon={Check} onClick={() => handleAcceptAnswer(ans.id)}>
                      {ans.is_accepted ? "Unmark" : "Accept Solution"}
                    </Button>
                  )}
                </View>
              </View>
              <Divider />
              <View direction="row" justify="space-between" align="center" wrap gap={3}>
                <Text variant="caption-1" color="neutral-faded">Answered by <strong>{ans.user?.name || "Anonymous"}</strong></Text>
                <VoteControl
                  votes={ans.net_votes}
                  current={ans.user_vote}
                  onUp={() => handleVoteAnswer(ans.id, 1)}
                  onDown={() => handleVoteAnswer(ans.id, -1)}
                  label="answer"
                />
                {currentUser.id && Number(currentUser.id) !== Number(ans.user_id) && (
                  <Button variant="ghost" color="warning" size="small" icon={Flag} onClick={() => reportContent("answer", ans.id)}>Report</Button>
                )}
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Card padding={6}>
        {isSignedIn ? (
          <form onSubmit={handlePostAnswer}>
            <View gap={4}>
              <Text as="h2" variant="featured-5" weight="bold">Your Answer</Text>
              <TextArea
                name="answer"
                placeholder="Write your solution using Markdown..."
                value={answerBody}
                onChange={({ value }) => setAnswerBody(value)}
                inputAttributes={{ rows: 5, required: true, "aria-label": "Your answer" }}
              />
              <Text variant="caption-1" color="neutral-faded">Markdown is supported. Raw HTML is ignored for safety.</Text>
              <View direction="row"><Button type="submit" color="primary" icon={Send} loading={submitting}>Post Answer</Button></View>
            </View>
          </form>
        ) : (
          <View gap={3} align="start">
            <Text as="h2" variant="featured-5" weight="bold">Join the discussion</Text>
            <Text color="neutral-faded">Answers are public to read. Sign in to post your own answer or vote.</Text>
            <Button color="primary" {...routerLink("/login")}>Sign in to answer</Button>
          </View>
        )}
      </Card>
    </Page>
  );
}
