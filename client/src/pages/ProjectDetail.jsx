import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Badge, Button, Card, Divider, Loader, Text, TextArea, TextField, View, Grid } from "reshaped";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import { ArrowLeft, Upload, FileText, Trash2, Send, Users, Globe, Lock, Download, UserPlus, Copy, UserX, Shield, Check } from "../components/icons";
import { Page, EmptyState, NativeSelect } from "../components/ui";
import { routerLink } from "../components/RouterLink";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function ProjectDetail() {
  const { id } = useParams();
  const { addToast, confirm } = useToast();
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
    } catch {
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
    if (!(await confirm("Delete this file?", { title: "Confirm deletion", confirmLabel: "Delete" }))) return;
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
    if (!(await confirm("Remove this member from project?", { title: "Confirm deletion", confirmLabel: "Delete" }))) return;
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

  if (loading) return <View align="center" padding={12}><Loader /></View>;
  if (!project) return <Page width="1100px"><EmptyState title="Workspace not found." /></Page>;

  const roleOptions = ["Maintainer", "Collaborator", "Reviewer"].map((v) => ({ value: v, label: v }));

  return (
    <Page width="1100px">
      <View direction="row"><Button variant="ghost" icon={ArrowLeft} {...routerLink("/projects")}>Back to Workspaces</Button></View>

      <Card padding={6}>
        <View gap={4}>
          <View direction="row" justify="space-between" align="center" wrap gap={3}>
            <Text as="h1" variant="featured-2" weight="bold">{project.title}</Text>
            <Badge variant="faded" color={project.visibility === "Public" ? "positive" : "warning"} icon={project.visibility === "Public" ? Globe : Lock}>{project.visibility}</Badge>
          </View>
          <Text color="neutral-faded">{project.description || "No description provided."}</Text>
          <Divider />
          <View direction="row" gap={4}>
            <Text variant="caption-1" color="neutral-faded">Owner: <strong>{project.owner?.name}</strong></Text>
            <View direction="row" align="center" gap={1}><Users size={14} aria-hidden="true" /><Text variant="caption-1" color="neutral-faded">{project.members?.length || 1} Members</Text></View>
          </View>
        </View>
      </Card>

      {canManage && (
        <Card padding={6}>
          <View gap={4}>
            <View direction="row" align="center" gap={2}><UserPlus size={20} aria-hidden="true" /><Text as="h2" variant="featured-5" weight="bold">Invite Collaborator</Text></View>
            <View direction={{ s: "column", m: "row" }} gap={3} align={{ s: "stretch", m: "center" }}>
              <View width={{ s: "100%", m: "200px" }}>
                <NativeSelect name="invite_role" value={inviteRole} onChange={({ value }) => setInviteRole(value)} inputAttributes={{ "aria-label": "Invite role" }}
                  options={["Collaborator", "Reviewer", "Maintainer"].map((v) => ({ value: v, label: v }))} />
              </View>
              <Button color="primary" onClick={handleGenerateInvite} loading={generatingInvite}>Generate Invite Link</Button>
            </View>
            {inviteUrl && (
              <TextField
                name="invite_url"
                value={inviteUrl}
                onChange={() => {}}
                inputAttributes={{ readOnly: true, "aria-label": "Invite link" }}
                endSlot={<Button variant="ghost" size="small" icon={copied ? Check : Copy} onClick={handleCopyInvite} attributes={{ "aria-label": "Copy link", title: "Copy Link" }} />}
              />
            )}
          </View>
        </Card>
      )}

      <Grid columns={{ s: 1, l: "2fr 1fr" }} gap={6} align="start">
        <View gap={8}>
          <View gap={4}>
            <View direction="row" justify="space-between" align="center">
              <View direction="row" align="center" gap={2}><FileText size={20} aria-hidden="true" /><Text as="h2" variant="featured-5" weight="bold">Shared Assets &amp; Files</Text></View>
              {canUpload && (
                <>
                  <input id="project-file" type="file" hidden onChange={handleFileUpload} disabled={uploading} />
                  <Button variant="outline" icon={Upload} loading={uploading} onClick={() => document.getElementById("project-file").click()}>Upload File</Button>
                </>
              )}
            </View>
            <Card padding={4}>
              {project.files?.length === 0 ? (
                <View padding={4} align="center"><Text variant="body-2" color="neutral-faded">No files uploaded yet.</Text></View>
              ) : (
                <View gap={3} divided>
                  {project.files?.map((file) => (
                    <View key={file.id} direction="row" align="center" justify="space-between" gap={3}>
                      <View attributes={{ style: { minWidth: 0 } }}>
                        <Text variant="body-2" weight="medium" maxLines={1}>{file.file_name}</Text>
                        <Text variant="caption-1" color="neutral-faded">Uploaded by {file.uploader?.name || "Member"}</Text>
                      </View>
                      <View direction="row" gap={1} shrink={false}>
                        <Button variant="ghost" size="small" icon={Download} href={`${backendUrl}/storage/${file.file_path}`} attributes={{ target: "_blank", rel: "noreferrer", "aria-label": "Download", title: "Download" }} />
                        {(canManage || currentUser?.id === file.uploaded_by) && (
                          <Button variant="ghost" size="small" color="critical" icon={Trash2} onClick={() => handleDeleteFile(file.id)} attributes={{ "aria-label": "Delete file", title: "Delete" }} />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </View>

          <View gap={4}>
            <Text as="h2" variant="featured-5" weight="bold">Feedback &amp; Community Discussion</Text>
            {project.feedback?.length === 0 ? (
              <EmptyState title="No discussions yet" description="Be the first to leave feedback!" />
            ) : (
              project.feedback?.map((fb) => (
                <Card key={fb.id} padding={4}>
                  <View gap={2}>
                    <View direction="row" justify="space-between" align="center">
                      <Text variant="body-2" weight="bold">{fb.user?.name || "Anonymous"}</Text>
                      {(canManage || currentUser?.id === fb.user_id) && (
                        <Button variant="ghost" size="small" color="critical" icon={Trash2} onClick={() => handleDeleteFeedback(fb.id)} attributes={{ "aria-label": "Delete feedback" }} />
                      )}
                    </View>
                    <Text variant="body-2" color="neutral-faded" attributes={{ style: { whiteSpace: "pre-line" } }}>{fb.comments}</Text>
                  </View>
                </Card>
              ))
            )}
            <form onSubmit={handleAddFeedback}>
              <View gap={3}>
                <TextArea name="feedback" placeholder="Leave technical feedback or ask a project question..." value={feedbackText} onChange={({ value }) => setFeedbackText(value)} inputAttributes={{ rows: 3, required: true, "aria-label": "Feedback" }} />
                <View direction="row"><Button type="submit" color="primary" icon={Send} loading={postingFeedback}>Post Comment</Button></View>
              </View>
            </form>
          </View>
        </View>

        <View gap={4}>
          <View direction="row" align="center" gap={2}><Users size={20} aria-hidden="true" /><Text as="h2" variant="featured-5" weight="bold">Workspace Team</Text></View>
          <Card padding={4}>
            <View gap={3} divided>
              {project.members?.map((member) => {
                const isProjectOwner = member.id === project.owner_id;
                return (
                  <View key={member.id} direction="row" align="center" justify="space-between" gap={2}>
                    <View gap={1} grow attributes={{ style: { minWidth: 0 } }}>
                      <View direction="row" align="center" gap={1}>
                        <Text variant="body-2" weight="medium" maxLines={1}>{member.name}</Text>
                        {isProjectOwner && <Shield size={14} color="var(--rs-color-foreground-warning)" aria-label="Project Owner" />}
                      </View>
                      {canManage && !isProjectOwner ? (
                        <View direction="row" align="center" gap={1}>
                          <NativeSelect
                            name={`role-${member.id}`}
                            size="small"
                            value={member.pivot?.role_in_project || "Collaborator"}
                            disabled={updatingRoleId === member.id}
                            onChange={({ value }) => handleRoleChange(member.id, value)}
                            inputAttributes={{ "aria-label": `Role for ${member.name}` }}
                            options={roleOptions}
                          />
                          {updatingRoleId === member.id && <Loader size="small" />}
                        </View>
                      ) : (
                        <Text variant="caption-1" color="neutral-faded">{isProjectOwner ? "Owner" : member.pivot?.role_in_project || "Collaborator"}</Text>
                      )}
                    </View>
                    {canManage && !isProjectOwner && (
                      <Button variant="ghost" size="small" color="critical" icon={UserX} onClick={() => handleRemoveMember(member.id)} attributes={{ "aria-label": `Remove ${member.name}`, title: "Remove Member" }} />
                    )}
                  </View>
                );
              })}
            </View>
          </Card>
        </View>
      </Grid>
    </Page>
  );
}
