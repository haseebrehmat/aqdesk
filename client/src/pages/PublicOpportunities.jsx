import { useState, useEffect, useMemo } from 'react';
import { Badge, Button, Card, Checkbox, Grid, Loader, Text, TextField, View } from 'reshaped';
import { Building2, MapPin, Search, ArrowUpRight } from '../components/icons';
import api from '../api/axios';
import { Page, PageHeader, EmptyState, NativeSelect } from '../components/ui';
import { routerLink } from '../components/RouterLink';

const DAY = 24 * 60 * 60 * 1000;
const initialFilters = { search: '', jobType: '', location: '', posted: '', sort: 'newest', openOnly: false };

const sorters = {
  newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
  deadline: (a, b) => (new Date(a.application_deadline || 8.64e15)) - (new Date(b.application_deadline || 8.64e15)),
  title: (a, b) => (a.title || '').localeCompare(b.title || ''),
};

export default function PublicOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [now] = useState(() => Date.now());
  const set = (key) => (value) => setFilters((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    api.get('/opportunities')
      .then(res => setOpportunities(res.data.data || res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const unique = (key) => [...new Set(opportunities.map((o) => o[key]).filter(Boolean))].sort();
  const jobTypes = useMemo(() => unique('job_type'), [opportunities]);
  const locations = useMemo(() => unique('location'), [opportunities]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return opportunities
      .filter((opp) => {
        if (term && ![opp.title, opp.company_name, opp.description, opp.location].some((v) => v?.toLowerCase().includes(term))) return false;
        if (filters.jobType && opp.job_type !== filters.jobType) return false;
        if (filters.location && opp.location !== filters.location) return false;
        if (filters.posted && now - new Date(opp.created_at).getTime() > Number(filters.posted) * DAY) return false;
        if (filters.openOnly && opp.accepts_applications === false) return false;
        return true;
      })
      .sort(sorters[filters.sort]);
  }, [opportunities, filters, now]);

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(initialFilters);
  const withAll = (label, values) => [{ value: '', label }, ...values.map((v) => ({ value: v, label: v }))];

  return (
    <Page width="1100px">
      <PageHeader title="Tech Opportunities & Gigs" description="Explore verified remote and on-site software engineering roles." />

      <Card padding={5}>
        <View gap={4}>
          <TextField
            name="search"
            icon={Search}
            size="large"
            placeholder="Search by job title, company, location, or keyword..."
            value={filters.search}
            onChange={({ value }) => set('search')(value)}
            inputAttributes={{ type: 'search', 'aria-label': 'Search opportunities' }}
          />
          <Grid columns={{ s: 1, m: 2, l: 4 }} gap={3}>
            <NativeSelect name="jobType" value={filters.jobType} onChange={({ value }) => set('jobType')(value)} inputAttributes={{ 'aria-label': 'Job type' }} options={withAll('All job types', jobTypes)} />
            <NativeSelect name="location" value={filters.location} onChange={({ value }) => set('location')(value)} inputAttributes={{ 'aria-label': 'Location' }} options={withAll('All locations', locations)} />
            <NativeSelect
              name="posted"
              value={filters.posted}
              onChange={({ value }) => set('posted')(value)}
              inputAttributes={{ 'aria-label': 'Date posted' }}
              options={[{ value: '', label: 'Any time' }, { value: '1', label: 'Past 24 hours' }, { value: '7', label: 'Past week' }, { value: '30', label: 'Past month' }]}
            />
            <NativeSelect
              name="sort"
              value={filters.sort}
              onChange={({ value }) => set('sort')(value)}
              inputAttributes={{ 'aria-label': 'Sort by' }}
              options={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }, { value: 'deadline', label: 'Deadline soonest' }, { value: 'title', label: 'Title A–Z' }]}
            />
          </Grid>
          <View direction="row" align="center" justify="space-between" gap={3} wrap>
            <Checkbox name="openOnly" checked={filters.openOnly} onChange={({ checked }) => set('openOnly')(checked)}>Accepting applications only</Checkbox>
            <View direction="row" align="center" gap={3}>
              <Text variant="caption-1" color="neutral-faded" attributes={{ role: 'status' }}>{filtered.length} of {opportunities.length} opportunities</Text>
              {isFiltered && <Button variant="ghost" size="small" onClick={() => setFilters(initialFilters)}>Clear filters</Button>}
            </View>
          </View>
        </View>
      </Card>

      {loading ? (
        <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading listings...</Text></View>
      ) : filtered.length === 0 ? (
        <EmptyState title="No opportunities match your filters" description="Try changing or clearing the filters." />
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
