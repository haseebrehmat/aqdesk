import { useState, useEffect } from "react";
import { Badge, Button, Card, Grid, Loader, Modal, View, Text } from "reshaped";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import { FolderPlus, Folder, Lock, Globe, FileText, MessageSquare, Users, Trash2 } from "../components/icons";
import { Page, PageHeader, EmptyState, FormField } from "../components/ui";
import { routerLink } from "../components/RouterLink";

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
    } catch {
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
    } catch {
      addToast("Failed to create project.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter((p) => p.id !== projectId));
      addToast("Project deleted.", "success");
    } catch {
      addToast("Failed to delete project.", "error");
    }
  };

  if (loading) {
    return <View align="center" padding={12}><Loader /></View>;
  }

  const set = (key) => (value) => setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <Page>
      <PageHeader
        title="Project Workspaces"
        description="Collaborate on open projects, upload assets, and share technical feedback."
        actions={<Button color="primary" icon={FolderPlus} onClick={() => setIsModalOpen(true)}>Create Workspace</Button>}
      />

      {projects.length === 0 ? (
        <EmptyState title="No projects created yet" description="Start a workspace to collaborate with your team." />
      ) : (
        <Grid columns={{ s: 1, m: 2, l: 3 }} gap={5}>
          {projects.map((project) => (
            <Card key={project.id} padding={5}>
              <View gap={4} height="100%" justify="space-between">
                <View gap={3}>
                  <View direction="row" justify="space-between" align="center">
                    <Badge variant="faded" color={project.visibility === "Public" ? "positive" : "warning"} icon={project.visibility === "Public" ? Globe : Lock}>
                      {project.visibility}
                    </Badge>
                    {currentUser?.id === project.owner_id && (
                      <Button variant="ghost" color="critical" size="small" icon={Trash2} onClick={() => handleDeleteProject(project.id)} attributes={{ "aria-label": "Delete project", title: "Delete Project" }} />
                    )}
                  </View>
                  <View gap={1}>
                    <View direction="row" align="center" gap={2}>
                      <Folder size={18} color="var(--rs-color-foreground-primary)" aria-hidden="true" />
                      <Button variant="ghost" color="primary" {...routerLink(`/projects/${project.id}`)}>{project.title}</Button>
                    </View>
                    <Text variant="body-2" color="neutral-faded" maxLines={2}>{project.description || "No description provided."}</Text>
                  </View>
                </View>
                <View direction="row" justify="space-between" align="center" borderTop paddingTop={3}>
                  <Text variant="caption-1" color="neutral-faded">By {project.owner?.name || "Anonymous"}</Text>
                  <View direction="row" gap={3}>
                    {[[FileText, project.files_count ?? 0, "Files"], [MessageSquare, project.feedback_count ?? 0, "Feedback"], [Users, project.members?.length ?? 1, "Members"]].map(([Icon, n, label]) => (
                      <View key={label} direction="row" align="center" gap={1} attributes={{ title: label }}>
                        <Icon size={14} aria-hidden="true" /><Text variant="caption-1" color="neutral-faded">{n}</Text>
                        <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{label}</span>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </Grid>
      )}

      <Modal active={isModalOpen} onClose={() => setIsModalOpen(false)} size="560px" padding={6}>
        <Modal.Title>Create New Workspace</Modal.Title>
        <form onSubmit={handleCreateProject}>
          <View gap={4} paddingTop={4}>
            <FormField label="Project Title" name="title" required placeholder="e.g. AI-Powered Code Reviewer" value={formData.title} onChange={set("title")} />
            <FormField label="Description" name="description" multiline rows={4} placeholder="Describe your workspace goals and requirements..." value={formData.description} onChange={set("description")} />
            <FormField
              label="Visibility"
              name="visibility"
              value={formData.visibility}
              onChange={set("visibility")}
              options={[
                { value: "Public", label: "Public (Visible to community)" },
                { value: "Private", label: "Private (Members only)" },
              ]}
            />
            <View direction="row" justify="end" gap={2}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" color="primary" loading={submitting}>Create Workspace</Button>
            </View>
          </View>
        </form>
      </Modal>
    </Page>
  );
}
