import { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";
import { Badge, Button, Card, Loader, View } from "reshaped";
import { Save } from "../components/icons";
import { Page, PageHeader, FormField } from "../components/ui";

export default function Profile() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    professional_position: "",
    skills_tags: "",
    avatar_url: "",
    role: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile");
      const user = response.data;
      setProfile({
        name: user.name || "",
        email: user.email || "",
        bio: user.profile?.bio || "",
        professional_position: user.profile?.professional_position || "",
        skills_tags: user.profile?.skills_tags || "",
        avatar_url: user.profile?.avatar_url || "",
        role: user.role || {},
      });
    } catch {
      addToast("Failed to load profile details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put("/profile", {
        name: profile.name,
        bio: profile.bio,
        professional_position: profile.professional_position,
        skills_tags: profile.skills_tags,
        avatar_url: profile.avatar_url,
      });
      addToast("Profile details updated successfully.", "success");
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View align="center" padding={12}><Loader /></View>;

  const set = (key) => (value) => setProfile((prev) => ({ ...prev, [key]: value }));

  return (
    <Page width="760px">
      <PageHeader
        title="User Profile"
        description="Manage your identity and metadata"
        actions={<Badge color="primary" variant="faded">{profile.role?.role_name || profile.role?.name || "Member"}</Badge>}
      />
      <Card padding={6}>
        <form onSubmit={handleSubmit}>
          <View gap={5}>
            <FormField label="Full Name" name="name" value={profile.name} onChange={set("name")} />
            <View gap={1}>
              <FormField label="Email (Read Only)" name="email" type="email" readOnly value={profile.email} onChange={() => {}} helper="Your email address cannot be changed here." />
            </View>
            <FormField label="Current Professional Position" name="professional_position" placeholder="e.g. Software Engineering Student" value={profile.professional_position} onChange={set("professional_position")} />
            <FormField label="Bio / Overview" name="bio" multiline rows={5} placeholder="Tell the community about your technical background..." value={profile.bio} onChange={set("bio")} />
            <FormField label="Skill Tags (Comma separated)" name="skills_tags" placeholder="React, Laravel, MySQL" value={profile.skills_tags} onChange={set("skills_tags")} />
            <Button type="submit" color="primary" size="large" fullWidth icon={Save} loading={saving}>Save Changes</Button>
          </View>
        </form>
      </Card>
    </Page>
  );
}
