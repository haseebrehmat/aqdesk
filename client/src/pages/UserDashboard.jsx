import { useEffect, useState } from "react";
import { Button, Card, Badge, Grid, Skeleton, Text, View } from "reshaped";
import { Page } from "../components/ui";
import { routerLink } from "../components/RouterLink";
import { Answers, ArrowRight, Briefcase, MessageSquare, Profile, Workspaces } from "../components/icons";
import api from "../api/axios";

const links = [
  { to: "/projects", icon: Workspaces, title: "Workspaces", text: "Collaborate on team project files and share feedback.", cta: "View projects" },
  { to: "/dashboard/questions", icon: MessageSquare, title: "Community Q&A", text: "Ask technical questions and share solutions with peers.", cta: "Browse discussions" },
  { to: "/dashboard/opportunities", icon: Briefcase, title: "Opportunities", text: "Explore verified internships, jobs, and academic openings.", cta: "View listings" },
  { to: "/profile", icon: Profile, title: "Profile Settings", text: "Update your personal bio, developer skills, and tags.", cta: "Edit profile" },
];

const emptySummary = {
  stats: { workspaces: 0, questions: 0, answers: 0, applications: 0 },
  activity: [],
};

const statCards = [
  { key: "workspaces", label: "Workspaces", icon: Workspaces },
  { key: "questions", label: "Questions", icon: MessageSquare },
  { key: "answers", label: "Answers", icon: Answers },
  { key: "applications", label: "Applications", icon: Briefcase },
];

export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [summary, setSummary] = useState(emptySummary);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary")
      .then(({ data }) => setSummary(data))
      .catch(() => setSummary(emptySummary))
      .finally(() => setLoadingSummary(false));
  }, []);

  const isAll = summary.scope === "all";
  const activityMax = Math.max(
    1,
    ...summary.activity.map((month) => month.questions + month.answers),
  );

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

      <View gap={4}>
        <Text as="h2" variant="featured-4" weight="bold">{isAll ? "Platform activity" : "Your activity"}</Text>
        <Grid columns={{ s: 2, l: 4 }} gap={4}>
          {statCards.map(({ key, label, icon: Icon }) => (
            <Card key={key} padding={5}>
              <View direction="row" align="center" justify="space-between" gap={3}>
                <View>
                  {loadingSummary ? <Skeleton width="48px" height={7} /> : <Text variant="featured-3" weight="bold">{summary.stats[key]}</Text>}
                  <Text variant="caption-1" color="neutral-faded">{label}</Text>
                </View>
                <View width="44px" height="44px" borderRadius="medium" backgroundColor="primary-faded" align="center" justify="center">
                  <Icon size={24} filled color="var(--rs-color-foreground-primary)" aria-hidden="true" />
                </View>
              </View>
            </Card>
          ))}
        </Grid>

        <Card padding={6}>
          <View gap={5}>
            <View direction={{ s: "column", m: "row" }} justify="space-between" gap={2}>
              <View>
                <Text as="h3" variant="featured-5" weight="bold">Six-month contribution trend</Text>
                <Text variant="body-2" color="neutral-faded">{isAll ? "Questions and answers from all users each month." : "Questions and answers you contributed each month."}</Text>
              </View>
              <View direction="row" gap={4}>
                <Text variant="caption-1"><span style={{ color: "var(--rs-color-foreground-primary)" }}>●</span> Questions</Text>
                <Text variant="caption-1"><span style={{ color: "var(--rs-color-foreground-positive)" }}>●</span> Answers</Text>
              </View>
            </View>

            {loadingSummary ? (
              <Skeleton height={28} />
            ) : (
              <View gap={3} attributes={{ role: "img", "aria-label": "Questions and answers contributed over the last six months" }}>
                {summary.activity.map((month) => (
                  <View key={month.label} direction="row" align="center" gap={3}>
                    <View width="40px"><Text variant="caption-1" color="neutral-faded">{month.label}</Text></View>
                    <View grow direction="row" height="18px" borderRadius="medium" backgroundColor="neutral-faded" attributes={{ style: { overflow: "hidden" } }}>
                      <View
                        height="100%"
                        backgroundColor="primary"
                        attributes={{
                          title: `${month.questions} questions`,
                          style: { width: `${(month.questions / activityMax) * 100}%`, minWidth: month.questions ? 4 : 0 },
                        }}
                      />
                      <View
                        height="100%"
                        backgroundColor="positive"
                        attributes={{
                          title: `${month.answers} answers`,
                          style: { width: `${(month.answers / activityMax) * 100}%`, minWidth: month.answers ? 4 : 0 },
                        }}
                      />
                    </View>
                    <View width="28px"><Text variant="caption-1" weight="bold">{month.questions + month.answers}</Text></View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Card>
      </View>

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
