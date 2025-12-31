import { useState, useEffect, useMemo } from 'react';
import { Badge, Button, Card, Grid, Loader, Text, TextField, View } from 'reshaped';
import { Folder, FileText, MessageSquare, Users, Search } from '../components/icons';
import api from '../api/axios';
import { Page, PageHeader, EmptyState } from '../components/ui';
import { routerLink } from '../components/RouterLink';

export default function PublicWorkspaces() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/public/projects')
      .then((res) => setProjects(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((p) => !term || [p.title, p.description, p.owner?.name].some((v) => v?.toLowerCase().includes(term)));
  }, [projects, search]);

  return (
    <Page width="1100px">
      <PageHeader title="Open Workspaces" description="Browse public projects. Sign in to upload files and share feedback." />
      <TextField
        name="search"
        icon={Search}
        placeholder="Search workspaces..."
        value={search}
        onChange={({ value }) => setSearch(value)}
        inputAttributes={{ type: 'search', 'aria-label': 'Search workspaces' }}
      />
      {loading ? (
        <View align="center" padding={12}><Loader /></View>
      ) : filtered.length === 0 ? (
        <EmptyState title="No public workspaces found" description="Public workspaces will appear here." />
      ) : (
        <Grid columns={{ s: 1, m: 2, l: 3 }} gap={5}>
          {filtered.map((project) => (
            <Card key={project.id} padding={5}>
              <View gap={4} height="100%" justify="space-between">
                <View gap={3}>
                  <View direction="row"><Badge variant="faded" color="positive">Public</Badge></View>
                  <View direction="row" align="center" gap={2}>
                    <Folder size={18} aria-hidden="true" />
                    <Text as="h2" variant="body-1" weight="bold">{project.title}</Text>
                  </View>
                  <Text variant="body-2" color="neutral-faded" maxLines={2}>{project.description || 'No description provided.'}</Text>
                </View>
                <View gap={3}>
                  <View direction="row" justify="space-between" align="center" borderTop paddingTop={3}>
                    <Text variant="caption-1" color="neutral-faded">By {project.owner?.name || 'Anonymous'}</Text>
                    <View direction="row" gap={3}>
                      {[[FileText, project.files_count ?? 0, 'files'], [MessageSquare, project.feedback_count ?? 0, 'comments'], [Users, project.members?.length ?? 1, 'members']].map(([Icon, n, label]) => (
                        <View key={label} direction="row" align="center" gap={1} attributes={{ title: label, 'aria-label': `${n} ${label}` }}>
                          <Icon size={14} aria-hidden="true" /><Text variant="caption-1" color="neutral-faded">{n}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Button variant="faded" color="primary" fullWidth {...routerLink(`/workspaces/${project.id}`)}>View &amp; Contribute</Button>
                </View>
              </View>
            </Card>
          ))}
        </Grid>
      )}
    </Page>
  );
}
