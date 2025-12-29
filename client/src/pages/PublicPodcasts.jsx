import { useState, useEffect } from 'react';
import { Button, Card, Loader, Text, View } from 'reshaped';
import { Mic2, Play } from 'lucide-react';
import api from '../api/axios';
import { Page, PageHeader, EmptyState } from '../components/ui';

export default function PublicPodcasts() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/podcasts')
      .then(res => setPodcasts(res.data.data || res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page width="1000px">
      <PageHeader title="Podcasts & Technical Interviews" description="Listen to software engineering deep-dives and career discussions." />

      {loading ? (
        <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading broadcasts...</Text></View>
      ) : podcasts.length === 0 ? (
        <EmptyState title="No podcasts available yet" description="New episodes will appear here." />
      ) : (
        <View gap={4}>
          {podcasts.map((pod) => (
            <Card key={pod.id} padding={5}>
              <View direction={{ s: 'column', m: 'row' }} align={{ s: 'start', m: 'center' }} justify="space-between" gap={4}>
                <View direction="row" align="center" gap={4}>
                  <View width="56px" height="56px" borderRadius="large" backgroundColor="primary-faded" align="center" justify="center" shrink={false}>
                    <Mic2 size={26} color="var(--rs-color-foreground-primary)" aria-hidden="true" />
                  </View>
                  <View gap={1}>
                    <Text as="h2" variant="featured-5" weight="bold">{pod.title}</Text>
                    <Text variant="body-2" color="neutral-faded" maxLines={1}>{pod.description}</Text>
                    <Text variant="caption-1" color="neutral-faded">Host: {pod.expert?.name || 'Expert Consultant'}</Text>
                  </View>
                </View>
                {pod.media_url && (
                  <Button color="primary" icon={Play} href={pod.media_url} attributes={{ target: '_blank', rel: 'noreferrer' }}>Listen</Button>
                )}
              </View>
            </Card>
          ))}
        </View>
      )}
    </Page>
  );
}
