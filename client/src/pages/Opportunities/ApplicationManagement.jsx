import { useState, useEffect } from 'react';
import { Badge, Card, Grid, Loader, Text, View } from 'reshaped';
import { Building2, Calendar } from '../../components/icons';
import opportunityService from '../../services/opportunityService';
import { Page, PageHeader, EmptyState } from '../../components/ui'
import { formatDate } from '../../utils/format';

import ResumeButton from '../../components/ResumeModal';

export default function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await opportunityService.getApplications();
      setApplications(response.data.data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading applications...</Text></View>;

  return (
    <Page>
      <PageHeader title="Applications Dashboard" description="Track applications you submit or receive." />

      {applications.length === 0 ? (
        <EmptyState title="No applications found." description="Applications you submit or receive will appear here." />
      ) : (
        <Grid columns={{ s: 1, m: 2, l: 3 }} gap={5}>
          {applications.map((app) => (
            <Card key={app.id} padding={5}>
              <View gap={4} height="100%" justify="space-between">
                <View gap={3}>
                  <View direction="row" justify="space-between" align="center">
                    <Badge color="primary" variant="faded">{app.status}</Badge>
                    <View direction="row" align="center" gap={1}><Calendar size={14} aria-hidden="true" /><Text variant="caption-1" color="neutral-faded">{formatDate(app.created_at)}</Text></View>
                  </View>
                  <Text as="h2" variant="featured-5" weight="bold">{app.opportunity?.title || 'N/A'}</Text>
                  {(app.applicant_name || app.applicant?.name) && <Text variant="caption-1" color="neutral-faded">Applicant: {app.applicant_name || app.applicant?.name} ({app.applicant_email || app.applicant?.email})</Text>}
                  <View direction="row" align="center" gap={1}><Building2 size={14} aria-hidden="true" /><Text variant="body-2">{app.opportunity?.company_name || 'N/A'}</Text></View>
                </View>
                <View borderTop paddingTop={3} direction="row">
                  <ResumeButton application={app} />
                </View>
              </View>
            </Card>
          ))}
        </Grid>
      )}
    </Page>
  );
}
