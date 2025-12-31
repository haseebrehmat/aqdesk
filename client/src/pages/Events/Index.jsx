import { useState, useEffect } from 'react';
import { Badge, Button, Card, Loader, Text, View } from 'reshaped';
import api from '../../api/axios';
import { useToast } from '../../components/ToastContainer';
import { Page, PageHeader, EmptyState } from '../../components/ui'
import { formatDate } from '../../utils/format';
import { routerLink } from '../../components/RouterLink';

export default function EventIndex() {
    const { addToast, confirm } = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching events', error);
            addToast('Failed to load events.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const isAdmin = currentUser?.role?.role_name?.toLowerCase() === 'admin';

    const handleDelete = async (eventId) => {
        if (!(await confirm('Delete this event? Registered attendees will lose their registration.', { title: 'Delete event', confirmLabel: 'Delete' }))) return;
        try {
            await api.delete(`/events/${eventId}`);
            setEvents((list) => list.filter((e) => e.id !== eventId));
            addToast('Event deleted.', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to delete the event.', 'error');
        }
    };

    const handleRegister = async (eventId) => {
        try {
            await api.post(`/events/${eventId}/register`);
            addToast('Successfully registered for the event!', 'success');
            fetchEvents();
        } catch (error) {
            addToast(error.response?.data?.message || 'Error registering for event', 'error');
        }
    };

    if (loading) {
        return (
            <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading events...</Text></View>
        );
    }

    const when = (v) => formatDate(v, { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <Page>
            <PageHeader
                title="Events & Webinars"
                description="Register for live sessions or host your own."
                actions={<Button color="primary" {...routerLink('/dashboard/events/create')}>Create Event</Button>}
            />

            {events.length === 0 ? (
                <EmptyState title="No events found" description="Be the first one to create an event!" />
            ) : (
                <View gap={4}>
                    {events.map((event) => {
                        const isHost = event.creator_id === currentUser?.id || event.host?.id === currentUser?.id;
                        const isRegistered = event.attendees?.some((attendee) => attendee.id === currentUser?.id);
                        return (
                            <Card key={event.id} padding={5}>
                                <View direction={{ s: 'column', m: 'row' }} justify="space-between" gap={4}>
                                    <View gap={2} grow>
                                        <View direction="row" gap={2}>
                                            <Badge color="primary" variant="faded">{event.status}</Badge>
                                            {isHost && <Badge color="positive" variant="faded">Host</Badge>}
                                        </View>
                                        <Text as="h2" variant="featured-5" weight="bold">{event.title}</Text>
                                        <Text variant="body-2" color="neutral-faded" maxLines={2}>{event.description}</Text>
                                        <View gap={1}>
                                            {event.scheduled_at && <Text variant="caption-1" color="neutral-faded">Scheduled: {when(event.scheduled_at)}</Text>}
                                            {event.ends_at && <Text variant="caption-1" color="neutral-faded">Ends: {when(event.ends_at)}</Text>}
                                            <Text variant="caption-1" color="neutral-faded">Attendance: {event.attendees_count || 0}{event.max_attendees ? ` / ${event.max_attendees}` : ''}</Text>
                                        </View>
                                    </View>
                                    <View align={{ s: 'start', m: 'end' }} justify="space-between" gap={3}>
                                        <Text variant="caption-1" color="neutral-faded">Host: {event.host?.name || 'Anonymous'}</Text>
                                        <View direction="row" align="center" gap={2} wrap>
                                            {(isHost || isAdmin) && (
                                                <>
                                                    <Button variant="outline" size="small" {...routerLink(`/dashboard/events/${event.id}/edit`)}>Edit</Button>
                                                    <Button variant="outline" size="small" color="critical" onClick={() => handleDelete(event.id)}>Delete</Button>
                                                </>
                                            )}
                                            <Button variant="ghost" color="primary" {...routerLink(`/dashboard/events/${event.id}`)}>View Details →</Button>
                                            {isHost ? (
                                                <Badge color="positive" variant="faded">Hosting</Badge>
                                            ) : isRegistered ? (
                                                <Badge variant="faded">Registered</Badge>
                                            ) : event.is_full ? (
                                                <Badge color="warning" variant="faded">Fully Booked</Badge>
                                            ) : (
                                                <Button color="primary" onClick={() => handleRegister(event.id)}>Register</Button>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </Card>
                        );
                    })}
                </View>
            )}
        </Page>
    );
}
