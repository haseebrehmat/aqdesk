import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Loader, Text, View } from 'reshaped';
import { ArrowLeft } from '../../components/icons';
import api from '../../api/axios';
import { useToast } from '../../components/ToastContainer';
import { Page, EmptyState } from '../../components/ui';
import { routerLink } from '../../components/RouterLink';

export default function EventShow() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { addToast, confirm } = useToast();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchEvent = () => api.get(`/events/${id}`).then(response => setEvent(response.data));

    useEffect(() => {
        fetchEvent()
            .catch(error => console.error('Error loading event', error))
            .finally(() => setLoading(false));
    }, [id]);

    const handleRegister = async () => {
        try {
            const response = await api.post(`/events/${id}/register`);
            setEvent(response.data.data);
            addToast('Registered successfully!', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Unable to register.', 'error');
        }
    };

    const handleUnregister = async () => {
        try {
            await api.delete(`/events/${id}/register`);
            await fetchEvent();
            addToast('Unregistered successfully!', 'success');
        } catch {
            addToast('Unable to unregister.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!(await confirm('Delete this event? Registered attendees will lose their registration.', { title: 'Delete event', confirmLabel: 'Delete' }))) return;
        try {
            await api.delete(`/events/${id}`);
            addToast('Event deleted.', 'success');
            navigate(location.pathname.startsWith('/dashboard/') ? '/dashboard/events' : '/events');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to delete the event.', 'error');
        }
    };

    const downloadCalendarInvite = async () => {
        try {
            const response = await api.get(`/events/${id}/calendar`, { responseType: 'blob' });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `aqdesk-event-${id}.ics`;
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            addToast('Unable to download the calendar invitation.', 'error');
        }
    };

    if (loading) return <View align="center" padding={12}><Loader /></View>;
    if (!event) return <Page width="800px"><EmptyState title="Event not found." /></Page>;

    const isRegistered = event.attendees?.some(attendee => attendee.id === currentUser.id);
    const isAdmin = currentUser?.role?.role_name?.toLowerCase() === 'admin';
    const canManage = !!currentUser?.id && (isAdmin || event.creator_id === currentUser.id);
    const backTo = location.pathname.startsWith('/dashboard/') ? '/dashboard/events' : '/events';

    return (
        <Page width="800px">
            <View direction="row"><Button variant="ghost" icon={ArrowLeft} {...routerLink(backTo)}>Back to Events</Button></View>
            <Card padding={6}>
                <View gap={4}>
                    <View direction="row"><Badge color="primary" variant="faded">{event.status}</Badge></View>
                    <Text as="h1" variant="featured-2" weight="bold">{event.title}</Text>
                    <Text color="neutral-faded">Hosted by {event.host?.name}</Text>
                    <Text attributes={{ style: { whiteSpace: 'pre-line' } }}>{event.description}</Text>
                    <Text variant="body-2" color="neutral-faded">
                        Attendance: {event.attendees_count || 0}{event.max_attendees ? ` / ${event.max_attendees}` : ' (unlimited)'}
                    </Text>
                    <View direction="row" gap={2} borderTop paddingTop={4}>
                        {isRegistered ? (
                            <>
                                <Button color="primary" onClick={downloadCalendarInvite}>Add to Calendar</Button>
                                <Button variant="outline" onClick={handleUnregister}>Unregister</Button>
                            </>
                        ) : (
                            <Button color="primary" onClick={handleRegister} disabled={event.is_full}>
                                {event.is_full ? 'Fully Booked' : 'Register'}
                            </Button>
                        )}
                    </View>
                    {canManage && (
                        <View direction="row" gap={2}>
                            <Button variant="outline" {...routerLink(`/dashboard/events/${event.id}/edit`)}>Edit Event</Button>
                            <Button variant="outline" color="critical" onClick={handleDelete}>Delete Event</Button>
                        </View>
                    )}
                </View>
            </Card>
        </Page>
    );
}
