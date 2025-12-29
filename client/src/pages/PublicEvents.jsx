import { useState, useEffect } from 'react';
import { Badge, Button, Card, Grid, Loader, Text, View } from 'reshaped';
import { Video, Users } from 'lucide-react';
import api from '../api/axios';
import { echo } from '../utils/echo';
import { Page, PageHeader, EmptyState } from '../components/ui'
import { formatDate } from '../utils/format';

export default function PublicEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data.data || res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    const channel = echo.channel('public-events');
    channel.listen('.EventAttendeeRegistered', (e) => {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === e.eventId ? { ...ev, attendees_count: (ev.attendees_count || 0) + 1 } : ev
        )
      );
    });

    return () => echo.leaveChannel('public-events');
  }, []);

  return (
    <Page width="1000px">
      <PageHeader title="Live Tech Workshops & Webinars" description="Join scheduled live sessions and workshops hosted by experienced engineers." />

      {loading ? (
        <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading events...</Text></View>
      ) : events.length === 0 ? (
        <EmptyState title="No upcoming events found" description="New sessions are announced regularly." />
      ) : (
        <Grid columns={{ s: 1, m: 2, l: 3 }} gap={5}>
          {events.map((ev) => (
            <Card key={ev.id} padding={5}>
              <View gap={4} height="100%" justify="space-between">
                <View gap={3}>
                  <View direction="row" justify="space-between" align="center">
                    <Badge color="primary" variant="faded">{formatDate(ev.scheduled_at)}</Badge>
                    <View direction="row" align="center" gap={1}>
                      <Users size={14} aria-hidden="true" />
                      <Text variant="caption-1" color="neutral-faded">{ev.attendees_count || 0}{ev.max_attendees ? ` / ${ev.max_attendees}` : ''} registered</Text>
                    </View>
                  </View>
                  <Text as="h2" variant="featured-5" weight="bold">{ev.title}</Text>
                  <Text variant="body-2" color="neutral-faded" maxLines={3}>{ev.description}</Text>
                </View>
                <View direction="row" justify="space-between" align="center" borderTop paddingTop={3}>
                  <Text variant="caption-1" color="neutral-faded">Host: {ev.host?.name || 'Expert'}</Text>
                  {ev.webinar_url && (
                    <Button variant="ghost" color="primary" size="small" icon={Video} href={ev.webinar_url} attributes={{ target: '_blank', rel: 'noreferrer' }}>Join session</Button>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </Grid>
      )}
    </Page>
  );
}
