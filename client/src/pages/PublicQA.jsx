import { useCallback, useState, useEffect } from 'react';
import { Answers, Search, VoteUp } from '../components/icons';
import { Avatar, Badge, Button, Card, Checkbox, Grid, Loader, Radio, RadioGroup, Text, TextField, View } from 'reshaped';
import api from '../api/axios';
import { echo } from '../utils/echo';
import { Page, PageHeader, EmptyState, LinkCard } from '../components/ui'
import { formatDate } from '../utils/format';

export default function PublicQA() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('newest');
  const [status, setStatus] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchQuestions = useCallback(async (page = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const res = await api.get('/questions', {
        params: {
          search: searchTerm || undefined,
          sort,
          filter: status,
          tag: selectedTag || undefined,
          page,
          per_page: 12,
        },
      });
      const data = res.data.data || res.data || [];
      setQuestions((previous) => append ? [...previous, ...data] : data);
      setPagination({
        current_page: res.data.current_page || page,
        last_page: res.data.last_page || 1,
        total: res.data.total ?? data.length,
      });
    } catch (err) {
      console.error(err);
      if (!append) setQuestions([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, selectedTag, sort, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchQuestions(), 250);
    return () => window.clearTimeout(timer);
  }, [fetchQuestions]);

  useEffect(() => {
    api.get('/tags')
      .then((res) => setTags(res.data || []))
      .catch((err) => console.error(err));

    const channel = echo.channel('public-qa');
    channel.listen('.QuestionCreated', (e) => {
      setQuestions((prev) => [e.question, ...prev]);
    });
    channel.listen('.VoteUpdated', (e) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === e.questionId ? { ...q, net_votes: e.net_votes ?? e.votes_count ?? 0 } : q))
      );
    });

    return () => {
      echo.leaveChannel('public-qa');
    };
  }, []);

  return (
    <Page width="1400px">
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

      <Grid columns={{ s: 1, l: '220px minmax(0, 1fr) 240px' }} gap={5} align="start">
        <View className="public-qa-sidebar" attributes={{ 'data-testid': 'discussion-filters' }}>
          <Card padding={4}>
            <View gap={5}>
              <View gap={3}>
                <Text as="h2" variant="body-2" weight="bold">Sort discussions</Text>
                <RadioGroup name="discussion-sort" value={sort} onChange={({ value }) => setSort(value)}>
                  <View gap={3}>
                    <Radio value="newest">Newest</Radio>
                    <Radio value="votes">Most voted</Radio>
                    <Radio value="answers">Most answered</Radio>
                  </View>
                </RadioGroup>
              </View>
              <View gap={3}>
                <Text as="h2" variant="body-2" weight="bold">Answer status</Text>
                <Checkbox
                  name="answer-status-answered"
                  value="answered"
                  checked={status === 'answered'}
                  onChange={({ checked }) => setStatus(checked ? 'answered' : 'all')}
                >
                  Answered
                </Checkbox>
                <Checkbox
                  name="answer-status-unanswered"
                  value="unanswered"
                  checked={status === 'unanswered'}
                  onChange={({ checked }) => setStatus(checked ? 'unanswered' : 'all')}
                >
                  Unanswered
                </Checkbox>
              </View>
              {(sort !== 'newest' || status !== 'all' || selectedTag || searchTerm) && (
                <Button variant="outline" fullWidth onClick={() => { setSort('newest'); setStatus('all'); setSelectedTag(null); setSearchTerm(''); }}>
                  Clear filters
                </Button>
              )}
            </View>
          </Card>
        </View>

        <View gap={4}>
          {!loading && <Text variant="caption-1" color="neutral-faded">{pagination.total} discussions found</Text>}
          {loading ? (
            <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading community feed...</Text></View>
          ) : questions.length === 0 ? (
            <EmptyState title="No discussions found" description="Nothing matches the selected filters." />
          ) : (
            <>
              <View gap={4}>
                {questions.map((q) => (
                  <LinkCard key={q.id || q.slug} to={`/questions/${q.slug}`}>
                    <View direction={{ s: 'column', m: 'row' }} gap={5}>
                      <View align="center" justify="center" gap={0} width={{ s: '100%', m: '64px' }} direction={{ s: 'row', m: 'column' }} borderRadius="medium" backgroundColor="neutral-faded" padding={3}>
                        <VoteUp size={28} filled color="var(--rs-color-foreground-positive)" aria-hidden="true" />
                        <Text variant="body-2" weight="bold">{q.net_votes ?? 0}</Text>
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
                          {(q.tags || []).map((tag) => <Badge key={tag.id || tag.tag_name || tag} variant="faded">{tag.tag_name || tag}</Badge>)}
                          <View gapBefore="auto">
                            <Badge variant="faded" color="primary" icon={Answers}>
                              {q.answers_count || q.answers?.length || 0} Answers
                            </Badge>
                          </View>
                        </View>
                      </View>
                    </View>
                  </LinkCard>
                ))}
              </View>
              {pagination.current_page < pagination.last_page && (
                <View align="center">
                  <Button variant="outline" loading={loadingMore} onClick={() => fetchQuestions(pagination.current_page + 1, true)}>
                    Load more discussions
                  </Button>
                </View>
              )}
            </>
          )}
        </View>

        <View className="public-qa-sidebar" attributes={{ 'data-testid': 'popular-tags' }}>
          <Card padding={4}>
            <View gap={3}>
              <Text as="h2" variant="body-2" weight="bold">Popular tags</Text>
              <View direction="row" gap={2} wrap>
                <Badge
                  size="large"
                  color={selectedTag === null ? 'primary' : 'neutral'}
                  variant="faded"
                  highlighted={selectedTag === null}
                  onClick={() => setSelectedTag(null)}
                >
                  All tags
                </Badge>
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    size="large"
                    color={selectedTag === tag.id ? 'primary' : 'neutral'}
                    variant="faded"
                    highlighted={selectedTag === tag.id}
                    onClick={() => setSelectedTag(tag.id)}
                  >
                    {tag.tag_name} · {tag.questions_count || 0}
                  </Badge>
                ))}
              </View>
            </View>
          </Card>
        </View>
      </Grid>
    </Page>
  );
}
