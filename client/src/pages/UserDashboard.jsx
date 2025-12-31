import { Button, Card, Badge, Grid, Text, View } from "reshaped";
import { Page } from "../components/ui";
import { routerLink } from "../components/RouterLink";
import { ArrowRight, Briefcase, MessageSquare, Profile, Workspaces } from "../components/icons";

const links = [
  { to: "/projects", icon: Workspaces, title: "Workspaces", text: "Collaborate on team project files and share feedback.", cta: "View projects" },
  { to: "/dashboard/questions", icon: MessageSquare, title: "Community Q&A", text: "Ask technical questions and share solutions with peers.", cta: "Browse discussions" },
  { to: "/dashboard/opportunities", icon: Briefcase, title: "Opportunities", text: "Explore verified internships, jobs, and academic openings.", cta: "View listings" },
  { to: "/profile", icon: Profile, title: "Profile Settings", text: "Update your personal bio, developer skills, and tags.", cta: "Edit profile" },
];

export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <Page>
      <Card padding={8}>
        <View gap={2}>
          <View direction="row"><Badge color="primary" variant="faded">{user?.role?.role_name || "Standard User"}</Badge></View>
          <Text as="h1" variant="featured-2" weight="bold">Welcome back, {user?.name || "Collaborator"}!</Text>
          <Text color="neutral-faded">
            Here is your activity hub. Manage your workspaces, explore community questions, and track career opportunities.
          </Text>
        </View>
      </Card>

      <Grid columns={{ s: 1, m: 2, l: 4 }} gap={5}>
        {links.map(({ to, icon: Icon, title, text, cta }) => (
          <Card key={to} padding={6} height="100%">
            <View gap={4} height="100%" justify="space-between">
              <View gap={3}>
                <View width="40px" height="40px" borderRadius="medium" backgroundColor="primary-faded" align="center" justify="center">
                  <Icon size={20} filled color="var(--rs-color-foreground-primary)" aria-hidden="true" />
                </View>
                <Text as="h2" variant="featured-5" weight="bold">{title}</Text>
                <Text variant="body-2" color="neutral-faded">{text}</Text>
              </View>
              <View direction="row">
                <Button variant="ghost" color="primary" endIcon={ArrowRight} {...routerLink(to)}>{cta}</Button>
              </View>
            </View>
          </Card>
        ))}
      </Grid>
    </Page>
  );
}
