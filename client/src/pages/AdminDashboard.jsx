import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Loader, Modal, Table, Text, TextField, View } from "reshaped";
import { Plus, Trash2, Edit, Search } from "../components/icons";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import { Page, PageHeader, FormField, EmptyState } from "../components/ui";
import { routerLink } from "../components/RouterLink";

const emptyForm = { name: "", email: "", password: "", role_id: "", is_active: true };

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Create / edit dialog. `editing` holds the user being edited (null = creating).
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const standardRoleId = useMemo(
    () => String(roles.find((r) => r.role_name === "Standard User")?.id ?? roles[0]?.id ?? ""),
    [roles],
  );

  useEffect(() => {
    (async () => {
      try {
        const [userRes, roleRes, reportRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/roles"),
          api.get("/admin/content-reports"),
        ]);
        setUsers(userRes.data.users);
        setRoles(roleRes.data.roles);
        setReports(reportRes.data.data || []);
      } catch {
        setError("Unauthorized access or failed to fetch users. Ensure you have administrator privileges.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setFormData({ ...emptyForm, role_id: standardRoleId });
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setFormError("");
    setFormData({ ...emptyForm, name: user.name, email: user.email, role_id: String(user.role_id), is_active: !!user.is_active });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
      setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, is_active: !user.is_active } : u)));
    } catch {
      addToast("Failed to update user status.", "error");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((list) => list.filter((u) => u.id !== id));
      addToast("User deleted.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete user.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editing) {
        const { data } = await api.put(`/admin/users/${editing.id}`, {
          role_id: Number(formData.role_id),
          is_active: formData.is_active,
        });
        setUsers((list) => list.map((u) => (u.id === editing.id ? data.user : u)));
        addToast("User updated.", "success");
      } else {
        const { data } = await api.post("/admin/users", { ...formData, role_id: Number(formData.role_id) });
        setUsers((list) => [data.user, ...list]);
        addToast("User created.", "success");
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
          err.response?.data?.message ||
          "Failed to save user. Please check your inputs.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const moderateReport = async (report, action, status = "Resolved") => {
    try {
      const { data } = await api.patch(`/admin/content-reports/${report.id}`, { action, status });
      setReports((items) => items.map((item) => (item.id === report.id ? data.report : item)));
    } catch (requestError) {
      addToast(requestError.response?.data?.message || "Unable to review this report.", "error");
    }
  };

  const term = searchTerm.toLowerCase();
  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
  const pendingReports = reports.filter((r) => r.status === "Pending");
  const roleOptions = roles.map((r) => ({ value: String(r.id), label: r.role_name }));

  if (isLoading) return <View align="center" padding={12}><Loader /></View>;

  return (
    <Page>
      <PageHeader
        title="User Management"
        description="Supervise platform accounts, toggle account access, and review community reports."
        actions={
          <>
            <Button color="primary" icon={Plus} onClick={openCreate}>Create User</Button>
            <Button variant="outline" {...routerLink("/admin/settings")}>Site Settings</Button>
          </>
        }
      />

      {error && <Alert color="critical" attributes={{ role: "alert" }}>{error}</Alert>}

      <Card padding={4}>
        <View direction={{ s: "column", m: "row" }} justify="space-between" align={{ s: "stretch", m: "center" }} gap={3}>
          <View width={{ s: "100%", m: "320px" }}>
            <TextField
              name="user-search"
              icon={Search}
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={({ value }) => setSearchTerm(value)}
              inputAttributes={{ type: "search", "aria-label": "Search users" }}
            />
          </View>
          <Text variant="caption-1" color="neutral-faded">Total registered accounts: <strong>{users.length}</strong></Text>
        </View>
      </Card>

      <Card padding={0}>
        <View overflow="auto">
          <Table>
            <Table.Row>
              <Table.Heading>User</Table.Heading>
              <Table.Heading>Email</Table.Heading>
              <Table.Heading>Role</Table.Heading>
              <Table.Heading>Status</Table.Heading>
              <Table.Heading>Actions</Table.Heading>
            </Table.Row>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <Table.Row key={user.id}>
                <Table.Cell><Text weight="medium">{user.name}</Text></Table.Cell>
                <Table.Cell><Text color="neutral-faded">{user.email}</Text></Table.Cell>
                <Table.Cell><Badge variant="faded" color="primary">{user.role?.role_name || "Standard User"}</Badge></Table.Cell>
                <Table.Cell>
                  <Button
                    size="small"
                    variant="faded"
                    color={user.is_active ? "positive" : "critical"}
                    onClick={() => handleToggleStatus(user)}
                    attributes={{ title: "Click to toggle status", "aria-label": `${user.name} is ${user.is_active ? "active" : "inactive"}. Toggle status` }}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </Button>
                </Table.Cell>
                <Table.Cell>
                  <View direction="row" gap={1}>
                    <Button variant="ghost" size="small" icon={Edit} onClick={() => openEdit(user)} attributes={{ "aria-label": `Edit ${user.name}`, title: "Edit User" }} />
                    <Button variant="ghost" size="small" color="critical" icon={Trash2} onClick={() => handleDeleteUser(user.id)} attributes={{ "aria-label": `Delete ${user.name}`, title: "Delete User" }} />
                  </View>
                </Table.Cell>
              </Table.Row>
            )) : (
              <Table.Row>
                <Table.Cell colSpan={5}><View padding={6} align="center"><Text color="neutral-faded">No matching user accounts found.</Text></View></Table.Cell>
              </Table.Row>
            )}
          </Table>
        </View>
      </Card>

      <View gap={3}>
        <Text as="h2" variant="featured-5" weight="bold">Community Moderation Queue</Text>
        {pendingReports.length === 0 ? (
          <EmptyState title="No pending community reports." />
        ) : pendingReports.map((report) => (
          <Card key={report.id} padding={4}>
            <View direction={{ s: "column", m: "row" }} justify="space-between" align={{ s: "start", m: "center" }} gap={3}>
              <View gap={1}>
                <Text weight="bold" attributes={{ style: { textTransform: "capitalize" } }}>{report.reportable_type} #{report.reportable_id}</Text>
                <Text variant="body-2">{report.reason}</Text>
                <Text variant="caption-1" color="neutral-faded">Reported by {report.reporter?.name || "Unknown"}</Text>
              </View>
              <View direction="row" gap={2} wrap>
                <Button size="small" color="warning" onClick={() => moderateReport(report, "hide")}>Hide</Button>
                <Button size="small" color="critical" onClick={() => moderateReport(report, "delete")}>Delete</Button>
                <Button size="small" variant="outline" onClick={() => moderateReport(report, "none", "Dismissed")}>Dismiss</Button>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Modal active={isModalOpen} onClose={() => setIsModalOpen(false)} size="520px" padding={6}>
        <Modal.Title>{editing ? `Edit ${editing.name}` : "Create New User Account"}</Modal.Title>
        <form onSubmit={handleSubmit}>
          <View gap={4} paddingTop={4}>
            {formError && <Alert color="critical" attributes={{ role: "alert" }}>{formError}</Alert>}
            {!editing && (
              <>
                <FormField label="Full Name" name="name" required placeholder="Enter full name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
                <FormField label="Email Address" name="email" type="email" required placeholder="name@example.com" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
                <FormField label="Password" name="password" type="password" required placeholder="At least 6 characters" value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} />
              </>
            )}
            <View direction="row" gap={4}>
              <View grow><FormField label="User Role" name="role_id" value={formData.role_id} onChange={(v) => setFormData({ ...formData, role_id: v })} options={roleOptions} /></View>
              <View grow>
                <FormField
                  label="Account Status"
                  name="is_active"
                  value={formData.is_active ? "true" : "false"}
                  onChange={(v) => setFormData({ ...formData, is_active: v === "true" })}
                  options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]}
                />
              </View>
            </View>
            <View direction="row" justify="end" gap={2} borderTop paddingTop={4}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" color="primary" loading={isSubmitting}>{editing ? "Save Changes" : "Save Account"}</Button>
            </View>
          </View>
        </form>
      </Modal>
    </Page>
  );
}
