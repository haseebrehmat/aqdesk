import { useState, useEffect } from "react";
import { Badge, Button, Card, FormControl, Loader, Modal, Text, TextArea, TextField, View } from "reshaped";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import { Search, PlusCircle, Trash2, Edit } from "../components/icons";
import { Page, PageHeader, EmptyState, NativeSelect } from "../components/ui";
import { routerLink } from "../components/RouterLink";

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
    <Page>
      <PageHeader
        title="Community Q&A"
        description="Ask questions, share answers, and learn with the community."
        actions={<Button color="primary" icon={PlusCircle} onClick={() => handleOpenModal()}>Ask Question</Button>}
      />

      <View direction={{ s: "column", m: "row" }} gap={3}>
        <View grow>
          <TextField
            name="search"
            icon={Search}
            placeholder="Search questions by keyword..."
            value={searchQuery}
            onChange={({ value }) => setSearchQuery(value)}
            inputAttributes={{ type: "search", "aria-label": "Search questions" }}
          />
        </View>
        {tags.length > 0 && (
          <View width={{ s: "100%", m: "220px" }}>
            <NativeSelect
              name="tag"
              value={selectedTag}
              onChange={({ value }) => setSelectedTag(value)}
              inputAttributes={{ "aria-label": "Filter by tag" }}
              options={[{ value: "", label: "All Tags" }, ...tags.map((tag) => ({ value: String(tag.id), label: tag.tag_name }))]}
            />
          </View>
        )}
      </View>

      {loading ? (
        <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading questions...</Text></View>
      ) : filteredQuestions.length === 0 ? (
        <EmptyState title="No questions found" description="Be the first one to ask a question!" />
      ) : (
        <View gap={4}>
          {filteredQuestions.map((q) => (
            <Card key={q.id} padding={5}>
              <View direction={{ s: "column", m: "row" }} justify="space-between" gap={4}>
                <View gap={2} grow attributes={{ style: { minWidth: 0 } }}>
                  <Button variant="ghost" color="primary" {...routerLink(`/dashboard/questions/${q.slug}`)}>{q.title}</Button>
                  <Text variant="body-2" color="neutral-faded" maxLines={2}>{q.body}</Text>
                  <View direction="row" gap={2} wrap>
                    {q.tags?.map((tag) => <Badge key={tag.id} variant="faded">{tag.tag_name}</Badge>)}
                  </View>
                </View>
                <View align={{ s: "start", m: "end" }} gap={2} shrink={false}>
                  <View direction="row" align="center" gap={1}>
                    <Text variant="caption-1" color="neutral-faded">{q.user?.name || "Anonymous"}</Text>
                    {currentUser?.id === q.user_id && (
                      <>
                        <Button variant="ghost" size="small" icon={Edit} onClick={() => handleOpenModal(q)} attributes={{ "aria-label": "Edit question", title: "Edit Question" }} />
                        <Button variant="ghost" size="small" color="critical" icon={Trash2} onClick={() => handleDelete(q.slug)} attributes={{ "aria-label": "Delete question", title: "Delete Question" }} />
                      </>
                    )}
                  </View>
                  <Badge color="primary" variant="faded">{q.answers_count ?? q.answers?.length ?? 0} answers</Badge>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Modal active={isModalOpen} onClose={() => setIsModalOpen(false)} size="640px" padding={6}>
        <Modal.Title>{editingSlug ? "Edit Question" : "Ask Question"}</Modal.Title>
        <form onSubmit={handleSubmit}>
          <View gap={4} paddingTop={4}>
            <FormControl>
              <FormControl.Label>Title</FormControl.Label>
              <TextField
                name="title"
                placeholder="e.g. How to implement custom middleware in Laravel?"
                value={formData.title}
                onChange={({ value }) => setFormData({ ...formData, title: value })}
                inputAttributes={{ required: true }}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Explanation Body (Markdown supported)</FormControl.Label>
              <TextArea
                name="body"
                placeholder="Provide detail on your technical problem using Markdown..."
                value={formData.body}
                onChange={({ value }) => setFormData({ ...formData, body: value })}
                inputAttributes={{ rows: 6, required: true }}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Custom Tags (Comma Separated)</FormControl.Label>
              <TextField
                name="custom_tags"
                placeholder="e.g. Inertia, Docker, GraphQL"
                value={formData.custom_tags}
                onChange={({ value }) => setFormData({ ...formData, custom_tags: value })}
              />
            </FormControl>
            <View direction="row" gap={2} justify="end">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" color="primary" loading={submitting}>{editingSlug ? "Update Question" : "Submit Question"}</Button>
            </View>
          </View>
        </form>
      </Modal>
    </Page>
  );
}
