import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Text, View } from 'reshaped';
import api from '../api/axios';
import { useToast } from '../components/ToastContainer';
import { Page, PageHeader, FormField, EmptyState } from '../components/ui'
import { formatDate } from '../utils/format';

const cohorts = ['All', 'General', 'AI', 'Web Development', 'EdTech', 'Internet Governance'];

export default function NewsletterAdmin() {
  const { addToast } = useToast();
  const [subscribers, setSubscribers] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  const [cohort, setCohort] = useState('All');
  const [campaigns, setCampaigns] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/newsletter/subscribers').then(({ data }) => setSubscribers(data.data || []));
    api.get('/admin/newsletter/campaigns').then(({ data }) => setCampaigns(data));
  }, []);

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      addToast(error.response?.data?.message || 'Request failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const sendCampaign = (event) => {
    event.preventDefault();
    run(async () => {
      const { data } = await api.post('/admin/newsletter/campaigns', { subject, body, cohort });
      setCampaigns((items) => [data.campaign, ...items]);
      setMessage(`${data.message} ${data.queued_recipients} recipient(s).`);
      setSubject('');
      setBody('');
    });
  };

  const saveDraft = () => run(async () => {
    const { data } = await api.post('/admin/newsletter/campaigns/drafts', { subject, body, cohort });
    setCampaigns((items) => [data.campaign, ...items]);
    setMessage(data.message);
  });

  const sendDraft = (campaignId) => run(async () => {
    const { data } = await api.post(`/admin/newsletter/campaigns/${campaignId}/send`);
    setCampaigns((items) => items.map((item) => item.id === campaignId ? data.campaign : item));
    setMessage(`${data.message} ${data.queued_recipients} recipient(s).`);
  });

  return (
    <Page width="900px">
      <PageHeader
        title="Newsletter Campaigns"
        description={`Send community updates to ${subscribers.filter((item) => item.is_active).length} active subscriber(s).`}
      />

      <Card padding={6}>
        <form onSubmit={sendCampaign}>
          <View gap={4}>
            <FormField label="Recipient cohort" name="cohort" value={cohort} onChange={setCohort} options={cohorts.map((v) => ({ value: v, label: v }))} />
            <FormField label="Subject" name="subject" required value={subject} onChange={setSubject} />
            <FormField label="Message" name="body" multiline rows={8} required value={body} onChange={setBody} />
            <View direction="row" gap={3} wrap>
              <Button variant="outline" onClick={saveDraft} disabled={busy}>Save Draft</Button>
              <Button type="submit" color="primary" loading={busy}>Queue Campaign</Button>
            </View>
            {message && <Alert color="positive" attributes={{ role: 'status' }}>{message}</Alert>}
          </View>
        </form>
      </Card>

      <View gap={3}>
        <Text as="h2" variant="featured-5" weight="bold">Saved Campaigns</Text>
        {campaigns.length === 0 ? (
          <EmptyState title="No saved campaigns." />
        ) : campaigns.map((campaign) => (
          <Card key={campaign.id} padding={4}>
            <View direction={{ s: 'column', m: 'row' }} justify="space-between" align={{ s: 'start', m: 'center' }} gap={3}>
              <View gap={1}>
                <Text weight="bold">{campaign.subject}</Text>
                <View direction="row" gap={2} align="center">
                  <Badge variant="faded">{campaign.cohort}</Badge>
                  <Badge variant="faded" color={campaign.status === 'Draft' ? 'neutral' : 'positive'}>{campaign.status}</Badge>
                  {campaign.sent_at && <Text variant="caption-1" color="neutral-faded">{formatDate(campaign.sent_at, { dateStyle: 'medium', timeStyle: 'short' })}</Text>}
                </View>
              </View>
              {campaign.status === 'Draft' && <Button color="primary" onClick={() => sendDraft(campaign.id)} disabled={busy}>Send Draft</Button>}
            </View>
          </Card>
        ))}
      </View>
    </Page>
  );
}
