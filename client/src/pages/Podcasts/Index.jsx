import { useState, useEffect } from 'react';
import { Badge, Button, Card, Image, Loader, Text, View } from 'reshaped';
import api from '../../api/axios';
import { useToast } from '../../components/ToastContainer';
import { Page, PageHeader, EmptyState } from '../../components/ui';
import { routerLink } from '../../components/RouterLink';

export default function PodcastIndex() {
    const { addToast } = useToast();
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        api.get('/podcasts')
            .then(response => setPodcasts(response.data.data || response.data))
            .catch(error => {
                console.error(error);
                addToast('Failed to load podcasts.', 'error');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading podcasts...</Text></View>;
    }

    return (
        <Page>
            <PageHeader
                title="Expert Podcasts"
                description="Listen to episodes from the community or publish your own."
                actions={<Button color="primary" {...routerLink('/dashboard/podcasts/create')}>Publish Podcast</Button>}
            />

            {podcasts.length === 0 ? (
                <EmptyState title="No podcast episodes found" description="Be the first one to publish a podcast episode!" />
            ) : (
                <View gap={4}>
                    {podcasts.map((podcast) => {
                        const isHost = podcast.expert_id === currentUser?.id || podcast.expert?.id === currentUser?.id;
                        return (
                            <Card key={podcast.id} padding={5}>
                                <View direction={{ s: 'column', m: 'row' }} justify="space-between" align={{ s: 'start', m: 'center' }} gap={4}>
                                    <View direction="row" align="center" gap={4} grow>
                                        {podcast.cover_image_url && (
                                            <Image src={podcast.cover_image_url} alt={podcast.title} width="64px" height="64px" borderRadius="medium" />
                                        )}
                                        <View gap={1}>
                                            <View direction="row" align="center" gap={2}>
                                                {isHost && <Badge color="positive" variant="faded">Your Episode</Badge>}
                                                {podcast.duration_in_minutes && <Text variant="caption-1" color="neutral-faded">{podcast.duration_in_minutes} mins</Text>}
                                            </View>
                                            <Button variant="ghost" color="primary" {...routerLink(`/dashboard/podcasts/${podcast.id}`)}>{podcast.title}</Button>
                                            <Text variant="caption-1" color="neutral-faded">Expert: {podcast.expert?.name || 'Anonymous'}</Text>
                                        </View>
                                    </View>
                                    <audio controls style={{ maxWidth: 280, width: '100%' }}>
                                        <source src={podcast.media_url} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </View>
                            </Card>
                        );
                    })}
                </View>
            )}
        </Page>
    );
}
