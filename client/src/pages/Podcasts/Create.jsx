import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Text, View } from 'reshaped';
import { formatDuration } from '../../utils/format';
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
        cover_image_url: '',
    });
    const [audio, setAudio] = useState(null);
    const [durationSeconds, setDurationSeconds] = useState(0);
    const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleAudio = (e) => {
        const file = e.target.files[0] || null;
        setAudio(file);
        setDurationSeconds(0);
        if (!file) return;
        // Read the length from the file itself so listeners see the runtime.
        const url = URL.createObjectURL(file);
        const probe = new Audio();
        probe.preload = 'metadata';
        probe.onloadedmetadata = () => {
            if (Number.isFinite(probe.duration)) setDurationSeconds(Math.round(probe.duration));
            URL.revokeObjectURL(url);
        };
        probe.onerror = () => URL.revokeObjectURL(url);
        probe.src = url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!audio) {
            setErrors({ audio: ['Please choose an MP3 file.'] });
            return;
        }
        setSubmitting(true);
        setErrors({});

        try {
            const body = new FormData();
            Object.entries(form).forEach(([k, v]) => v && body.append(k, v));
            body.append('audio', audio);
            if (durationSeconds) body.append('duration_in_seconds', durationSeconds);
            await api.post('/podcasts', body, { headers: { 'Content-Type': 'multipart/form-data' } });
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
                        <View gap={2}>
                            <Text as="label" variant="body-2" weight="medium" attributes={{ htmlFor: 'audio-upload' }}>Audio File (MP3)</Text>
                            <input id="audio-upload" type="file" accept="audio/mpeg,.mp3" onChange={handleAudio} />
                            <Text variant="caption-1" color="neutral-faded">MP3 only, up to 100 MB.{durationSeconds ? ` Length: ${formatDuration(durationSeconds)}` : ''}</Text>
                            {errors.audio && <Text variant="caption-1" color="critical" attributes={{ role: 'alert' }}>{errors.audio[0]}</Text>}
                        </View>
                        <FormField label="Cover Image URL" name="cover_image_url" type="url" value={form.cover_image_url} onChange={set('cover_image_url')} error={errors.cover_image_url} />
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
