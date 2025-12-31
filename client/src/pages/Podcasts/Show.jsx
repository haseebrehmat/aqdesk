import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Badge, Button, Card, Divider, Image, Loader, Text, View } from 'reshaped';
import { ArrowLeft } from '../../components/icons';
import api from '../../api/axios';
import { Page, EmptyState } from '../../components/ui';
import { routerLink } from '../../components/RouterLink';

export default function PodcastShow() {
    const { id } = useParams();
    const location = useLocation();
    const [podcast, setPodcast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/podcasts/${id}`)
            .then(response => setPodcast(response.data))
            .catch(error => console.error('Error loading podcast', error))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading podcast...</Text></View>;
    if (!podcast) return <Page width="800px"><EmptyState title="Podcast episode not found." /></Page>;

    const backTo = location.pathname.startsWith('/dashboard/') ? '/dashboard/podcasts' : '/podcasts';

    return (
        <Page width="800px">
            <View direction="row"><Button variant="ghost" icon={ArrowLeft} {...routerLink(backTo)}>Back to Podcasts</Button></View>
            <Card padding={6}>
                <View gap={5}>
                    <View direction="row" align="center" gap={4}>
                        {podcast.cover_image_url && <Image src={podcast.cover_image_url} alt={podcast.title} width="96px" height="96px" borderRadius="large" />}
                        <View gap={1}>
                            <Text as="h1" variant="featured-2" weight="bold">{podcast.title}</Text>
                            <Text color="neutral-faded">Expert: {podcast.expert?.name}</Text>
                            {podcast.duration_in_minutes && <View direction="row"><Badge variant="faded">{podcast.duration_in_minutes} minutes</Badge></View>}
                        </View>
                    </View>
                    <Divider />
                    <View gap={2}>
                        <Text as="h2" variant="body-2" weight="bold">Episode Audio</Text>
                        <audio controls style={{ width: '100%' }}>
                            <source src={podcast.media_url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </View>
                    <Divider />
                    <View gap={2}>
                        <Text as="h2" variant="body-2" weight="bold">Description</Text>
                        <Text color="neutral-faded" attributes={{ style: { whiteSpace: 'pre-line' } }}>
                            {podcast.description || 'No description provided for this episode.'}
                        </Text>
                    </View>
                </View>
            </Card>
        </Page>
    );
}
