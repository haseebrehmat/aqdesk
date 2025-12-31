import { useState, useEffect } from 'react';
import { MessageSquare, ArrowUp, Search } from '../components/icons';
import { Avatar, Badge, Card, Loader, Text, TextField, View } from 'reshaped';
import api from '../api/axios';
import { echo } from '../utils/echo';
import { Page, PageHeader, EmptyState } from '../components/ui'
import { formatDate } from '../utils/format';
import { routerLink } from '../components/RouterLink';

export default function PublicQA() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuestions();

    const channel = echo.channel('public-qa');
    channel.listen('.QuestionCreated', (e) => {
      setQuestions((prev) => [e.question, ...prev]);
    });
    channel.listen('.VoteUpdated', (e) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === e.questionId ? { ...q, votes_count: e.votes_count } : q))
      );
    });

    return () => {
      echo.leaveChannel('public-qa');
    };
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions');
      setQuestions(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = questions.filter(q =>
    q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Page width="1000px">
      <PageHeader title="Developer Knowledge Feed" description="Ask technical questions, share code snippets, and solve bugs together." />

      <TextField
        name="search"
        icon={Search}
        size="large"
        placeholder="Search discussions by keyword, error log, or topic..."
        value={searchTerm}
        onChange={({ value }) => setSearchTerm(value)}
        inputAttributes={{ type: 'search', 'aria-label': 'Search discussions' }}
      />

      {loading ? (
        <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading community feed...</Text></View>
      ) : filtered.length === 0 ? (
        <EmptyState title="No discussions found" description="Nothing matches your search." />
      ) : (
        <View gap={4}>
          {filtered.map((q) => (
            <Card key={q.id || q.slug} padding={5} {...routerLink(`/questions/${q.slug}`)}>
              <View direction={{ s: 'column', m: 'row' }} gap={5}>
                <View align="center" justify="center" gap={0} width={{ s: '100%', m: '64px' }} direction={{ s: 'row', m: 'column' }} borderRadius="medium" backgroundColor="neutral-faded" padding={3}>
                  <ArrowUp size={16} color="var(--rs-color-foreground-positive)" aria-hidden="true" />
                  <Text variant="body-2" weight="bold">{q.votes_count || 0}</Text>
                  <Text variant="caption-2" color="neutral-faded">Votes</Text>
                </View>
                <View gap={3} grow attributes={{ style: { minWidth: 0 } }}>
                  <View direction="row" align="center" gap={2}>
                    <Avatar size={6} initials={(q.user?.name || 'D').charAt(0)} />
                    <Text variant="caption-1" weight="bold">{q.user?.name || 'Anonymous Peer'}</Text>
                    <Text variant="caption-1" color="neutral-faded">• {formatDate(q.created_at)}</Text>
                  </View>
                  <Text as="h2" variant="featured-5" weight="bold">{q.title}</Text>
                  <Text variant="body-2" color="neutral-faded" maxLines={2}>{q.body}</Text>
                  <View direction="row" align="center" gap={2} wrap>
                    {(q.tags || []).map((tag, idx) => <Badge key={idx} variant="faded">{tag.tag_name || tag}</Badge>)}
                    <View gapBefore="auto">
                      <Badge color="primary" variant="faded" icon={MessageSquare}>{q.answers_count || q.answers?.length || 0} Answers</Badge>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Page>
  );
}
