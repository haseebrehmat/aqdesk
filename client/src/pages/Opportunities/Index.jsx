import { useState, useEffect, useMemo } from 'react';
import { Badge, Button, Card, Grid, Loader, Text, TextField, View } from 'reshaped';
import opportunityService from '../../services/opportunityService';
import { MapPin, Search, PlusCircle, Building2 } from '../../components/icons';
import { Page, PageHeader, EmptyState, NativeSelect } from '../../components/ui';
import { routerLink } from '../../components/RouterLink';
import { STATUS_COLORS, statusLabel } from '../../utils/opportunity';

const initialFilters = { search: '', jobType: '', location: '', status: '' };

export default function OpportunityList() {
  const [opportunities, setOpportunities] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const set = (key) => (value) => setFilters((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    opportunityService.getOpportunities()
      .then((response) => setOpportunities(response.data.data || []))
      .catch((error) => console.error('Error fetching opportunities:', error))
      .finally(() => setLoading(false));
  }, []);

  const roleName = user?.role?.role_name?.toLowerCase() || '';
  const canPost = roleName === 'expert' || roleName === 'admin';

  const options = (key, label) => [
    { value: '', label },
    ...[...new Set(opportunities.map((o) => o[key]).filter(Boolean))].sort().map((v) => ({ value: v, label: key === 'status' ? statusLabel(v) : v })),
  ];

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return opportunities.filter((opp) => {
      if (term && ![opp.title, opp.company_name, opp.location, opp.description].some((v) => v?.toLowerCase().includes(term))) return false;
      if (filters.jobType && opp.job_type !== filters.jobType) return false;
      if (filters.location && opp.location !== filters.location) return false;
      if (filters.status && opp.status !== filters.status) return false;
      return true;
    });
  }, [opportunities, filters]);

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(initialFilters);

  return (
    <Page>
      <PageHeader
        title="Job Opportunities"
        description="Browse openings and track applications."
        actions={canPost && (
          <Button color="primary" icon={PlusCircle} {...routerLink('/dashboard/opportunities/create')}>Post Opportunity</Button>
        )}
      />

      <View gap={3}>
        <TextField
          name="search"
          icon={Search}
          placeholder="Search by title, company, or location..."
          value={filters.search}
          onChange={({ value }) => set('search')(value)}
          inputAttributes={{ type: 'search', 'aria-label': 'Search opportunities' }}
        />
        <Grid columns={{ s: 1, m: 3 }} gap={3}>
          <NativeSelect name="job_type" value={filters.jobType} onChange={({ value }) => set('jobType')(value)} inputAttributes={{ 'aria-label': 'Filter by job type' }} options={options('job_type', 'All Job Types')} />
          <NativeSelect name="location" value={filters.location} onChange={({ value }) => set('location')(value)} inputAttributes={{ 'aria-label': 'Filter by location' }} options={options('location', 'All Locations')} />
          <NativeSelect name="status" value={filters.status} onChange={({ value }) => set('status')(value)} inputAttributes={{ 'aria-label': 'Filter by status' }} options={options('status', 'All Statuses')} />
        </Grid>
        <View direction="row" align="center" gap={3}>
          <Text variant="caption-1" color="neutral-faded" attributes={{ role: 'status' }}>{filtered.length} of {opportunities.length} opportunities</Text>
          {isFiltered && <Button variant="ghost" size="small" onClick={() => setFilters(initialFilters)}>Clear filters</Button>}
        </View>
      </View>

      {loading ? (
        <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading opportunities...</Text></View>
      ) : filtered.length === 0 ? (
        <EmptyState title="No opportunities found." description="Try adjusting your search criteria." />
      ) : (
        <Grid columns={{ s: 1, m: 2, l: 3 }} gap={5}>
          {filtered.map((opp) => (
            <Card key={opp.id} padding={5}>
              <View gap={4} height="100%" justify="space-between">
                <View gap={3}>
                  <View direction="row" justify="space-between" align="center">
                    <View direction="row" gap={2}>
                      <Badge color="primary" variant="faded">{opp.job_type}</Badge>
                      {opp.status !== 'Published' && <Badge color={STATUS_COLORS[opp.status] || 'neutral'} variant="faded">{statusLabel(opp.status)}</Badge>}
                    </View>
                    <View direction="row" align="center" gap={1}><MapPin size={14} aria-hidden="true" /><Text variant="caption-1" color="neutral-faded">{opp.location || 'Remote'}</Text></View>
                  </View>
                  <Text as="h2" variant="featured-5" weight="bold">{opp.title}</Text>
                  <View direction="row" align="center" gap={1}><Building2 size={14} aria-hidden="true" /><Text variant="body-2" weight="medium">{opp.company_name}</Text></View>
                  <Text variant="body-2" color="neutral-faded" maxLines={3}>{opp.description}</Text>
                </View>
                <Button variant="faded" color="primary" fullWidth {...routerLink(`/dashboard/opportunities/${opp.id}`)}>
                  {canPost ? 'View Details & Manage' : 'View Details & Apply'}
                </Button>
              </View>
            </Card>
          ))}
        </Grid>
      )}
    </Page>
  );
}
