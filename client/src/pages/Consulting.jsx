import { useState, useEffect } from 'react';
import { Alert, Badge, Button, Card, Grid, Text, View } from 'reshaped';
import { UserCheck, Clock } from '../components/icons';
import api from '../api/axios';
import { Page, PageHeader, FormField, EmptyState } from '../components/ui'
import { formatDate } from '../utils/format';

const dateTime = { dateStyle: 'medium', timeStyle: 'short' };

export default function Consulting() {
  const [consultations, setConsultations] = useState([]);
  const [experts, setExperts] = useState([]);
  const [expertId, setExpertId] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [availability, setAvailability] = useState([]);
  const [availabilityStart, setAvailabilityStart] = useState('');
  const [availabilityEnd, setAvailabilityEnd] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchConsultations();
    api.get('/consultations/experts').then(({ data }) => {
      setExperts(data);
      if (data[0]) setExpertId(String(data[0].id));
    });
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isExpert = ['Expert', 'Admin'].includes(currentUser.role?.role_name);

  useEffect(() => {
    if (!expertId) return;
    api.get('/consultations/availability', { params: { expert_id: expertId } })
      .then(({ data }) => {
        setAvailability(data);
        setBookingSlot(data[0]?.starts_at || '');
      });
  }, [expertId]);

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/consultations');
      setConsultations(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to load consultations', err);
    }
  };

  const handleBookConsultation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/consultations', { expert_id: expertId, booking_slot: bookingSlot });
      setStatusMsg('Consultation request submitted successfully!');
      fetchConsultations();
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Unable to book that consultation slot.');
    }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/consultations/${id}/status`, { status });
    fetchConsultations();
  };

  const addAvailability = async (event) => {
    event.preventDefault();
    try {
      await api.post('/consultations/availability', { starts_at: availabilityStart, ends_at: availabilityEnd });
      setAvailabilityStart('');
      setAvailabilityEnd('');
      setStatusMsg('Availability added successfully.');
      if (Number(expertId) === Number(currentUser.id)) {
        const { data } = await api.get('/consultations/availability', { params: { expert_id: expertId } });
        setAvailability(data);
      }
    } catch (error) {
      setStatusMsg(error.response?.data?.message || 'Unable to add availability.');
    }
  };

  const saveProposal = async (id) => {
    const terms = window.prompt('Enter the proposal terms');
    if (!terms) return;
    const budget = window.prompt('Enter the proposed budget', '0');
    if (budget === null) return;
    await api.put(`/consultations/${id}/proposal`, { terms, budget });
    fetchConsultations();
  };

  return (
    <Page>
      <PageHeader title="Expert Consulting & Advisory" description="Book advisory sessions with verified software engineering consultants." />
      {statusMsg && <Alert color="primary" attributes={{ role: 'status' }}>{statusMsg}</Alert>}

      <Grid columns={{ s: 1, l: '1fr 1fr 2fr' }} gap={6} align="start">
        <Card padding={6}>
          <View gap={4}>
            <View direction="row" align="center" gap={2}><UserCheck size={20} aria-hidden="true" /><Text as="h2" variant="featured-5" weight="bold">Book Consultation</Text></View>
            <form onSubmit={handleBookConsultation}>
              <View gap={4}>
                <FormField label="Select Expert" name="expert" value={expertId} onChange={setExpertId} options={experts.map((e) => ({ value: String(e.id), label: e.name }))} />
                <FormField
                  label="Available Date & Time"
                  name="slot"
                  value={bookingSlot}
                  onChange={setBookingSlot}
                  options={[
                    { value: '', label: 'Select an open time' },
                    ...availability.map((slot) => ({ value: slot.starts_at, label: `${formatDate(slot.starts_at, dateTime)} - ${formatDate(slot.ends_at, { timeStyle: 'short' })}` })),
                  ]}
                />
                <Button type="submit" color="primary" fullWidth disabled={!bookingSlot}>Schedule Session</Button>
              </View>
            </form>
          </View>
        </Card>

        {isExpert ? (
          <Card padding={6}>
            <View gap={4}>
              <Text as="h2" variant="featured-5" weight="bold">Publish Availability</Text>
              <form onSubmit={addAvailability}>
                <View gap={4}>
                  <FormField label="Starts" name="availability_start" type="datetime-local" required value={availabilityStart} onChange={setAvailabilityStart} />
                  <FormField label="Ends" name="availability_end" type="datetime-local" required value={availabilityEnd} onChange={setAvailabilityEnd} />
                  <Button type="submit" color="primary" variant="outline" fullWidth>Add Open Time</Button>
                </View>
              </form>
            </View>
          </Card>
        ) : <div />}

        <View gap={4}>
          <Text as="h2" variant="featured-5" weight="bold">My Scheduled Consultations</Text>
          {consultations.length === 0 ? (
            <EmptyState title="No consultations requested yet." />
          ) : consultations.map((item) => (
            <Card key={item.id} padding={5}>
              <View direction={{ s: 'column', m: 'row' }} justify="space-between" gap={4}>
                <View gap={1}>
                  <View direction="row" align="center" gap={2}><Clock size={16} aria-hidden="true" /><Text weight="bold">{formatDate(item.booking_slot, dateTime)}</Text></View>
                  <Text variant="caption-1" color="neutral-faded">Expert: {item.expert?.name || item.expert_id} · Client: {item.client?.name || item.client_id}</Text>
                  {item.proposal && <Text variant="caption-1">Proposal: {item.proposal.terms} (${item.proposal.budget})</Text>}
                </View>
                <View align={{ s: 'start', m: 'end' }} gap={2}>
                  <Badge color="warning" variant="faded">{item.status}</Badge>
                  {Number(item.expert_id) === Number(currentUser.id) && (
                    <View direction="row" gap={1} wrap>
                      {['Approved', 'Active', 'Completed', 'Rejected'].map((status) => (
                        <Button key={status} size="small" variant="outline" onClick={() => updateStatus(item.id, status)}>{status}</Button>
                      ))}
                      <Button size="small" color="primary" onClick={() => saveProposal(item.id)}>Proposal</Button>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>
      </Grid>
    </Page>
  );
}
