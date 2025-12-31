import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, View } from 'reshaped';
import opportunityService from '../../services/opportunityService';
import { Page, PageHeader, FormField } from '../../components/ui';
import { routerLink } from '../../components/RouterLink';

export default function OpportunityForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: 'Full-Time',
    description: '',
    application_deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await opportunityService.createOpportunity(formData);
      navigate('/dashboard/opportunities');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create opportunity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page width="800px">
      <PageHeader title="Post a New Opportunity" />
      {error && <Alert color="critical" attributes={{ role: 'alert' }}>{error}</Alert>}
      <Card padding={6}>
        <form onSubmit={handleSubmit}>
          <View gap={4}>
            <FormField label="Job Title" name="title" required placeholder="e.g. Senior Full Stack Developer" value={formData.title} onChange={set('title')} />
            <View direction={{ s: 'column', m: 'row' }} gap={4}>
              <View grow><FormField label="Company Name" name="company_name" required placeholder="e.g. Acme Corp" value={formData.company_name} onChange={set('company_name')} /></View>
              <View grow><FormField label="Location" name="location" placeholder="e.g. Lahore / Remote" value={formData.location} onChange={set('location')} /></View>
            </View>
            <View direction={{ s: 'column', m: 'row' }} gap={4}>
              <View grow><FormField label="Application Deadline" name="application_deadline" type="datetime-local" value={formData.application_deadline} onChange={set('application_deadline')} /></View>
              <View grow>
                <FormField
                  label="Job Type"
                  name="job_type"
                  value={formData.job_type}
                  onChange={set('job_type')}
                  options={['Full-Time', 'Internship', 'Contract'].map((v) => ({ value: v, label: v }))}
                />
              </View>
            </View>
            <Alert color="warning">New listings are reviewed by an administrator before they become public.</Alert>
            <FormField label="Description" name="description" multiline rows={6} placeholder="Detailed requirements and responsibilities..." value={formData.description} onChange={set('description')} />
            <View direction="row" justify="end" gap={2}>
              <Button variant="outline" {...routerLink('/dashboard/opportunities')}>Cancel</Button>
              <Button type="submit" color="primary" loading={loading}>Post Opportunity</Button>
            </View>
          </View>
        </form>
      </Card>
    </Page>
  );
}
