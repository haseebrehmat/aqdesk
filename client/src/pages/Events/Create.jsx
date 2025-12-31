import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, View } from 'reshaped';
import api from '../../api/axios';
import { useToast } from '../../components/ToastContainer';
import { Page, PageHeader, FormField } from '../../components/ui';
import { routerLink } from '../../components/RouterLink';

export default function EventCreate() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        webinar_url: '',
        scheduled_at: '',
        ends_at: '',
        max_attendees: '',
    });
    const [errors, setErrors] = useState({});
    const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await api.post('/events', form);
            addToast('Event created successfully!', 'success');
            navigate('/dashboard/events');
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                addToast('Please check the form for validation errors.', 'error');
            } else {
                addToast(error.response?.data?.message || 'Failed to create event.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Page width="720px">
            <PageHeader title="Create Event" description="Schedule a webinar or workshop for the community." />
            <Card padding={6}>
                <form onSubmit={handleSubmit}>
                    <View gap={4}>
                        <FormField label="Title" name="title" value={form.title} onChange={set('title')} error={errors.title} />
                        <FormField label="Description" name="description" multiline value={form.description} onChange={set('description')} error={errors.description} />
                        <FormField label="Webinar URL" name="webinar_url" type="url" value={form.webinar_url} onChange={set('webinar_url')} error={errors.webinar_url} />
                        <View direction={{ s: 'column', m: 'row' }} gap={4}>
                            <View grow><FormField label="Scheduled At" name="scheduled_at" type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')} error={errors.scheduled_at} /></View>
                            <View grow><FormField label="Ends At" name="ends_at" type="datetime-local" value={form.ends_at} onChange={set('ends_at')} error={errors.ends_at} /></View>
                        </View>
                        <FormField label="Maximum Attendees" name="max_attendees" type="number" min="1" placeholder="Leave blank for unlimited" value={form.max_attendees} onChange={set('max_attendees')} error={errors.max_attendees} />
                        <View direction="row" justify="end" gap={2} borderTop paddingTop={4}>
                            <Button variant="outline" {...routerLink('/dashboard/events')}>Cancel</Button>
                            <Button type="submit" color="primary" loading={submitting}>Save Event</Button>
                        </View>
                    </View>
                </form>
            </Card>
        </Page>
    );
}
