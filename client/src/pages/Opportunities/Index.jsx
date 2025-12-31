import { useState, useEffect } from 'react';
import { Badge, Button, Card, Grid, Loader, Text, TextField, View } from 'reshaped';
import opportunityService from '../../services/opportunityService';
import { MapPin, Search, PlusCircle, Building2 } from 'lucide-react';
import { Page, PageHeader, EmptyState, NativeSelect } from '../../components/ui';
import { routerLink } from '../../components/RouterLink';

export default function OpportunityList() {
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await opportunityService.getOpportunities({ search, job_type: jobType });
      setOpportunities(response.data.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [search, jobType]);

  const roleName = user?.role?.role_name?.toLowerCase() || '';
  const canPost = roleName === 'expert' || roleName === 'admin';

  return (
    <Page>
      <PageHeader
        title="Job Opportunities"
        description="Browse openings and track applications."
        actions={canPost && (
          <Button color="primary" icon={PlusCircle} {...routerLink('/dashboard/opportunities/create')}>Post Opportunity</Button>
        )}
      />

      <View direction={{ s: 'column', m: 'row' }} gap={3}>
        <View grow>
          <TextField
            name="search"
            icon={Search}
            placeholder="Search by title, company, or location..."
            value={search}
            onChange={({ value }) => setSearch(value)}
            inputAttributes={{ type: 'search', 'aria-label': 'Search opportunities' }}
          />
        </View>
        <View width={{ s: '100%', m: '220px' }}>
          <NativeSelect
            name="job_type"
            value={jobType}
            onChange={({ value }) => setJobType(value)}
            inputAttributes={{ 'aria-label': 'Filter by job type' }}
            options={[
              { value: '', label: 'All Job Types' },
              { value: 'Full-Time', label: 'Full-Time' },
              { value: 'Internship', label: 'Internship' },
              { value: 'Contract', label: 'Contract' },
            ]}
          />
        </View>
      </View>

      {loading ? (
        <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading opportunities...</Text></View>
      ) : opportunities.length === 0 ? (
        <EmptyState title="No opportunities found." description="Try adjusting your search criteria." />
      ) : (
        <Grid columns={{ s: 1, m: 2, l: 3 }} gap={5}>
          {opportunities.map((opp) => (
            <Card key={opp.id} padding={5}>
              <View gap={4} height="100%" justify="space-between">
                <View gap={3}>
                  <View direction="row" justify="space-between" align="center">
                    <Badge color="primary" variant="faded">{opp.job_type}</Badge>
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
