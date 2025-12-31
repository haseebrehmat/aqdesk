import { useState, useEffect } from 'react';
import { Badge, Button, Card, Grid, Loader, Text, TextField, View } from 'reshaped';
import { Building2, MapPin, Search, ArrowUpRight } from '../components/icons';
import api from '../api/axios';
import { Page, PageHeader, EmptyState } from '../components/ui';
import { routerLink } from '../components/RouterLink';

export default function PublicOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/opportunities')
      .then(res => setOpportunities(res.data.data || res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = opportunities.filter(opp =>
    opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Page width="1000px">
      <PageHeader title="Tech Opportunities & Gigs" description="Explore verified remote and on-site software engineering roles." />

      <TextField
        name="search"
        icon={Search}
        size="large"
        placeholder="Search by job title, company name, or tech stack..."
        value={searchTerm}
        onChange={({ value }) => setSearchTerm(value)}
        inputAttributes={{ type: 'search', 'aria-label': 'Search opportunities' }}
      />

      {loading ? (
        <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading listings...</Text></View>
      ) : filtered.length === 0 ? (
        <EmptyState title="No opportunities currently available" description="Check back soon." />
      ) : (
        <Grid columns={{ s: 1, m: 2 }} gap={5}>
          {filtered.map((opp) => (
            <Card key={opp.id} padding={5}>
              <View gap={4} height="100%" justify="space-between">
                <View gap={3}>
                  <View direction="row" justify="space-between" align="center">
                    <Badge color="positive" variant="faded">{opp.job_type}</Badge>
                    <View direction="row" align="center" gap={1}><MapPin size={14} aria-hidden="true" /><Text variant="caption-1" color="neutral-faded">{opp.location || 'Remote'}</Text></View>
                  </View>
                  <View gap={1}>
                    <Text as="h2" variant="featured-5" weight="bold">{opp.title}</Text>
                    <View direction="row" align="center" gap={1}><Building2 size={14} aria-hidden="true" /><Text variant="body-2" weight="medium">{opp.company_name}</Text></View>
                  </View>
                  <Text variant="body-2" color="neutral-faded" maxLines={3}>{opp.description}</Text>
                </View>
                <View direction="row" justify="space-between" align="center" borderTop paddingTop={3}>
                  <Text variant="caption-1" color="neutral-faded">Posted by {opp.employer?.name || 'Recruiter'}</Text>
                  <Button variant="ghost" color="primary" size="small" endIcon={ArrowUpRight} {...routerLink(`/opportunities/${opp.id}`)}>View details &amp; apply</Button>
                </View>
              </View>
            </Card>
          ))}
        </Grid>
      )}
    </Page>
  );
}
