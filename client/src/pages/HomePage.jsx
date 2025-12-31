import { useState, useEffect } from 'react';
import { Avatar, Badge, Button, Card, Container, Grid, Skeleton, Text, View } from 'reshaped';
import { MessageSquare, Briefcase, Calendar, Mic2, ArrowRight, Sparkles, Hash, VoteUp } from '../components/icons';
import api from '../api/axios';
import { useBranding } from '../context/BrandingContext';
import { routerLink } from '../components/RouterLink';
import { LinkCard, SectionHeading } from '../components/ui';

const modules = [
  { to: '/questions', icon: MessageSquare, title: 'Community Q&A', text: 'Ask coding questions, share insights, and get verified expert solutions.' },
  { to: '/opportunities', icon: Briefcase, title: 'Job Opportunities', text: 'Discover remote developer roles, tech internships, and upload PDF resumes.' },
  { to: '/events', icon: Calendar, title: 'Live Events', text: 'Join virtual webinars and schedule 1-on-1 advisory booking slots.' },
  { to: '/podcasts', icon: Mic2, title: 'Audio Broadcasts', text: 'Listen to technical interviews and career advice published by experts.' },
];

const roles = [
  { title: 'Students & Developers', text: 'Post coding questions, manage project workspaces, share files, and apply to job roles.' },
  { title: 'Faculty Experts', text: 'Offer 1-on-1 advisory consultations, verify accepted answers, and publish podcasts.' },
  { title: 'Recruiters & Employers', text: 'Post opportunities, review applicant resumes, and track candidate pipelines.' },
  { title: 'Administrators', text: 'Moderate content, approve listings, send newsletters, and manage accounts.' },
];

const testimonials = [
  { name: 'Hamza Ali', role: 'Full-Stack Student Developer', quote: 'AQDesk allowed our semester project team to share project assets and generate join tokens instantly without configuring complex permissions.' },
  { name: 'Mr. Abdullah Qamar', role: 'Senior Engineering Consultant', quote: 'As a faculty supervisor, scheduling advisory booking slots and verifying accepted Q&A solutions has streamlined student mentorship significantly.' },
  { name: 'TechCorp Employer', role: 'Technical Talent Partner', quote: 'We posted our junior developer position on the career board and received well-documented PDF applications directly from candidates.' },
];

function CardSkeletons() {
  return [1, 2, 3].map((i) => (
    <Card key={i} padding={5}>
      <View gap={3}>
        <Skeleton width="30%" height={4} />
        <Skeleton width="90%" height={5} />
        <Skeleton width="100%" height={10} />
      </View>
    </Card>
  ));
}

export default function HomePage() {
  const { appName } = useBranding();
  const isSignedIn = !!localStorage.getItem('token');
  const [questions, setQuestions] = useState(null);
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    Promise.allSettled([api.get('/questions'), api.get('/opportunities')]).then(([q, j]) => {
      setQuestions(q.status === 'fulfilled' ? (q.value.data.data || q.value.data || []) : []);
      setJobs(j.status === 'fulfilled' ? (j.value.data.data || j.value.data || []) : []);
    });
  }, []);

  return (
    <View>
      {/* Hero */}
      <View backgroundColor="elevation-base" borderBottom>
        <Container width="1200px" padding={{ s: 4, m: 6, l: 8 }}>
          <Grid columns={{ s: 1, l: '7fr 5fr' }} gap={12} align="center" className="hero-grid">
            <View gap={6} paddingBlock={{ s: 12, l: 20 }}>
              <View direction="row"><Badge color="primary" variant="faded" icon={Sparkles}>{appName} Community &amp; Learning Portal</Badge></View>
              <Text as="h1" variant="featured-1" weight="bold" attributes={{ style: { fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', lineHeight: 1.1, letterSpacing: '-0.02em' } }}>
                Bridge Academic Knowledge with <span style={{ color: 'var(--rs-color-foreground-primary)' }}>Industry Execution</span>
              </Text>
              <View maxWidth="560px">
                <Text variant="body-1" color="neutral-faded">
                  {appName} unifies technical Q&amp;A, collaborative team workspaces, expert mentorship, live webinars, and career opportunities into a single real-time ecosystem.
                </Text>
              </View>
              <View direction="row" gap={3} wrap>
                <Button color="primary" size="xlarge" endIcon={ArrowRight} {...routerLink('/questions')}>Explore Q&amp;A Board</Button>
                <Button variant="outline" size="xlarge" icon={Briefcase} {...routerLink('/opportunities')}>Browse Opportunities</Button>
              </View>
              <View direction="row" gap={8}>
                {[['4.8k+', 'Active Peers'], ['1.2k', 'Solved Threads'], ['350+', 'Tech Gigs']].map(([n, l]) => (
                  <View key={l}>
                    <Text variant="featured-3" weight="bold">{n}</Text>
                    <Text variant="caption-1" color="neutral-faded">{l}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View paddingBlock={{ s: 0, l: 12 }} paddingBottom={{ s: 12 }}>
              <Card padding={6}>
                <View gap={4}>
                  <Text variant="caption-1" weight="bold" color="neutral-faded">LATEST ON THE PLATFORM</Text>
                  {(questions || []).slice(0, 1).map((q) => (
                    <LinkCard key={q.id} to={`/questions/${q.slug}`} padding={4}>
                      <View gap={1}>
                        <View direction="row" align="center" gap={1}><Hash size={14} /><Text variant="caption-1" color="primary">{q.tags?.[0]?.tag_name || 'Discussion'}</Text></View>
                        <Text variant="body-2" weight="bold">{q.title}</Text>
                      </View>
                    </LinkCard>
                  ))}
                  {(jobs || []).slice(0, 1).map((job) => (
                    <LinkCard key={job.id} to={`/opportunities/${job.id}`} padding={4}>
                      <View gap={1}>
                        <View direction="row" align="center" gap={1}><Hash size={14} /><Text variant="caption-1" color="positive">{job.job_type || 'Full-Time'} Opportunity</Text></View>
                        <Text variant="body-2" weight="bold">{job.title}</Text>
                        <Text variant="caption-1" color="neutral-faded">{job.company_name}</Text>
                      </View>
                    </LinkCard>
                  ))}
                  {questions === null && <CardSkeletons />}
                  <Button color="primary" fullWidth {...routerLink(isSignedIn ? '/dashboard' : '/register')}>{isSignedIn ? 'Go to Dashboard' : 'Join the Community'}</Button>
                </View>
              </Card>
            </View>
          </Grid>
        </Container>
      </View>

      {/* Modules */}
      <Container width="1200px" padding={{ s: 4, m: 6, l: 8 }}>
        <View gap={10} paddingBlock={16}>
          <SectionHeading align="center" title="Explore the Platform" description="Tailored modules for Students, Experts, Recruiters, and Administrators." />
          <Grid columns={{ s: 1, m: 2, l: 4 }} gap={5}>
            {modules.map(({ to, icon: Icon, title, text }) => (
              <LinkCard key={to} to={to} padding={6}>
                <View gap={3}>
                  <View width="44px" height="44px" borderRadius="medium" backgroundColor="primary-faded" align="center" justify="center">
                    <Icon size={22} color="var(--rs-color-foreground-primary)" aria-hidden="true" />
                  </View>
                  <Text as="h3" variant="featured-5" weight="bold">{title}</Text>
                  <Text variant="body-2" color="neutral-faded">{text}</Text>
                </View>
              </LinkCard>
            ))}
          </Grid>
        </View>
      </Container>

      {/* Discussions */}
      <View backgroundColor="elevation-base" borderBlock>
        <Container width="1200px" padding={{ s: 4, m: 6, l: 8 }}>
          <View gap={8} paddingBlock={14}>
            <SectionHeading
              eyebrow="Live Knowledge Base"
              title="Recent Community Discussions"
              action={<Button variant="ghost" color="primary" endIcon={ArrowRight} {...routerLink('/questions')}>View all questions</Button>}
            />
            <Grid columns={{ s: 1, m: 3 }} gap={5}>
              {questions === null ? <CardSkeletons /> : questions.slice(0, 3).map((q) => (
                <LinkCard key={q.id} to={`/questions/${q.slug}`}>
                  <View gap={3} height="100%" justify="space-between">
                    <View gap={2}>
                      <View direction="row"><Badge variant="faded" color="primary">{q.tags?.[0]?.tag_name || 'Discussion'}</Badge></View>
                      <Text as="h3" variant="body-1" weight="bold" maxLines={2}>{q.title}</Text>
                      <Text variant="body-2" color="neutral-faded" maxLines={2}>{q.body}</Text>
                    </View>
                    <View direction="row" justify="space-between" align="center" gap={3}>
                      <Text variant="caption-1" color="neutral-faded">By {q.user?.name || 'Developer'}</Text>
                      <View direction="row" align="center" gap={3}>
                        <View direction="row" align="center" gap={1}>
                          <VoteUp size={18} filled color="var(--rs-color-foreground-positive)" aria-hidden="true" />
                          <Text variant="caption-1" weight="bold">{q.net_votes ?? 0} Votes</Text>
                        </View>
                        <Text variant="caption-1" weight="bold" color="primary">{q.answers_count || 0} Answers</Text>
                      </View>
                    </View>
                  </View>
                </LinkCard>
              ))}
            </Grid>
          </View>
        </Container>
      </View>

      {/* Jobs */}
      <Container width="1200px" padding={{ s: 4, m: 6, l: 8 }}>
        <View gap={8} paddingBlock={16}>
          <SectionHeading
            eyebrow="Careers & Opportunities"
            title="Latest Featured Gigs & Roles"
            action={<Button variant="ghost" color="primary" endIcon={ArrowRight} {...routerLink('/opportunities')}>Explore job board</Button>}
          />
          <Grid columns={{ s: 1, m: 3 }} gap={5}>
            {jobs === null ? <CardSkeletons /> : jobs.slice(0, 3).map((job) => (
              <Card key={job.id} padding={5}>
                <View gap={3}>
                  <View direction="row" justify="space-between" align="center">
                    <Badge variant="faded" color="positive">{job.job_type}</Badge>
                    <Text variant="caption-1" color="neutral-faded">{job.location || 'Remote'}</Text>
                  </View>
                  <View>
                    <Text as="h3" variant="body-1" weight="bold">{job.title}</Text>
                    <Text variant="body-2" color="neutral-faded">{job.company_name}</Text>
                  </View>
                  <Text variant="body-2" color="neutral-faded" maxLines={2}>{job.description}</Text>
                  <Button fullWidth color="neutral" {...routerLink(`/opportunities/${job.id}`)}>Apply Now</Button>
                </View>
              </Card>
            ))}
          </Grid>
        </View>
      </Container>

      {/* Roles */}
      <View backgroundColor="elevation-base" borderBlock>
        <Container width="1200px" padding={{ s: 4, m: 6, l: 8 }}>
          <View gap={10} paddingBlock={16}>
            <SectionHeading align="center" title="Designed for Every Tech Stakeholder" description={`How ${appName} powers students, experts, employers, and administrators.`} />
            <Grid columns={{ s: 1, m: 2, l: 4 }} gap={5}>
              {roles.map((role, i) => (
                <Card key={role.title} padding={6}>
                  <View gap={3}>
                    <Avatar size={10} initials={String(i + 1)} color="primary" variant="faded" />
                    <Text as="h3" variant="body-1" weight="bold">{role.title}</Text>
                    <Text variant="body-2" color="neutral-faded">{role.text}</Text>
                  </View>
                </Card>
              ))}
            </Grid>
          </View>
        </Container>
      </View>

      {/* Testimonials */}
      <Container width="1200px" padding={{ s: 4, m: 6, l: 8 }}>
        <View gap={10} paddingBlock={16}>
          <SectionHeading align="center" eyebrow="Community Feedback" title="Trusted by Developers & Faculty" />
          <Grid columns={{ s: 1, m: 3 }} gap={5}>
            {testimonials.map((t) => (
              <Card key={t.name} padding={6}>
                <View gap={4}>
                  <Text variant="body-2" color="neutral-faded">“{t.quote}”</Text>
                  <View direction="row" align="center" gap={3}>
                    <Avatar size={9} initials={t.name.replace(/^(Mr\.|Dr\.)\s*/, '').charAt(0)} />
                    <View>
                      <Text variant="body-2" weight="bold">{t.name}</Text>
                      <Text variant="caption-1" color="neutral-faded">{t.role}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </Grid>
        </View>
      </Container>

      {/* CTA */}
      <View backgroundColor="primary" attributes={{ style: { color: 'var(--rs-color-on-background-primary)' } }}>
        <Container width="1000px" padding={{ s: 4, m: 6, l: 8 }}>
          <View gap={5} align="center" paddingBlock={14} textAlign="center">
            <Text as="h2" variant="featured-2" weight="bold" color="inherit">{isSignedIn ? `Welcome back to ${appName}` : `Ready to Join the ${appName} Community?`}</Text>
            <Text color="inherit">{isSignedIn ? 'Pick up where you left off in your workspaces, discussions and applications.' : 'Create your account today to join Q&A discussions, form team workspaces, and apply to tech opportunities.'}</Text>
            <View direction="row" gap={3} wrap justify="center">
              {isSignedIn ? (
                <Button color="primary" {...routerLink('/dashboard')}>Go to Dashboard</Button>
              ) : (
                <>
                  <Button color="primary" {...routerLink('/register')}>Sign Up Now</Button>
                  <Button variant="outline" color="neutral" {...routerLink('/login')}>Sign In to Account</Button>
                </>
              )}
            </View>
          </View>
        </Container>
      </View>
    </View>
  );
}
