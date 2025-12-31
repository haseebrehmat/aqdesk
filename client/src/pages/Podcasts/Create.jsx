import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, View } from 'reshaped';
import api from '../../api/axios';
import { useToast } from '../../components/ToastContainer';
import { Page, PageHeader, FormField } from '../../components/ui';
import { routerLink } from '../../components/RouterLink';

export default function PodcastCreate() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        title: '',
        description: '',
        media_url: '',
        cover_image_url: '',
        duration_in_minutes: '',
    });
    const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await api.post('/podcasts', form);
            addToast('Podcast episode published successfully!', 'success');
            navigate('/dashboard/podcasts');
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                addToast('Please check the form for validation errors.', 'error');
            } else {
                addToast(error.response?.data?.message || 'Failed to publish podcast episode.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Page width="720px">
            <PageHeader title="Publish Podcast" description="Share a new episode with the community." />
            <Card padding={6}>
                <form onSubmit={handleSubmit}>
                    <View gap={4}>
                        <FormField label="Title" name="title" value={form.title} onChange={set('title')} error={errors.title} />
                        <FormField label="Description" name="description" multiline value={form.description} onChange={set('description')} error={errors.description} />
                        <FormField label="Media URL" name="media_url" type="url" value={form.media_url} onChange={set('media_url')} error={errors.media_url} />
                        <FormField label="Cover Image URL" name="cover_image_url" type="url" value={form.cover_image_url} onChange={set('cover_image_url')} error={errors.cover_image_url} />
                        <FormField label="Duration (minutes)" name="duration_in_minutes" type="number" value={form.duration_in_minutes} onChange={set('duration_in_minutes')} error={errors.duration_in_minutes} />
                        <View direction="row" justify="end" gap={2} borderTop paddingTop={4}>
                            <Button variant="outline" {...routerLink('/dashboard/podcasts')}>Cancel</Button>
                            <Button type="submit" color="primary" loading={submitting}>Publish</Button>
                        </View>
                    </View>
                </form>
            </Card>
        </Page>
    );
}
